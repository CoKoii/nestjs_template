import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "../../roles/entities/role.entity";

@Entity({ comment: "权限码" })
export class Permission {
  @PrimaryGeneratedColumn({ comment: "权限ID" })
  id: number;
  @Column({ comment: "权限码", unique: true })
  code: string;
  @Column({ comment: "权限描述", nullable: true })
  description: string;
  @Column({ comment: "状态", default: true })
  status: boolean;
  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
