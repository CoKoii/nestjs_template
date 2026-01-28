import { User } from "../user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Logs {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  path: string;

  @Column()
  method: string;

  @Column()
  data: string;

  @Column()
  result: number;

  @ManyToOne(() => User, (user) => user.logs)
  user: User;
}
