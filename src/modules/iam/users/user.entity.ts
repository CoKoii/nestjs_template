import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from "typeorm";
import { Profile } from "../profiles/profile.entity";
import { Role } from "../roles/role.entity";

@Entity({ name: "users", comment: "用户" })
export class User {
  @PrimaryGeneratedColumn({ comment: "用户ID" })
  id!: number;
  @Column({ comment: "用户名", length: 50, unique: true })
  username!: string;
  @Column({ comment: "用户密码", length: 255, select: false })
  password!: string;
  @Column({ comment: "账户状态", default: true })
  status!: boolean;
  @CreateDateColumn({ comment: "创建时间" })
  createdAt!: Date;
  @UpdateDateColumn({ comment: "更新时间" })
  updatedAt!: Date;
  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
  profile!: Relation<Profile>;
  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({ name: "users_roles" })
  roles!: Relation<Role[]>;
}
