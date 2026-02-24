import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("contact_emergency_contacts")
export class ContactEmergencyContact {
  @PrimaryColumn("text")
  id!: string;

  @Column({ name: "contact_id", type: "text" })
  contactId!: string;

  @Column({ type: "text" })
  name!: string;

  @Column({ type: "text" })
  phone!: string;

  @Column({ type: "text", nullable: true })
  email!: string | null;

  @Column({ type: "text", nullable: true })
  relationship!: string | null;
}
