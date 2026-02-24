import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("event_milestone_members")
export class EventMilestoneMember {
  @PrimaryColumn("text")
  id!: string;

  @Column({ name: "milestone_id", type: "text" })
  milestoneId!: string;

  @Column({ name: "member_id", type: "text" })
  memberId!: string;

  @Column({ name: "sort_order", type: "integer", default: 0 })
  sortOrder!: number;
}
