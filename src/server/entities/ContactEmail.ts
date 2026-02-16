import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("contact_emails")
export class ContactEmail {
  @PrimaryColumn()
  id!: string;

  @Column({ name: "contact_id" })
  contactId!: string;

  @Column({ type: "text" })
  email!: string;

  @Column({ type: "text", default: "other" })
  type!: string;

  @Column({ name: "is_primary", type: "integer", default: 0 })
  isPrimary!: number;
}
