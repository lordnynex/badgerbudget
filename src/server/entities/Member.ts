import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("members")
export class Member {
  @PrimaryColumn()
  id!: string;

  @Column({ type: "text" })
  name!: string;

  @Column({ name: "phone_number", type: "text", nullable: true })
  phoneNumber!: string | null;

  @Column({ type: "text", nullable: true })
  email!: string | null;

  @Column({ type: "text", nullable: true })
  address!: string | null;

  @Column({ type: "text", nullable: true })
  birthday!: string | null;

  @Column({ name: "member_since", type: "text", nullable: true })
  memberSince!: string | null;

  @Column({ name: "is_baby", type: "integer", default: 0 })
  isBaby!: number;

  @Column({ type: "text", nullable: true })
  position!: string | null;

  @Column({ name: "emergency_contact_name", type: "text", nullable: true })
  emergencyContactName!: string | null;

  @Column({ name: "emergency_contact_phone", type: "text", nullable: true })
  emergencyContactPhone!: string | null;

  @Column({ type: "blob", nullable: true })
  photo!: Buffer | null;

  @Column({ name: "created_at", type: "text", nullable: true })
  createdAt!: string | null;
}
