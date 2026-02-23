import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("contact_phones")
export class ContactPhone {
  @PrimaryColumn()
  id!: string;

  @Column({ name: "contact_id" })
  contactId!: string;

  @Column({ type: "text" })
  phone!: string;

  @Column({ type: "text", default: "other" })
  type!: string;

  @Column({ name: "is_primary", type: "integer", default: 0 })
  isPrimary!: number;
}
