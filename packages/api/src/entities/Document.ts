import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("documents")
export class Document {
  @PrimaryColumn("text")
  id!: string;

  @Column({ type: "text" })
  content!: string;

  @Column({ name: "created_at", type: "text", nullable: true })
  createdAt!: string | null;

  @Column({ name: "updated_at", type: "text", nullable: true })
  updatedAt!: string | null;
}
