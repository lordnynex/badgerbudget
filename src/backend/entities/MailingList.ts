import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("mailing_lists")
export class MailingList {
  @PrimaryColumn()
  id!: string;

  @Column({ type: "text" })
  name!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ name: "list_type", type: "text", default: "static" })
  listType!: string;

  @Column({ name: "event_id", type: "text", nullable: true })
  eventId!: string | null;

  @Column({ type: "text", nullable: true })
  template!: string | null;

  @Column({ type: "text", nullable: true })
  criteria!: string | null;

  @Column({ name: "created_at", type: "text", nullable: true })
  createdAt!: string | null;

  @Column({ name: "updated_at", type: "text", nullable: true })
  updatedAt!: string | null;
}
