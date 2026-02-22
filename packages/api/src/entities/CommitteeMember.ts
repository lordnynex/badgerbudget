import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("committee_members")
export class CommitteeMember {
  @PrimaryColumn()
  id!: string;

  @Column({ name: "committee_id" })
  committeeId!: string;

  @Column({ name: "member_id" })
  memberId!: string;

  @Column({ name: "sort_order", type: "integer", default: 0 })
  sortOrder!: number;
}
