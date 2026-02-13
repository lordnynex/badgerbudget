export interface EventPlanningMilestone {
  id: string;
  event_id: string;
  month: number;
  year: number;
  description: string;
  sort_order: number;
  completed: boolean;
  due_date: string;
}

export interface EventPackingItem {
  id: string;
  event_id: string;
  category: string;
  name: string;
  sort_order: number;
}

export interface EventVolunteer {
  id: string;
  event_id: string;
  name: string;
  department: string;
  sort_order: number;
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
  packingItems?: EventPackingItem[];
  volunteers?: EventVolunteer[];
}
