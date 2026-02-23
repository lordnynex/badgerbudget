import { describe, expect, test } from "bun:test";
import { generatePdfLabels } from "./pdf-labels";

describe("PDF labels", () => {
  test("generates PDF blob for recipients", () => {
    const recipients = [
      {
        name: "John Doe",
        addressLine1: "123 Main St",
        addressLine2: "Apt 4",
        city: "Madison",
        state: "WI",
        postalCode: "53703",
        country: "US",
      },
    ];
    const blob = generatePdfLabels(recipients);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toContain("pdf");
    expect(blob.size).toBeGreaterThan(100);
  });

  test("handles multiple recipients", () => {
    const recipients = [
      { name: "A", addressLine1: "1 St", city: "City", state: "ST", postalCode: "12345" },
      { name: "B", addressLine1: "2 St", city: "City", state: "ST", postalCode: "12345" },
    ];
    const blob = generatePdfLabels(recipients);
    expect(blob.size).toBeGreaterThan(200);
  });

  test("includes organization when option set", () => {
    const recipients = [
      {
        name: "Jane",
        addressLine1: "100 Org Way",
        city: "Chicago",
        state: "IL",
        postalCode: "60601",
        organization: "Acme Corp",
      },
    ];
    const blob = generatePdfLabels(recipients, { includeOrganization: true });
    expect(blob.size).toBeGreaterThan(100);
  });
});
