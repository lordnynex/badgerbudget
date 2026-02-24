import { Entity, PrimaryColumn, Column } from "typeorm";

export type ContactPhotoType = "profile" | "contact";

@Entity("contact_photos")
export class ContactPhoto {
  @PrimaryColumn("text")
  id!: string;

  @Column({ name: "contact_id", type: "text" })
  contactId!: string;

  /** profile = main/primary photo; contact = additional photo */
  @Column({ type: "text", default: "contact" })
  type!: ContactPhotoType;

  @Column({ name: "sort_order", type: "integer", default: 0 })
  sortOrder!: number;

  @Column({ type: "blob", nullable: true })
  photo!: Buffer | null;

  @Column({ name: "photo_thumbnail", type: "blob", nullable: true })
  photoThumbnail!: Buffer | null;

  @Column({ name: "created_at", type: "text", nullable: true })
  createdAt!: string | null;
}
