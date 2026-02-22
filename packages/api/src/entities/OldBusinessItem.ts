import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("old_business_items")
export class OldBusinessItem {
  @PrimaryColumn()
  id!: string;

  @Column({ name: "meeting_id" })
  meetingId!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "text", default: "open" })
  status!: string;

  @Column({ name: "closed_at", type: "text", nullable: true })
  closedAt!: string | null;

  @Column({ name: "closed_in_meeting_id", type: "text", nullable: true })
  closedInMeetingId!: string | null;

  @Column({ name: "order_index", type: "integer", default: 0 })
  orderIndex!: number;

  @Column({ name: "created_at", type: "text", nullable: true })
  createdAt!: string | null;
}
