import {
  Controller,
  Get,
  Post,
  // NotFoundException,
  Inject,
  type LoggerService,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {
    this.logger.log('UserController initialized');
  }
  @Get()
  getUsers() {
    // const user = { isAdmin: false };
    // if (!user.isAdmin) {
    //   throw new NotFoundException('用户不存在');
    // }
    this.logger.log('获取用户列表');
    this.logger.warn('获取用户列表');
    this.logger.error('获取用户列表');
    return this.userService.findAll();
  }

  @Post()
  addUser() {
    const user = { username: 'test', password: 'test' } as Partial<User>;
    return this.userService.create(user);
  }

  @Get('profile')
  getUserProfile() {
    return this.userService.findProfile(2);
  }

  @Get('logs')
  getUserLogs() {
    return this.userService.findLogs(2);
  }

  @Get('logsByGrop')
  async getUserLogsByGrop(): Promise<any> {
    const res = await this.userService.findLogsByGroup(2);
    return res.map((item: { result: string; count: number }) => ({
      result: item.result,
      count: item.count,
    }));
  }
}
