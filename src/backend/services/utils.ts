export function uuid(): string {
  return crypto.randomUUID();
}

export const VALID_POSITIONS = new Set([
  "President",
  "Vice President",
  "Road Captain",
  "Treasurer",
  "Recording Secretary",
  "Correspondence Secretary",
  "Member",
]);

export const DEFAULT_SCENARIO_INPUTS = {
  profitTarget: 2500,
  staffCount: 14,
  maxOccupancy: 75,
  complimentaryTickets: 0,
  dayPassPrice: 50,
  dayPassesSold: 0,
  ticketPrices: {
    proposedPrice1: 200,
    proposedPrice2: 250,
    proposedPrice3: 300,
    staffPrice1: 150,
    staffPrice2: 125,
    staffPrice3: 100,
  },
};

export function parsePhotoToBlob(photo: string): Buffer | null {
  if (!photo || typeof photo !== "string") return null;
  const base64 = photo.includes(",") ? photo.split(",")[1] : photo;
  if (!base64) return null;
  try {
    return Buffer.from(base64, "base64");
  } catch {
    return null;
  }
}
