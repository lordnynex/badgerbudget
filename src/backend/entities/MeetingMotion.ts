import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("meeting_motions")
export class MeetingMotion {
  @PrimaryColumn()
  id!: string;

  @Column({ name: "meeting_id" })
  meetingId!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "text" })
  result!: string;

  @Column({ name: "order_index", type: "integer", default: 0 })
  orderIndex!: number;

  @Column({ name: "created_at", type: "text", nullable: true })
  createdAt!: string | null;
}
