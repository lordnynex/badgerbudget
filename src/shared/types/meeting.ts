export interface MeetingSummary {
  id: string;
  date: string;
  meeting_number: number;
  location: string | null;
  previous_meeting_id: string | null;
  agenda_document_id: string;
  minutes_document_id: string | null;
  agenda_content: string;
  minutes_content: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface MeetingMotion {
  id: string;
  meeting_id: string;
  description: string;
  result: "pass" | "fail";
  order_index: number;
  created_at?: string;
}

export interface MeetingActionItem {
  id: string;
  meeting_id: string;
  description: string;
  assignee_member_id: string | null;
  assignee_name?: string | null;
  due_date: string | null;
  status: "open" | "completed";
  completed_at: string | null;
  order_index: number;
  created_at?: string;
}

export interface OldBusinessItem {
  id: string;
  meeting_id: string;
  description: string;
  status: "open" | "closed";
  closed_at: string | null;
  closed_in_meeting_id: string | null;
  order_index: number;
  created_at?: string;
  is_carried?: boolean;
}

export interface MeetingDetail extends MeetingSummary {
  motions: MeetingMotion[];
  action_items: MeetingActionItem[];
  old_business: OldBusinessItem[];
}

export interface MeetingTemplate {
  id: string;
  name: string;
  type: "agenda" | "minutes";
  document_id: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}
