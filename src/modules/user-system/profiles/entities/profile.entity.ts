import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

@Entity({ comment: "用户信息" })
export class Profile {
  @PrimaryGeneratedColumn({ comment: "主键ID" })
  id: number;
  @Column({ comment: "昵称" })
  nickname: string;
  @CreateDateColumn({ comment: "创建时间" })
  createdAt: Date;
  @UpdateDateColumn({ comment: "更新时间" })
  updatedAt: Date;
  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn()
  user: User;
}
