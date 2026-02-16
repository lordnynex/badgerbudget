import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("event_packing_categories")
export class EventPackingCategory {
  @PrimaryColumn()
  id!: string;

  @Column({ name: "event_id" })
  eventId!: string;

  @Column({ type: "text" })
  name!: string;

  @Column({ name: "sort_order", type: "integer", default: 0 })
  sortOrder!: number;
}
