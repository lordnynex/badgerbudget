import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("event_photos")
export class EventPhoto {
  @PrimaryColumn("text")
  id!: string;

  @Column({ name: "event_id", type: "text" })
  eventId!: string;

  @Column({ name: "sort_order", type: "integer", default: 0 })
  sortOrder!: number;

  @Column({ type: "blob", nullable: true })
  photo!: Buffer | null;

  @Column({ name: "photo_thumbnail", type: "blob", nullable: true })
  photoThumbnail!: Buffer | null;

  @Column({ name: "created_at", type: "text", nullable: true })
  createdAt!: string | null;
}
