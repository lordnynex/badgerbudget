import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("site_pages")
export class SitePage {
  @PrimaryColumn("text")
  id!: string;

  @Column({ type: "text", unique: true })
  slug!: string;

  @Column({ type: "text" })
  title!: string;

  @Column({ type: "text" })
  body!: string;

  @Column({ name: "meta_title", type: "text", nullable: true })
  metaTitle!: string | null;

  @Column({ name: "meta_description", type: "text", nullable: true })
  metaDescription!: string | null;

  @Column({ name: "created_at", type: "text", nullable: true })
  createdAt!: string | null;

  @Column({ name: "updated_at", type: "text", nullable: true })
  updatedAt!: string | null;
}
