import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import { Profile } from "./entities/profile.entity";

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}
  findOne(userId: number) {
    return this.profileRepository.findOne({
      where: { user: { id: userId } },
    });
  }
}
