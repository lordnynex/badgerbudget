import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("line_items")
export class LineItem {
  @PrimaryColumn("text")
  id!: string;

  @Column({ name: "budget_id", type: "text" })
  budgetId!: string;

  @Column({ type: "text" })
  name!: string;

  @Column({ type: "text" })
  category!: string;

  @Column({ type: "text", nullable: true })
  comments!: string | null;

  @Column({ name: "unit_cost", type: "real" })
  unitCost!: number;

  @Column({ type: "real" })
  quantity!: number;

  @Column({ name: "historical_costs", type: "text", nullable: true })
  historicalCosts!: string | null;
}
