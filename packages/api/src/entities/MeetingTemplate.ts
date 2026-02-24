import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("meeting_templates")
export class MeetingTemplate {
  @PrimaryColumn("text")
  id!: string;

  @Column({ type: "text" })
  name!: string;

  @Column({ type: "text" })
  type!: string;

  @Column({ name: "document_id", type: "text" })
  documentId!: string;

  @Column({ name: "created_at", type: "text", nullable: true })
  createdAt!: string | null;

  @Column({ name: "updated_at", type: "text", nullable: true })
  updatedAt!: string | null;
}
