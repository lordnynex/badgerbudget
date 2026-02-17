import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("ride_schedule_items")
export class RideScheduleItem {
  @PrimaryColumn()
  id!: string;

  @Column({ name: "event_id" })
  eventId!: string;

  @Column({ name: "scheduled_time" })
  scheduledTime!: string;

  @Column()
  label!: string;

  @Column({ type: "text", nullable: true })
  location!: string | null;

  @Column({ name: "sort_order", type: "integer", default: 0 })
  sortOrder!: number;
}
