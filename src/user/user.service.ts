import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import type { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Logs } from '../logs/logs.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Logs) private readonly logsRepository: Repository<Logs>,
  ) {}

  findAll() {
    return this.userRepository.find();
  }

  findOne(username: string) {
    return this.userRepository.findOne({ where: { username } });
  }

  create(user: Partial<User>) {
    const userTmp = this.userRepository.create(user);
    return this.userRepository.save(userTmp);
  }

  update(id: number, user: Partial<User>) {
    return this.userRepository.update(id, user);
  }

  remove(id: number) {
    return this.userRepository.delete(id);
  }
  findProfile(id: number) {
    return this.userRepository.findOne({
      where: { id },
      relations: {
        profile: true,
      },
    });
  }
  async findLogs(id: number) {
    return this.logsRepository.find({
      where: { user: { id } },
      relations: {
        user: true,
      },
    });
  }
  findLogsByGroup(id: number) {
    return this.logsRepository
      .createQueryBuilder('logs')
      .select('logs.result', 'result')
      .addSelect('COUNT(logs.result)', 'count')
      .leftJoinAndSelect('logs.user', 'user')
      .where('user.id = :id', { id })
      .groupBy('logs.result')
      .orderBy('result', 'DESC')
      .getRawMany();
  }
}
