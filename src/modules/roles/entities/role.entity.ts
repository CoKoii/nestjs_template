import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Permission } from "../../permissions/entities/permission.entity";
import { User } from "../../users/entities/user.entity";

@Entity({ comment: "角色" })
export class Role {
  @PrimaryGeneratedColumn({ comment: "主键ID" })
  id: number;
  @Column({ comment: "角色名称", length: 50, unique: true })
  roleName: string;
  @Column({ comment: "角色描述", length: 255, nullable: true })
  description?: string;
  @Column({ comment: "状态", default: true, nullable: true })
  status?: boolean;
  @CreateDateColumn({ comment: "创建时间" })
  createdAt: Date;
  @UpdateDateColumn({ comment: "更新时间" })
  updatedAt: Date;
  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable({ name: "roles_permissions" })
  permissions: Permission[];
}
