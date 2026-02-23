import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("event_milestone_members")
export class EventMilestoneMember {
  @PrimaryColumn()
  id!: string;

  @Column({ name: "milestone_id" })
  milestoneId!: string;

  @Column({ name: "member_id" })
  memberId!: string;

  @Column({ name: "sort_order", type: "integer", default: 0 })
  sortOrder!: number;
}
