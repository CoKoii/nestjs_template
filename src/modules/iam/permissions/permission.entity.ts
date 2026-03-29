import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from "typeorm";
import { Role } from "../roles/role.entity";

@Entity({ name: "permissions", comment: "权限码" })
export class Permission {
  @PrimaryGeneratedColumn({ comment: "权限ID" })
  id!: number;
  @Column({ comment: "权限码", length: 50, unique: true })
  code!: string;
  @Column({ comment: "权限描述", length: 255, nullable: true })
  description!: string;
  @Column({ comment: "状态", default: true })
  status!: boolean;
  @CreateDateColumn({ comment: "创建时间" })
  createdAt!: Date;
  @UpdateDateColumn({ comment: "更新时间" })
  updatedAt!: Date;
  @ManyToMany(() => Role, (role) => role.permissions)
  roles!: Relation<Role[]>;
}
