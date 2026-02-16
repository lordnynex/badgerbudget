import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("budgets")
export class Budget {
  @PrimaryColumn()
  id!: string;

  @Column({ type: "text" })
  name!: string;

  @Column({ type: "integer" })
  year!: number;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ name: "created_at", type: "text", nullable: true })
  createdAt!: string | null;
}
