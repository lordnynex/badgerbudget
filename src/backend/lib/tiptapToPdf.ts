/**
 * Converts TipTap/ProseMirror JSON to a clean PDF with formatted text only.
 * No background styling, minimal file size.
 */
import { jsPDF } from "jspdf";

type ProseNode = {
  type: string;
  content?: ProseNode[];
  text?: string;
  marks?: { type: string }[];
  attrs?: { level?: number; checked?: boolean };
};

function getTextFromNode(node: ProseNode): string {
  if (node.text) return node.text;
  if (!node.content) return "";
  return node.content.map(getTextFromNode).join("");
}

function getTextWithFormatting(node: ProseNode): string {
  if (node.type === "text") return node.text ?? "";
  if (!node.content) return "";
  return node.content.map(getTextWithFormatting).join("");
}

const LINE_HEIGHT = 1.4;
const MARGIN = 20;
const FONT_SIZES = { h1: 18, h2: 14, h3: 12, body: 11, small: 9 };

export function tiptapJsonToPdf(contentJson: string): Buffer {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  let parsed: ProseNode;
  try {
    parsed = JSON.parse(contentJson) as ProseNode;
  } catch {
    parsed = {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: contentJson }] }],
    };
  }

  if (!parsed?.content?.length) {
    doc.setFontSize(FONT_SIZES.body);
    doc.text("(Empty document)", MARGIN, MARGIN);
    return Buffer.from(doc.output("arraybuffer"));
  }

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - MARGIN * 2;
  let y = MARGIN;

  function checkPageBreak(needed: number) {
    if (y + needed > pageHeight - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  }

  function addText(
    text: string,
    options: { fontSize?: number; bold?: boolean; indent?: number } = {}
  ) {
    const { fontSize = FONT_SIZES.body, bold = false, indent = 0 } = options;
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", bold ? "bold" : "normal");

    const lines = doc.splitTextToSize(text, maxWidth - indent);
    for (const line of lines) {
      checkPageBreak(fontSize * LINE_HEIGHT * 0.35);
      doc.text(line, MARGIN + indent, y);
      y += fontSize * LINE_HEIGHT * 0.35;
    }
  }

  function processNode(node: ProseNode, listIndent = 0) {
    switch (node.type) {
      case "doc":
        node.content?.forEach((c) => processNode(c));
        break;

      case "paragraph":
        if (!node.content?.length) {
          y += FONT_SIZES.body * LINE_HEIGHT * 0.2;
          break;
        }
        const text = getTextWithFormatting(node);
        if (text.trim()) addText(text, { indent: listIndent });
        break;

      case "heading": {
        const level = node.attrs?.level ?? 1;
        const text = getTextFromNode(node);
        const size = level === 1 ? FONT_SIZES.h1 : level === 2 ? FONT_SIZES.h2 : FONT_SIZES.h3;
        checkPageBreak(size * LINE_HEIGHT * 0.5);
        y += size * 0.3;
        addText(text, { fontSize: size, bold: true });
        y += size * 0.2;
        break;
      }

      case "bulletList":
        node.content?.forEach((item) => processListItem(item, "bullet", listIndent, undefined));
        break;

      case "orderedList": {
        node.content?.forEach((item, i) => processListItem(item, "ordered", listIndent, i + 1));
        break;
      }

      case "listItem":
        processListItem(node, "bullet", listIndent, undefined);
        break;

      case "blockquote":
        node.content?.forEach((c) => processNode(c, listIndent + 8));
        break;

      case "horizontalRule":
        checkPageBreak(5);
        y += 2;
        doc.setDrawColor(200, 200, 200);
        doc.line(MARGIN, y, pageWidth - MARGIN, y);
        y += 5;
        break;

      case "table": {
        node.content?.forEach((row) => {
          if (row.type === "tableRow" && row.content) {
            const cells = row.content
              .filter((c) => c.type === "tableCell" || c.type === "tableHeader")
              .map((c) => getTextFromNode(c).replace(/\n/g, " ").trim());
            if (cells.length) {
              checkPageBreak(FONT_SIZES.body * LINE_HEIGHT * 0.5);
              const colWidth = maxWidth / cells.length;
              const cellY = y;
              let maxCellHeight = FONT_SIZES.small * 0.35;
              cells.forEach((cell, colIdx) => {
                doc.setFontSize(FONT_SIZES.small);
                doc.setFont("helvetica", "normal");
                const lines = doc.splitTextToSize(cell, colWidth - 2);
                let lineY = cellY;
                lines.forEach((line) => {
                  doc.text(line, MARGIN + colIdx * colWidth + 1, lineY + 3);
                  lineY += FONT_SIZES.small * 0.35;
                });
                maxCellHeight = Math.max(maxCellHeight, lineY - cellY);
              });
              y += maxCellHeight + 2;
            }
          }
        });
        break;
      }

      case "taskList":
        node.content?.forEach((item) => {
          if (item.type === "taskItem") {
            const text = getTextFromNode(item);
            const checked = item.attrs?.checked;
            addText(`${checked ? "☑" : "☐"} ${text}`, { indent: listIndent });
          }
        });
        break;

      default:
        node.content?.forEach((c) => processNode(c, listIndent));
    }
  }

  function processListItem(
    item: ProseNode,
    style: "bullet" | "ordered",
    baseIndent: number,
    num?: number
  ) {
    const indent = baseIndent + 6;
    item.content?.forEach((c) => {
      if (c.type === "paragraph") {
        const text = getTextWithFormatting(c);
        const prefix = style === "bullet" ? "• " : num !== undefined ? `${num}. ` : "";
        if (text.trim()) addText(prefix + text, { indent });
      } else if (c.type === "bulletList") {
        c.content?.forEach((sub) => processListItem(sub, "bullet", indent, undefined));
      } else if (c.type === "orderedList") {
        c.content?.forEach((sub, i) => processListItem(sub, "ordered", indent, i + 1));
      } else {
        processNode(c, indent);
      }
    });
  }

  processNode(parsed);
  return Buffer.from(doc.output("arraybuffer"));
}
