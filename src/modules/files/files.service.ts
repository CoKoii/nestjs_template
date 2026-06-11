import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { randomUUID } from "node:crypto";
import { extname } from "node:path";
import { In, LessThan, Repository } from "typeorm";
import { OssService } from "../../common/oss/oss.service";
import type { CreateUploadIntentDto } from "./dto/create-upload-intent.dto";
import { FILE_STATUS, FileEntity, type FileStatus } from "./file.entity";

const TEMPORARY_STATUSES: FileStatus[] = [
  FILE_STATUS.PENDING,
  FILE_STATUS.UPLOADED,
];

const normalizeExtension = (filename: string) =>
  extname(filename)
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, "");

const createObjectKey = (userId: number, filename: string) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  const extension = normalizeExtension(filename);

  return `temporary/${year}/${month}/${day}/user-${userId}/${randomUUID()}${extension}`;
};

const assertStatus = (
  file: FileEntity,
  allowedStatuses: FileStatus[],
  message: string,
) => {
  if (!allowedStatuses.includes(file.status)) {
    throw new BadRequestException(message);
  }
};

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly filesRepository: Repository<FileEntity>,
    private readonly ossService: OssService,
  ) {}

  private async findOwnedFile(id: number, userId: number) {
    const file = await this.filesRepository.findOne({ where: { id } });

    if (!file) {
      throw new NotFoundException("文件不存在");
    }

    if (file.userId !== userId) {
      throw new ForbiddenException("无权访问该文件");
    }

    return file;
  }

  async createUploadIntent(dto: CreateUploadIntentDto, userId: number) {
    if (dto.size > this.ossService.uploadMaxSize) {
      throw new BadRequestException("文件大小超过限制");
    }

    const objectKey = createObjectKey(userId, dto.filename);
    const url = this.ossService.getPublicUrl(objectKey);
    const upload = this.ossService.createUploadUrl(objectKey, dto.contentType);
    const file = await this.filesRepository.save(
      this.filesRepository.create({
        userId,
        originalName: dto.filename,
        contentType: dto.contentType,
        size: dto.size,
        objectKey,
        url,
        status: FILE_STATUS.PENDING,
      }),
    );

    return { file, upload };
  }

  async complete(id: number, userId: number) {
    const file = await this.findOwnedFile(id, userId);

    assertStatus(file, [FILE_STATUS.PENDING], "文件状态不允许完成上传");

    file.status = FILE_STATUS.UPLOADED;
    return this.filesRepository.save(file);
  }

  findOne(id: number, userId: number) {
    return this.findOwnedFile(id, userId);
  }

  async remove(id: number, userId: number) {
    const file = await this.findOwnedFile(id, userId);

    await this.ossService.deleteObject(file.objectKey);
    await this.filesRepository.delete(file.id);
    return "删除成功";
  }

  async markUsed(id: number, userId: number) {
    const file = await this.findOwnedFile(id, userId);

    if (file.status === FILE_STATUS.USED) {
      return file;
    }

    assertStatus(file, [FILE_STATUS.UPLOADED], "文件尚未上传完成");

    file.status = FILE_STATUS.USED;
    file.usedAt = new Date();
    return this.filesRepository.save(file);
  }

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredTemporaryFiles() {
    if (!this.ossService.enabled) {
      return;
    }

    const expiredAt = new Date(
      Date.now() - this.ossService.tempExpiresInHours * 60 * 60 * 1000,
    );
    const files = await this.filesRepository.find({
      where: {
        status: In(TEMPORARY_STATUSES),
        createdAt: LessThan(expiredAt),
      },
      take: 100,
    });

    for (const file of files) {
      await this.ossService.deleteObject(file.objectKey);
      await this.filesRepository.delete(file.id);
    }
  }
}
