import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("meetings")
export class Meeting {
  @PrimaryColumn()
  id!: string;

  @Column({ type: "text" })
  date!: string;

  @Column({ name: "meeting_number", type: "integer" })
  meetingNumber!: number;

  @Column({ type: "text", nullable: true })
  location!: string | null;

  @Column({ name: "previous_meeting_id", type: "text", nullable: true })
  previousMeetingId!: string | null;

  @Column({ name: "agenda_content", type: "text" })
  agendaContent!: string;

  @Column({ name: "minutes_content", type: "text", nullable: true })
  minutesContent!: string | null;

  @Column({ name: "created_at", type: "text", nullable: true })
  createdAt!: string | null;

  @Column({ name: "updated_at", type: "text", nullable: true })
  updatedAt!: string | null;
}
