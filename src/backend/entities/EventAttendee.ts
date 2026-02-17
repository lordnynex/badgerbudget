import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("event_attendees")
export class EventAttendee {
  @PrimaryColumn()
  id!: string;

  @Column({ name: "event_id" })
  eventId!: string;

  @Column({ name: "contact_id" })
  contactId!: string;

  @Column({ name: "sort_order", type: "integer", default: 0 })
  sortOrder!: number;

  @Column({ name: "waiver_signed", type: "integer", default: 0 })
  waiverSigned!: number;
}
