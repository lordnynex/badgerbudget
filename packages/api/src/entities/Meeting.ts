import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("meetings")
export class Meeting {
  @PrimaryColumn("text")
  id!: string;

  @Column({ type: "text" })
  date!: string;

  @Column({ name: "meeting_number", type: "integer" })
  meetingNumber!: number;

  @Column({ type: "text", nullable: true })
  location!: string | null;

  @Column({ name: "start_time", type: "text", nullable: true })
  startTime!: string | null;

  @Column({ name: "end_time", type: "text", nullable: true })
  endTime!: string | null;

  @Column({ name: "video_conference_url", type: "text", nullable: true })
  videoConferenceUrl!: string | null;

  @Column({ name: "previous_meeting_id", type: "text", nullable: true })
  previousMeetingId!: string | null;

  @Column({ name: "agenda_document_id", type: "text" })
  agendaDocumentId!: string;

  @Column({ name: "minutes_document_id", type: "text", nullable: true })
  minutesDocumentId!: string | null;

  @Column({ name: "created_at", type: "text", nullable: true })
  createdAt!: string | null;

  @Column({ name: "updated_at", type: "text", nullable: true })
  updatedAt!: string | null;
}
