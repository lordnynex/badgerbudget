import { EventsPanel } from "@/components/events/EventsPanel";

type EventType = "badger" | "anniversary" | "pioneer_run" | "rides";

/** Events list page: optionally filtered by type. */
export function EventsPage({
  type,
}: {
  type?: EventType;
}) {
  return <EventsPanel type={type} />;
}
