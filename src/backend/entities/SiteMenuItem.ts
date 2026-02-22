import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("site_menu_items")
export class SiteMenuItem {
  @PrimaryColumn()
  id!: string;

  @Column({ name: "menu_key", type: "text" })
  menuKey!: string;

  @Column({ type: "text" })
  label!: string;

  @Column({ type: "text", nullable: true })
  url!: string | null;

  @Column({ name: "internal_ref", type: "text", nullable: true })
  internalRef!: string | null;

  @Column({ name: "sort_order", type: "integer", default: 0 })
  sortOrder!: number;
}
