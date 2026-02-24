import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("event_packing_categories")
export class EventPackingCategory {
  @PrimaryColumn("text")
  id!: string;

  @Column({ name: "event_id", type: "text" })
  eventId!: string;

  @Column({ type: "text" })
  name!: string;

  @Column({ name: "sort_order", type: "integer", default: 0 })
  sortOrder!: number;
}
