export interface EventMilestoneMember {
  id: string;
  milestone_id: string;
  member_id: string;
  sort_order: number;
  member?: { id: string; name: string; photo_url: string | null; photo_thumbnail_url: string | null };
}

export interface EventPlanningMilestone {
  id: string;
  event_id: string;
  month: number;
  year: number;
  description: string;
  sort_order: number;
  completed: boolean;
  due_date: string;
  members?: EventMilestoneMember[];
}

export interface EventPackingCategory {
  id: string;
  event_id: string;
  name: string;
  sort_order: number;
}

export interface EventPackingItem {
  id: string;
  event_id: string;
  category_id: string;
  name: string;
  sort_order: number;
  quantity?: number | null;
  note?: string | null;
  loaded?: boolean;
}

export interface EventVolunteer {
  id: string;
  event_id: string;
  name: string;
  department: string;
  sort_order: number;
}

export type EventAssignmentCategory = "planning" | "during";

export interface EventAssignmentMember {
  id: string;
  assignment_id: string;
  member_id: string;
  sort_order: number;
  member?: { id: string; name: string; photo_url: string | null; photo_thumbnail_url: string | null };
}

export interface EventAssignment {
  id: string;
  event_id: string;
  name: string;
  category: EventAssignmentCategory;
  sort_order: number;
  members?: EventAssignmentMember[];
}

export interface Event {
  id: string;
  name: string;
  description: string | null;
  year: number | null;
  event_date: string | null;
  event_url: string | null;
  event_location: string | null;
  event_location_embed: string | null;
  ga_ticket_cost: number | null;
  day_pass_cost: number | null;
  ga_tickets_sold: number | null;
  day_passes_sold: number | null;
  budget_id: string | null;
  scenario_id: string | null;
  planning_notes: string | null;
  created_at?: string;
  milestones?: EventPlanningMilestone[];
  packingCategories?: EventPackingCategory[];
  packingItems?: EventPackingItem[];
  volunteers?: EventVolunteer[];
  assignments?: EventAssignment[];
}
