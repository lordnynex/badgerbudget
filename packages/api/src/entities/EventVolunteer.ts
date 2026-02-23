import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("event_volunteers")
export class EventVolunteer {
  @PrimaryColumn()
  id!: string;

  @Column({ name: "event_id" })
  eventId!: string;

  @Column({ type: "text" })
  name!: string;

  @Column({ type: "text" })
  department!: string;

  @Column({ name: "sort_order", type: "integer", default: 0 })
  sortOrder!: number;
}
