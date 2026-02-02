import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Profile } from "../../profile/entities/profile.entity";

@Entity({ comment: "用户" })
export class User {
  @PrimaryGeneratedColumn({ comment: "用户ID" })
  id: number;
  @Column({ comment: "用户名", unique: true })
  username: string;
  @Column({ comment: "用户密码" })
  password: string;
  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
  profile: Profile;
}
