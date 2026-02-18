import type { DataSource } from "typeorm";
import { MeetingTemplate } from "../entities";
import { uuid } from "./utils";

export class MeetingTemplatesService {
  constructor(private ds: DataSource) {}

  async list(type?: "agenda" | "minutes") {
    const repo = this.ds.getRepository(MeetingTemplate);
    const findOptions: Parameters<typeof repo.find>[0] = {
      order: { name: "ASC" },
    };
    if (type) {
      findOptions.where = { type };
    }
    const entities = await repo.find(findOptions);
    return entities.map((t) => ({
      id: t.id,
      name: t.name,
      type: t.type,
      content: t.content,
      created_at: t.createdAt ?? undefined,
      updated_at: t.updatedAt ?? undefined,
    }));
  }

  async get(id: string) {
    const template = await this.ds.getRepository(MeetingTemplate).findOne({ where: { id } });
    if (!template) return null;
    return {
      id: template.id,
      name: template.name,
      type: template.type,
      content: template.content,
      created_at: template.createdAt ?? undefined,
      updated_at: template.updatedAt ?? undefined,
    };
  }

  async create(body: { name: string; type: string; content: string }) {
    const now = new Date().toISOString();
    const template = this.ds.getRepository(MeetingTemplate).create({
      id: uuid(),
      name: body.name,
      type: body.type,
      content: body.content,
      createdAt: now,
      updatedAt: now,
    });
    await this.ds.getRepository(MeetingTemplate).save(template);
    return {
      id: template.id,
      name: template.name,
      type: template.type,
      content: template.content,
      created_at: template.createdAt ?? undefined,
      updated_at: template.updatedAt ?? undefined,
    };
  }

  async update(id: string, body: Record<string, unknown>) {
    const template = await this.ds.getRepository(MeetingTemplate).findOne({ where: { id } });
    if (!template) return null;
    const updates: Partial<MeetingTemplate> = {};
    if (body.name !== undefined) updates.name = body.name as string;
    if (body.type !== undefined) updates.type = body.type as string;
    if (body.content !== undefined) updates.content = body.content as string;
    updates.updatedAt = new Date().toISOString();
    await this.ds.getRepository(MeetingTemplate).update(id, updates);
    const updated = await this.ds.getRepository(MeetingTemplate).findOne({ where: { id } });
    return updated
      ? {
          id: updated.id,
          name: updated.name,
          type: updated.type,
          content: updated.content,
          created_at: updated.createdAt ?? undefined,
          updated_at: updated.updatedAt ?? undefined,
        }
      : null;
  }

  async delete(id: string) {
    const result = await this.ds.getRepository(MeetingTemplate).delete(id);
    return result.affected !== 0;
  }
}
