import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ comment: "用户" })
export class User {
  @PrimaryGeneratedColumn({ comment: "用户ID" })
  id: number;

  @Column({ comment: "用户名", unique: true })
  username: string;

  @Column({ comment: "用户密码" })
  password: string;
}
