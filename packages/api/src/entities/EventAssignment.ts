import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("event_assignments")
export class EventAssignment {
  @PrimaryColumn()
  id!: string;

  @Column({ name: "event_id" })
  eventId!: string;

  @Column({ type: "text" })
  name!: string;

  @Column({ type: "text" })
  category!: string;

  @Column({ name: "sort_order", type: "integer", default: 0 })
  sortOrder!: number;
}
