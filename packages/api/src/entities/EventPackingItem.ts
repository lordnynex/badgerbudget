import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("event_packing_items")
export class EventPackingItem {
  @PrimaryColumn()
  id!: string;

  @Column({ name: "event_id" })
  eventId!: string;

  @Column({ name: "category_id" })
  categoryId!: string;

  @Column({ type: "text" })
  name!: string;

  @Column({ name: "sort_order", type: "integer", default: 0 })
  sortOrder!: number;

  @Column({ type: "integer", nullable: true })
  quantity!: number | null;

  @Column({ type: "text", nullable: true })
  note!: string | null;

  @Column({ type: "integer", default: 0 })
  loaded!: number;
}
