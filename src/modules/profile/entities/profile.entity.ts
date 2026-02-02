import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../../user/entities/user.entity";

@Entity({ comment: "用户信息" })
export class Profile {
  @PrimaryGeneratedColumn({ comment: "主键ID" })
  id: number;
  @Column({ comment: "昵称" })
  nickname: string;
  @Column({ comment: "邮箱", unique: true })
  email: string;
  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn()
  user: User;
}
