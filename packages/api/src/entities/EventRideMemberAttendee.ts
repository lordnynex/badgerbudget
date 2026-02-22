import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("event_ride_member_attendees")
export class EventRideMemberAttendee {
  @PrimaryColumn()
  id!: string;

  @Column({ name: "event_id" })
  eventId!: string;

  @Column({ name: "member_id" })
  memberId!: string;

  @Column({ name: "sort_order", type: "integer", default: 0 })
  sortOrder!: number;

  @Column({ name: "waiver_signed", type: "integer", default: 0 })
  waiverSigned!: number;
}
