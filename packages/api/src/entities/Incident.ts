import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("incidents")
export class Incident {
  @PrimaryColumn()
  id!: string;

  @Column({ name: "event_id" })
  eventId!: string;

  @Column({ name: "contact_id", nullable: true })
  contactId!: string | null;

  @Column({ name: "member_id", nullable: true })
  memberId!: string | null;

  @Column()
  type!: string;

  @Column()
  severity!: string;

  @Column()
  summary!: string;

  @Column({ type: "text", nullable: true })
  details!: string | null;

  @Column({ name: "occurred_at", type: "text", nullable: true })
  occurredAt!: string | null;

  @Column({ name: "created_at", type: "text", nullable: true })
  createdAt!: string | null;
}

