import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Profile } from "../../profiles/entities/profile.entity";
import { Role } from "../../roles/entities/role.entity";

@Entity({ comment: "用户" })
export class User {
  @PrimaryGeneratedColumn({ comment: "用户ID" })
  id: number;
  @Column({ comment: "用户名", unique: true })
  username: string;
  @Column({ comment: "用户密码", select: false })
  password: string;
  @CreateDateColumn({ comment: "创建时间" })
  createdAt: Date;
  @UpdateDateColumn({ comment: "更新时间" })
  updatedAt: Date;
  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
  profile: Profile;
  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({ name: "users_roles" })
  roles: Role[];
}
