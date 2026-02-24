import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("committee_members")
export class CommitteeMember {
  @PrimaryColumn("text")
  id!: string;

  @Column({ name: "committee_id", type: "text" })
  committeeId!: string;

  @Column({ name: "member_id", type: "text" })
  memberId!: string;

  @Column({ name: "sort_order", type: "integer", default: 0 })
  sortOrder!: number;
}
