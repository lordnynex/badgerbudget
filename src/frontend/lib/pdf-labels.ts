import { jsPDF } from "jspdf";

/** Avery 5160: 3 labels across, 10 down, 1" x 2.625" each, 0.5" margins */
const AVERY_5160 = {
  cols: 3,
  rows: 10,
  labelWidth: 72, // 1" in points (72 pt/inch)
  labelHeight: 189, // 2.625" in points
  marginLeft: 36, // 0.5"
  marginTop: 36, // 0.5"
  gapX: 9, // 1/8" between labels
  gapY: 0,
};

export interface LabelRecipient {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  organization?: string;
}

export interface PdfLabelOptions {
  template?: "avery5160";
  fontSize?: number;
  includeOrganization?: boolean;
  returnAddress?: string;
}

export function generatePdfLabels(
  recipients: LabelRecipient[],
  options: PdfLabelOptions = {}
): Blob {
  const opts = {
    template: "avery5160" as const,
    fontSize: 10,
    includeOrganization: false,
    ...options,
  };

  const { cols, rows, labelWidth, labelHeight, marginLeft, marginTop, gapX, gapY } = AVERY_5160;
  const labelsPerPage = cols * rows;

  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  let labelIndex = 0;

  for (const recipient of recipients) {
    const pageNum = Math.floor(labelIndex / labelsPerPage);
    if (pageNum > 0 && labelIndex % labelsPerPage === 0) {
      doc.addPage();
    }

    const col = labelIndex % cols;
    const row = Math.floor((labelIndex % labelsPerPage) / cols);

    const x = marginLeft + col * (labelWidth + gapX);
    const y = marginTop + row * (labelHeight + gapY);

    doc.setFontSize(opts.fontSize);

    let lineY = y + opts.fontSize + 2;
    const lineHeight = opts.fontSize * 1.4;

    if (opts.includeOrganization && recipient.organization) {
      doc.text(recipient.organization, x, lineY);
      lineY += lineHeight;
    }

    doc.text(recipient.name, x, lineY);
    lineY += lineHeight;

    if (recipient.addressLine1) {
      doc.text(recipient.addressLine1, x, lineY);
      lineY += lineHeight;
    }
    if (recipient.addressLine2) {
      doc.text(recipient.addressLine2, x, lineY);
      lineY += lineHeight;
    }

    const cityStateZip = [recipient.city, recipient.state, recipient.postalCode].filter(Boolean).join(", ");
    if (cityStateZip) {
      doc.text(cityStateZip, x, lineY);
      lineY += lineHeight;
    }
    if (recipient.country && recipient.country !== "US") {
      doc.text(recipient.country, x, lineY);
    }

    labelIndex++;
  }

  if (opts.returnAddress) {
    doc.setFontSize(8);
    doc.text(opts.returnAddress, marginLeft, marginTop - 10);
  }

  return doc.output("blob");
}
