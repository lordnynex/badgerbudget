import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("event_assignment_members")
export class EventAssignmentMember {
  @PrimaryColumn("text")
  id!: string;

  @Column({ name: "assignment_id", type: "text" })
  assignmentId!: string;

  @Column({ name: "member_id", type: "text" })
  memberId!: string;

  @Column({ name: "sort_order", type: "integer", default: 0 })
  sortOrder!: number;
}
