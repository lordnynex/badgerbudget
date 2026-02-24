import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("tags")
export class Tag {
  @PrimaryColumn("text")
  id!: string;

  @Column({ type: "text", unique: true })
  name!: string;
}
