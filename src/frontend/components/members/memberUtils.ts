import type { Member } from "@/types/budget";
import { MONTHS } from "@/lib/date-utils";
import { escapeVCardValue } from "@/lib/vcard";

export { MONTHS };

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function getYearsAsMember(memberSince: string | null): number | null {
  if (!memberSince || !/^\d{4}-\d{2}$/.test(memberSince)) return null;
  const start = new Date(memberSince + "-01");
  const today = new Date();
  const years = (today.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  return Math.round(years);
}

export function formatMemberSinceDisplay(memberSince: string | null): string {
  if (!memberSince || !/^\d{4}-\d{2}$/.test(memberSince)) return "";
  const [y, mo] = memberSince.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[parseInt(mo, 10) - 1] ?? mo;
  const years = getYearsAsMember(memberSince);
  if (years !== null) {
    return `${month} ${y} (${years} year${years === 1 ? "" : "s"})`;
  }
  return `${month} ${y}`;
}

export function formatBirthdayDate(d: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

/** Format birthday string (YYYY-MM-DD) for display, e.g. "January 15, 2025" */
export function formatBirthday(d: string | null): string {
  if (!d) return "";
  try {
    const [y, mo, day] = d.split("-");
    const month = MONTHS[parseInt(mo ?? "1", 10) - 1] ?? mo;
    return `${month} ${day}, ${y}`;
  } catch {
    return d;
  }
}

/** Format member_since (YYYY-MM) for display, e.g. "January 2025" */
export function formatMemberSince(d: string | null): string {
  if (!d || !/^\d{4}-\d{2}$/.test(d)) return "";
  const [y, mo] = d.split("-");
  const month = MONTHS[parseInt(mo ?? "1", 10) - 1] ?? mo;
  return `${month} ${y}`;
}

export function formatAnniversaryDate(date: Date, member: Member): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const base = `${months[date.getMonth()]} ${date.getDate()}`;
  if (!member.member_since || !/^\d{4}-\d{2}$/.test(member.member_since)) return base;
  const joinYear = parseInt(member.member_since.slice(0, 4), 10);
  const years = date.getFullYear() - joinYear;
  return `${base} (${years} year${years === 1 ? "" : "s"})`;
}

export function getUpcomingBirthdays(members: Member[], daysAhead = 90): { member: Member; date: Date }[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + daysAhead);

  const result: { member: Member; date: Date }[] = [];
  for (const m of members) {
    if (!m.birthday || !/^\d{4}-\d{2}-\d{2}$/.test(m.birthday)) continue;
    const [, month, day] = m.birthday.split("-").map(Number);
    const thisYear = new Date(today.getFullYear(), month - 1, day);
    const nextYear = new Date(today.getFullYear() + 1, month - 1, day);
    const bdayDate = thisYear >= today ? thisYear : nextYear;
    if (bdayDate >= today && bdayDate <= endDate) {
      result.push({ member: m, date: bdayDate });
    }
  }
  result.sort((a, b) => a.date.getTime() - b.date.getTime());
  return result;
}

export function getUpcomingAnniversaries(members: Member[], daysAhead = 90): { member: Member; date: Date }[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + daysAhead);

  const result: { member: Member; date: Date }[] = [];
  for (const m of members) {
    if (!m.member_since || !/^\d{4}-\d{2}$/.test(m.member_since)) continue;
    const [, month] = m.member_since.split("-").map(Number);
    const thisYear = new Date(today.getFullYear(), month - 1, 1);
    const nextYear = new Date(today.getFullYear() + 1, month - 1, 1);
    const annivDate = thisYear >= today ? thisYear : nextYear;
    if (annivDate >= today && annivDate <= endDate) {
      result.push({ member: m, date: annivDate });
    }
  }
  result.sort((a, b) => a.date.getTime() - b.date.getTime());
  return result;
}

function memberToVCard(m: Member): string {
  const lines: string[] = ["BEGIN:VCARD", "VERSION:3.0"];
  lines.push(`FN:${escapeVCardValue(m.name)}`);
  const nameParts = m.name.trim().split(/\s+/);
  const family = nameParts.length > 1 ? nameParts.pop()! : "";
  const given = nameParts.join(" ");
  lines.push(`N:${escapeVCardValue(family)};${escapeVCardValue(given)};;;`);
  if (m.phone_number) lines.push(`TEL;TYPE=CELL:${m.phone_number.replace(/\s/g, "")}`);
  if (m.email) lines.push(`EMAIL:${m.email}`);
  if (m.address) lines.push(`ADR;TYPE=HOME:;;${escapeVCardValue(m.address)};;;;`);
  if (m.birthday) lines.push(`BDAY:${m.birthday.replace(/-/g, "")}`);
  if (m.position) lines.push(`TITLE:${escapeVCardValue(m.position)}`);
  const noteParts: string[] = [];
  if (m.member_since) {
    const [y, mo] = m.member_since.split("-");
    noteParts.push(`Member since ${mo}/${y}`);
  }
  if (m.emergency_contact_name || m.emergency_contact_phone) {
    const ec = [m.emergency_contact_name, m.emergency_contact_phone].filter(Boolean).join(": ");
    noteParts.push(`Emergency contact: ${ec}`);
  }
  if (noteParts.length > 0) {
    lines.push(`NOTE:${escapeVCardValue(noteParts.join(". "))}`);
  }
  lines.push("END:VCARD");
  return lines.join("\r\n");
}

function escapeIcalText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function downloadMembersJson(members: Member[]) {
  const json = JSON.stringify(members, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "members.json";
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadMembersVCard(members: Member[]) {
  const vcf = members.map(memberToVCard).join("\r\n");
  const blob = new Blob([vcf], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "members.vcf";
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadBirthdaysIcal(members: Member[]) {
  const withBirthday = members.filter((m) => m.birthday && /^\d{4}-\d{2}-\d{2}$/.test(m.birthday));
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Badger Budget//Members Birthdays//EN",
    "CALSCALE:GREGORIAN",
  ];
  for (const m of withBirthday) {
    const dt = (m.birthday ?? "").replace(/-/g, "");
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:member-${m.id}-birthday@badgerbudget`);
    lines.push(`DTSTART;VALUE=DATE:${dt}`);
    lines.push("RRULE:FREQ=YEARLY");
    lines.push(`SUMMARY:${escapeIcalText(m.name)}'s Birthday`);
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  const ics = lines.join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "member-birthdays.ics";
  a.click();
  URL.revokeObjectURL(url);
}
