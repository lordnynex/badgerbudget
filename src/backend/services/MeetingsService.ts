import { In } from "typeorm";
import type { DataSource } from "typeorm";
import {
  Document,
  Meeting,
  MeetingMotion,
  MeetingActionItem,
  OldBusinessItem,
  MeetingTemplate,
  Member,
} from "../entities";
import { uuid } from "./utils";

const EMPTY_DOC = JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] });

export class MeetingsService {
  constructor(private ds: DataSource) {}

  async list(sort?: "date" | "meeting_number") {
    const repo = this.ds.getRepository(Meeting);
    const order: Record<string, "ASC" | "DESC"> =
      sort === "meeting_number"
        ? { meetingNumber: "DESC" }
        : { date: "DESC" };
    const entities = await repo.find({ order });
    const docMap = await this.fetchDocumentsForMeetings(entities);
    return entities.map((m) => this.meetingToApi(m, docMap));
  }

  async create(body: {
    date: string;
    meeting_number: number;
    location?: string | null;
    previous_meeting_id?: string | null;
    agenda_content?: string;
    minutes_content?: string | null;
    agenda_template_id?: string;
  }) {
    let agendaContent = body.agenda_content ?? EMPTY_DOC;
    if (body.agenda_template_id) {
      const template = await this.ds.getRepository(MeetingTemplate).findOne({
        where: { id: body.agenda_template_id, type: "agenda" },
      });
      if (template) {
        const agendaDoc = await this.ds.getRepository(Document).findOne({
          where: { id: template.documentId },
        });
        if (agendaDoc) agendaContent = agendaDoc.content;
      }
    }
    const now = new Date().toISOString();
    const agendaDoc = this.ds.getRepository(Document).create({
      id: uuid(),
      content: agendaContent,
      createdAt: now,
      updatedAt: now,
    });
    await this.ds.getRepository(Document).save(agendaDoc);
    const minutesDoc = this.ds.getRepository(Document).create({
      id: uuid(),
      content: body.minutes_content ?? EMPTY_DOC,
      createdAt: now,
      updatedAt: now,
    });
    await this.ds.getRepository(Document).save(minutesDoc);
    const meeting = this.ds.getRepository(Meeting).create({
      id: uuid(),
      date: body.date,
      meetingNumber: body.meeting_number,
      location: body.location ?? null,
      previousMeetingId: body.previous_meeting_id ?? null,
      agendaDocumentId: agendaDoc.id,
      minutesDocumentId: minutesDoc.id,
      createdAt: now,
      updatedAt: now,
    });
    await this.ds.getRepository(Meeting).save(meeting);
    const docMap = new Map<string, Document>([
      [agendaDoc.id, agendaDoc],
      [minutesDoc.id, minutesDoc],
    ]);
    return this.meetingToApi(meeting, docMap);
  }

  async get(id: string) {
    const meeting = await this.ds.getRepository(Meeting).findOne({ where: { id } });
    if (!meeting) return null;
    const motions = await this.ds.getRepository(MeetingMotion).find({
      where: { meetingId: id },
      order: { orderIndex: "ASC", createdAt: "ASC" },
    });
    const actionItems = await this.ds.getRepository(MeetingActionItem).find({
      where: { meetingId: id },
      order: { orderIndex: "ASC", createdAt: "ASC" },
    });
    const meetingDate = meeting.date;
    const allMeetingsBefore = await this.ds.getRepository(Meeting).find({
      where: {},
      order: { date: "ASC" },
    });
    const meetingOrder = allMeetingsBefore.findIndex((m) => m.id === id);
    const priorMeetingIds = new Set(
      allMeetingsBefore.slice(0, meetingOrder).map((m) => m.id)
    );
    const oldBusiness = await this.ds.getRepository(OldBusinessItem).find({
      where: {},
      order: { orderIndex: "ASC", createdAt: "ASC" },
    });
    const oldBusinessForMeeting = oldBusiness.filter(
      (ob) => ob.status === "open" && priorMeetingIds.has(ob.meetingId)
    );
    const newOldBusiness = oldBusiness.filter((ob) => ob.meetingId === id);
    const assigneeIds = [...new Set(actionItems.map((a) => a.assigneeMemberId).filter(Boolean) as string[])];
    const membersMap = new Map<string, { id: string; name: string }>();
    if (assigneeIds.length) {
      const members = await this.ds.getRepository(Member).find({
        where: { id: In(assigneeIds as string[]) },
        select: ["id", "name"],
      });
      for (const m of members) membersMap.set(m.id, { id: m.id, name: m.name });
    }
    const docMap = await this.fetchDocumentsForMeetings([meeting]);
    return {
      ...this.meetingToApi(meeting, docMap),
      motions: motions.map((m) => ({
        id: m.id,
        meeting_id: m.meetingId,
        description: m.description,
        result: m.result,
        order_index: m.orderIndex,
        created_at: m.createdAt ?? undefined,
      })),
      action_items: actionItems.map((a) => ({
        id: a.id,
        meeting_id: a.meetingId,
        description: a.description,
        assignee_member_id: a.assigneeMemberId ?? null,
        assignee_name: a.assigneeMemberId ? membersMap.get(a.assigneeMemberId)?.name ?? null : null,
        due_date: a.dueDate ?? null,
        status: a.status,
        completed_at: a.completedAt ?? null,
        order_index: a.orderIndex,
        created_at: a.createdAt ?? undefined,
      })),
      old_business: [
        ...oldBusinessForMeeting.map((ob) => ({
          id: ob.id,
          meeting_id: ob.meetingId,
          description: ob.description,
          status: ob.status,
          closed_at: ob.closedAt ?? null,
          closed_in_meeting_id: ob.closedInMeetingId ?? null,
          order_index: ob.orderIndex,
          created_at: ob.createdAt ?? undefined,
          is_carried: true,
        })),
        ...newOldBusiness.map((ob) => ({
          id: ob.id,
          meeting_id: ob.meetingId,
          description: ob.description,
          status: ob.status,
          closed_at: ob.closedAt ?? null,
          closed_in_meeting_id: ob.closedInMeetingId ?? null,
          order_index: ob.orderIndex,
          created_at: ob.createdAt ?? undefined,
          is_carried: false,
        })),
      ].sort((a, b) => a.order_index - b.order_index),
    };
  }

  async update(id: string, body: Record<string, unknown>) {
    const meeting = await this.ds.getRepository(Meeting).findOne({ where: { id } });
    if (!meeting) return null;
    const updates: Partial<Meeting> = {};
    if (body.date !== undefined) updates.date = body.date as string;
    if (body.meeting_number !== undefined) updates.meetingNumber = body.meeting_number as number;
    if (body.location !== undefined) updates.location = body.location as string | null;
    if (body.previous_meeting_id !== undefined) updates.previousMeetingId = body.previous_meeting_id as string | null;
    updates.updatedAt = new Date().toISOString();
    await this.ds.getRepository(Meeting).update(id, updates);
    const updated = await this.ds.getRepository(Meeting).findOne({ where: { id } });
    if (!updated) return null;
    const docMap = await this.fetchDocumentsForMeetings([updated]);
    return this.meetingToApi(updated, docMap);
  }

  async delete(
    id: string,
    options?: { delete_agenda?: boolean; delete_minutes?: boolean }
  ) {
    const meeting = await this.ds.getRepository(Meeting).findOne({ where: { id } });
    if (!meeting) return false;
    const deleteAgenda = options?.delete_agenda !== false;
    const deleteMinutes = options?.delete_minutes !== false;
    const docIds: string[] = [];
    if (deleteAgenda) docIds.push(meeting.agendaDocumentId);
    if (deleteMinutes && meeting.minutesDocumentId)
      docIds.push(meeting.minutesDocumentId);
    if (docIds.length) {
      await this.ds.getRepository(Document).delete(docIds);
    }
    const result = await this.ds.getRepository(Meeting).delete(id);
    return result.affected !== 0;
  }

  async createMotion(meetingId: string, body: { description: string; result: string; order_index?: number }) {
    const maxOrder = await this.ds.getRepository(MeetingMotion)
      .createQueryBuilder("m")
      .select("MAX(m.order_index)", "max")
      .where("m.meeting_id = :meetingId", { meetingId })
      .getRawOne();
    const orderIndex = body.order_index ?? ((maxOrder?.max ?? -1) + 1);
    const motion = this.ds.getRepository(MeetingMotion).create({
      id: uuid(),
      meetingId,
      description: body.description,
      result: body.result,
      orderIndex,
      createdAt: new Date().toISOString(),
    });
    await this.ds.getRepository(MeetingMotion).save(motion);
    return { id: motion.id, meeting_id: motion.meetingId, description: motion.description, result: motion.result, order_index: motion.orderIndex, created_at: motion.createdAt ?? undefined };
  }

  async updateMotion(meetingId: string, mid: string, body: Record<string, unknown>) {
    const motion = await this.ds.getRepository(MeetingMotion).findOne({ where: { id: mid, meetingId } });
    if (!motion) return null;
    const updates: Partial<MeetingMotion> = {};
    if (body.description !== undefined) updates.description = body.description as string;
    if (body.result !== undefined) updates.result = body.result as string;
    if (body.order_index !== undefined) updates.orderIndex = body.order_index as number;
    await this.ds.getRepository(MeetingMotion).update(mid, updates);
    const updated = await this.ds.getRepository(MeetingMotion).findOne({ where: { id: mid } });
    return updated ? { id: updated.id, meeting_id: updated.meetingId, description: updated.description, result: updated.result, order_index: updated.orderIndex, created_at: updated.createdAt ?? undefined } : null;
  }

  async deleteMotion(meetingId: string, mid: string) {
    const result = await this.ds.getRepository(MeetingMotion).delete({ id: mid, meetingId });
    return result.affected !== 0;
  }

  async createActionItem(meetingId: string, body: { description: string; assignee_member_id?: string | null; due_date?: string | null; order_index?: number }) {
    const maxOrder = await this.ds.getRepository(MeetingActionItem)
      .createQueryBuilder("a")
      .select("MAX(a.order_index)", "max")
      .where("a.meeting_id = :meetingId", { meetingId })
      .getRawOne();
    const orderIndex = body.order_index ?? ((maxOrder?.max ?? -1) + 1);
    const item = this.ds.getRepository(MeetingActionItem).create({
      id: uuid(),
      meetingId,
      description: body.description,
      assigneeMemberId: body.assignee_member_id ?? null,
      dueDate: body.due_date ?? null,
      status: "open",
      orderIndex,
      createdAt: new Date().toISOString(),
    });
    await this.ds.getRepository(MeetingActionItem).save(item);
    return { id: item.id, meeting_id: item.meetingId, description: item.description, assignee_member_id: item.assigneeMemberId ?? null, due_date: item.dueDate ?? null, status: item.status, order_index: item.orderIndex, created_at: item.createdAt ?? undefined };
  }

  async updateActionItem(meetingId: string, aid: string, body: Record<string, unknown>) {
    const item = await this.ds.getRepository(MeetingActionItem).findOne({ where: { id: aid, meetingId } });
    if (!item) return null;
    const updates: Partial<MeetingActionItem> = {};
    if (body.description !== undefined) updates.description = body.description as string;
    if (body.assignee_member_id !== undefined) updates.assigneeMemberId = body.assignee_member_id as string | null;
    if (body.due_date !== undefined) updates.dueDate = body.due_date as string | null;
    if (body.status !== undefined) {
      updates.status = body.status as string;
      if (body.status === "completed") updates.completedAt = new Date().toISOString();
    }
    if (body.order_index !== undefined) updates.orderIndex = body.order_index as number;
    await this.ds.getRepository(MeetingActionItem).update(aid, updates);
    const updated = await this.ds.getRepository(MeetingActionItem).findOne({ where: { id: aid } });
    return updated ? { id: updated.id, meeting_id: updated.meetingId, description: updated.description, assignee_member_id: updated.assigneeMemberId ?? null, due_date: updated.dueDate ?? null, status: updated.status, completed_at: updated.completedAt ?? null, order_index: updated.orderIndex, created_at: updated.createdAt ?? undefined } : null;
  }

  async deleteActionItem(meetingId: string, aid: string) {
    const result = await this.ds.getRepository(MeetingActionItem).delete({ id: aid, meetingId });
    return result.affected !== 0;
  }

  async createOldBusiness(meetingId: string, body: { description: string; order_index?: number }) {
    const maxOrder = await this.ds.getRepository(OldBusinessItem)
      .createQueryBuilder("o")
      .select("MAX(o.order_index)", "max")
      .where("o.meeting_id = :meetingId", { meetingId })
      .getRawOne();
    const orderIndex = body.order_index ?? ((maxOrder?.max ?? -1) + 1);
    const item = this.ds.getRepository(OldBusinessItem).create({
      id: uuid(),
      meetingId,
      description: body.description,
      status: "open",
      orderIndex,
      createdAt: new Date().toISOString(),
    });
    await this.ds.getRepository(OldBusinessItem).save(item);
    return { id: item.id, meeting_id: item.meetingId, description: item.description, status: item.status, order_index: item.orderIndex, created_at: item.createdAt ?? undefined };
  }

  async updateOldBusiness(meetingId: string, oid: string, body: Record<string, unknown>) {
    const item = await this.ds.getRepository(OldBusinessItem).findOne({ where: { id: oid, meetingId } });
    if (!item) return null;
    const updates: Partial<OldBusinessItem> = {};
    if (body.description !== undefined) updates.description = body.description as string;
    if (body.status !== undefined) {
      updates.status = body.status as string;
      if (body.status === "closed") {
        updates.closedAt = new Date().toISOString();
        updates.closedInMeetingId = (body.closed_in_meeting_id as string) ?? meetingId;
      }
    }
    if (body.closed_in_meeting_id !== undefined) updates.closedInMeetingId = body.closed_in_meeting_id as string | null;
    if (body.order_index !== undefined) updates.orderIndex = body.order_index as number;
    await this.ds.getRepository(OldBusinessItem).update(oid, updates);
    const updated = await this.ds.getRepository(OldBusinessItem).findOne({ where: { id: oid } });
    return updated ? { id: updated.id, meeting_id: updated.meetingId, description: updated.description, status: updated.status, closed_at: updated.closedAt ?? null, closed_in_meeting_id: updated.closedInMeetingId ?? null, order_index: updated.orderIndex, created_at: updated.createdAt ?? undefined } : null;
  }

  async deleteOldBusiness(meetingId: string, oid: string) {
    const result = await this.ds.getRepository(OldBusinessItem).delete({ id: oid, meetingId });
    return result.affected !== 0;
  }

  async listOldBusiness() {
    const items = await this.ds.getRepository(OldBusinessItem).find({
      order: { orderIndex: "ASC", createdAt: "ASC" },
    });
    if (items.length === 0) return [];
    const meetingIds = [...new Set(items.map((ob) => ob.meetingId))];
    const meetings = await this.ds.getRepository(Meeting).find({
      where: { id: In(meetingIds) },
      select: ["id", "date", "meetingNumber"],
    });
    const meetingMap = new Map(meetings.map((m) => [m.id, m]));
    return items.map((ob) => {
      const meeting = meetingMap.get(ob.meetingId);
      return {
        id: ob.id,
        meeting_id: ob.meetingId,
        description: ob.description,
        status: ob.status as "open" | "closed",
        closed_at: ob.closedAt ?? null,
        closed_in_meeting_id: ob.closedInMeetingId ?? null,
        order_index: ob.orderIndex,
        created_at: ob.createdAt ?? undefined,
        meeting_number: meeting?.meetingNumber,
        meeting_date: meeting?.date,
      };
    });
  }

  private async fetchDocumentsForMeetings(meetings: Meeting[]): Promise<Map<string, Document>> {
    const docIds = [
      ...meetings.map((m) => m.agendaDocumentId),
      ...meetings.map((m) => m.minutesDocumentId).filter((id): id is string => id != null),
    ];
    if (docIds.length === 0) return new Map();
    const docs = await this.ds.getRepository(Document).find({ where: { id: In(docIds) } });
    return new Map(docs.map((d) => [d.id, d]));
  }

  private meetingToApi(m: Meeting, docMap: Map<string, Document>) {
    const agendaDoc = docMap.get(m.agendaDocumentId);
    const minutesDoc = m.minutesDocumentId ? docMap.get(m.minutesDocumentId) : null;
    return {
      id: m.id,
      date: m.date,
      meeting_number: m.meetingNumber,
      location: m.location ?? null,
      previous_meeting_id: m.previousMeetingId ?? null,
      agenda_document_id: m.agendaDocumentId,
      minutes_document_id: m.minutesDocumentId ?? null,
      agenda_content: agendaDoc?.content ?? EMPTY_DOC,
      minutes_content: minutesDoc?.content ?? null,
      created_at: m.createdAt ?? undefined,
      updated_at: m.updatedAt ?? undefined,
    };
  }
}
