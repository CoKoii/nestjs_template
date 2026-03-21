import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Relation,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

@Index("idx_auth_sessions_user_id", ["userId"])
@Index("idx_auth_sessions_expires_at", ["expiresAt"])
@Entity({ name: "auth_sessions", comment: "认证会话" })
export class AuthSession {
  @PrimaryColumn("char", { length: 36, comment: "会话ID" })
  id!: string;

  @Column({ comment: "用户ID" })
  userId!: number;

  @Column("varchar", {
    length: 255,
    comment: "刷新令牌哈希",
    select: false,
  })
  refreshTokenHash!: string;

  @Column("datetime", { comment: "过期时间" })
  expiresAt!: Date;

  @Column("datetime", { comment: "最近使用时间" })
  lastUsedAt!: Date;

  @Column("varchar", { length: 45, nullable: true, comment: "最后访问IP" })
  ip!: string | null;

  @Column("varchar", { length: 512, nullable: true, comment: "设备标识" })
  userAgent!: string | null;

  @CreateDateColumn({ comment: "创建时间" })
  createdAt!: Date;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: Relation<User>;
}
