import type { DataSource } from "typeorm";
import { SiteMenuItem } from "../entities";
import { uuid } from "./utils";

export interface MenuItemPayload {
  label: string;
  url?: string | null;
  internal_ref?: string | null;
  sort_order?: number;
}

export interface MenuItemResponse {
  id: string;
  menu_key: string;
  label: string;
  url: string | null;
  internal_ref: string | null;
  sort_order: number;
}

export type MenusResponse = Record<string, MenuItemResponse[]>;

export class SiteMenusService {
  constructor(private ds: DataSource) {}

  async listAll(): Promise<MenusResponse> {
    const items = await this.ds.getRepository(SiteMenuItem).find({
      order: { menuKey: "ASC", sortOrder: "ASC" },
    });
    const byKey: MenusResponse = {};
    for (const item of items) {
      if (!byKey[item.menuKey]) byKey[item.menuKey] = [];
      byKey[item.menuKey].push({
        id: item.id,
        menu_key: item.menuKey,
        label: item.label,
        url: item.url ?? null,
        internal_ref: item.internalRef ?? null,
        sort_order: item.sortOrder,
      });
    }
    return byKey;
  }

  async updateMenu(key: string, items: MenuItemPayload[]): Promise<MenuItemResponse[]> {
    const repo = this.ds.getRepository(SiteMenuItem);
    const existing = await repo.find({ where: { menuKey: key }, order: { sortOrder: "ASC" } });
    for (const e of existing) {
      await repo.delete(e.id);
    }
    const result: MenuItemResponse[] = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const id = uuid();
      const item = repo.create({
        id,
        menuKey: key,
        label: it.label,
        url: it.url ?? null,
        internalRef: it.internal_ref ?? null,
        sortOrder: it.sort_order ?? i,
      });
      await repo.save(item);
      result.push({
        id: item.id,
        menu_key: item.menuKey,
        label: item.label,
        url: item.url ?? null,
        internal_ref: item.internalRef ?? null,
        sort_order: item.sortOrder,
      });
    }
    return result;
  }
}
