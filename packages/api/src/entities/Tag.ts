import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("tags")
export class Tag {
  @PrimaryColumn()
  id!: string;

  @Column({ type: "text", unique: true })
  name!: string;
}
