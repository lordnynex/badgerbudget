import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("contact_tags")
export class ContactTag {
  @PrimaryColumn({ name: "contact_id" })
  contactId!: string;

  @PrimaryColumn({ name: "tag_id" })
  tagId!: string;
}
