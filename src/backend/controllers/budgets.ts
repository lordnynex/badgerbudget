import { Elysia } from "elysia";
import { BaseController } from "./BaseController";
import { BudgetsDto } from "../dto/budgets.dto";

export class BudgetsController extends BaseController {
  init() {
    return new Elysia({ prefix: "/budgets" })
      .get("/", () => this.list())
      .post("/", ({ body }) => this.create(body), { body: BudgetsDto.createBody })
      .get("/:id", ({ params }) => this.get(params.id), { params: BudgetsDto.params })
      .put("/:id", ({ params, body }) => this.update(params.id, body), {
        params: BudgetsDto.params,
        body: BudgetsDto.updateBody,
      })
      .delete("/:id", ({ params }) => this.delete(params.id), { params: BudgetsDto.params })
      .post("/:id/line-items", ({ params, body }) => this.addLineItem(params.id, body), {
        params: BudgetsDto.params,
        body: BudgetsDto.addLineItemBody,
      })
      .put("/:id/line-items/:itemId", ({ params, body }) => this.updateLineItem(params.id, params.itemId, body), {
        params: BudgetsDto.itemParams,
        body: BudgetsDto.updateLineItemBody,
      })
      .delete("/:id/line-items/:itemId", ({ params }) => this.deleteLineItem(params.id, params.itemId), {
        params: BudgetsDto.itemParams,
      });
  }

  private list() {
    return this.api.budgets.list().then(this.json);
  }

  private get(id: string) {
    return this.api.budgets.get(id).then((b) => (b ? this.json(b) : this.notFound()));
  }

  private create(body: { name: string; year: number; description?: string }) {
    return this.api.budgets.create(body).then(this.json);
  }

  private update(id: string, body: { name?: string; year?: number; description?: string }) {
    return this.api.budgets.update(id, body).then((b) => (b ? this.json(b) : this.notFound()));
  }

  private delete(id: string) {
    return this.api.budgets.delete(id).then(() => this.json({ ok: true }));
  }

  private addLineItem(
    id: string,
    body: {
      name: string;
      category: string;
      comments?: string;
      unitCost: number;
      quantity: number;
      historicalCosts?: Record<string, number>;
    }
  ) {
    return this.api.budgets.addLineItem(id, body).then(this.json);
  }

  private updateLineItem(
    id: string,
    itemId: string,
    body: Partial<{
      name: string;
      category: string;
      comments: string;
      unitCost: number;
      quantity: number;
      historicalCosts: Record<string, number>;
    }>
  ) {
    return this.api.budgets.updateLineItem(id, itemId, body).then((b) => (b ? this.json(b) : this.notFound()));
  }

  private deleteLineItem(id: string, itemId: string) {
    return this.api.budgets.deleteLineItem(id, itemId).then(() => this.json({ ok: true }));
  }
}
