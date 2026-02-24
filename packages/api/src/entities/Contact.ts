import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("contacts")
export class Contact {
  @PrimaryColumn("text")
  id!: string;

  @Column({ type: "text", default: "person" })
  type!: string;

  @Column({ type: "text", default: "active" })
  status!: string;

  @Column({ name: "display_name", type: "text" })
  displayName!: string;

  @Column({ name: "first_name", type: "text", nullable: true })
  firstName!: string | null;

  @Column({ name: "last_name", type: "text", nullable: true })
  lastName!: string | null;

  @Column({ name: "organization_name", type: "text", nullable: true })
  organizationName!: string | null;

  @Column({ type: "text", nullable: true })
  notes!: string | null;

  @Column({ name: "how_we_know_them", type: "text", nullable: true })
  howWeKnowThem!: string | null;

  @Column({ name: "ok_to_email", type: "text", default: "unknown" })
  okToEmail!: string;

  @Column({ name: "ok_to_mail", type: "text", default: "unknown" })
  okToMail!: string;

  @Column({ name: "ok_to_sms", type: "text", default: "unknown" })
  okToSms!: string;

  @Column({ name: "do_not_contact", type: "integer", default: 0 })
  doNotContact!: number;

  @Column({ name: "club_name", type: "text", nullable: true })
  clubName!: string | null;

  @Column({ type: "text", nullable: true })
  role!: string | null;

  @Column({ type: "text", nullable: true, unique: true })
  uid!: string | null;

  @Column({ name: "created_at", type: "text", nullable: true })
  createdAt!: string | null;

  @Column({ name: "updated_at", type: "text", nullable: true })
  updatedAt!: string | null;

  @Column({ name: "deleted_at", type: "text", nullable: true })
  deletedAt!: string | null;

  @Column({ name: "hellenic", type: "integer", default: 0 })
  hellenic!: number;

  @Column({ name: "deceased", type: "integer", default: 0 })
  deceased!: number;

  @Column({ name: "deceased_year", type: "integer", nullable: true })
  deceasedYear!: number | null;
}
