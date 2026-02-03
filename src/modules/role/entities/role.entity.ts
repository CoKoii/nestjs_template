import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";

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
  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}
