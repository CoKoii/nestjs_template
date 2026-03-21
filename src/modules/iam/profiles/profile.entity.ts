import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../users/user.entity";

@Entity({ name: "profiles", comment: "用户资料" })
export class Profile {
  @PrimaryGeneratedColumn({ comment: "主键ID" })
  id!: number;
  @Column({ comment: "昵称", length: 50 })
  nickname!: string;
  @CreateDateColumn({ comment: "创建时间" })
  createdAt!: Date;
  @UpdateDateColumn({ comment: "更新时间" })
  updatedAt!: Date;
  @OneToOne(() => User, (user) => user.profile, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: Relation<User>;
}
