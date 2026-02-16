import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("audit_log")
export class AuditLog {
  @PrimaryColumn()
  id!: string;

  @Column({ type: "text" })
  action!: string;

  @Column({ name: "entity_type", type: "text" })
  entityType!: string;

  @Column({ name: "entity_id", type: "text", nullable: true })
  entityId!: string | null;

  @Column({ name: "user_id", type: "text", nullable: true })
  userId!: string | null;

  @Column({ type: "text", nullable: true })
  details!: string | null;

  @Column({ name: "created_at", type: "text", nullable: true })
  createdAt!: string | null;
}
