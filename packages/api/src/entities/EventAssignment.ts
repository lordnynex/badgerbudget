import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("event_assignments")
export class EventAssignment {
  @PrimaryColumn("text")
  id!: string;

  @Column({ name: "event_id", type: "text" })
  eventId!: string;

  @Column({ type: "text" })
  name!: string;

  @Column({ type: "text" })
  category!: string;

  @Column({ name: "sort_order", type: "integer", default: 0 })
  sortOrder!: number;
}
