import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("event_assignment_members")
export class EventAssignmentMember {
  @PrimaryColumn()
  id!: string;

  @Column({ name: "assignment_id" })
  assignmentId!: string;

  @Column({ name: "member_id" })
  memberId!: string;

  @Column({ name: "sort_order", type: "integer", default: 0 })
  sortOrder!: number;
}
