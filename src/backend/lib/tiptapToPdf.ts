/**
 * Converts TipTap/ProseMirror JSON to a clean PDF with formatted text only.
 * No background styling, minimal file size.
 */
import { jsPDF } from "jspdf";

type TextAlign = "left" | "center" | "right" | "justify";

type ProseNode = {
  type: string;
  content?: ProseNode[];
  text?: string;
  marks?: { type: string }[];
  attrs?: { level?: number; checked?: boolean; textAlign?: TextAlign };
};

/** A segment of text with inline formatting (bold/italic) for PDF output */
type TextRun = { text: string; bold: boolean; italic: boolean };

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

/** Collect inline text runs from block content (paragraph, heading), preserving bold/italic marks. */
function getTextRuns(node: ProseNode): TextRun[] {
  if (!node.content) return [];
  const runs: TextRun[] = [];
  for (const child of node.content) {
    if (child.type === "text" && child.text != null) {
      const bold = child.marks?.some((m) => m.type === "bold") ?? false;
      const italic = child.marks?.some((m) => m.type === "italic") ?? false;
      if (child.text.length) runs.push({ text: child.text, bold, italic });
    } else if (child.content) {
      runs.push(...getTextRuns(child));
    }
  }
  return runs;
}

const LINE_HEIGHT = 1.4;
const MARGIN = 20;
const FONT_SIZES = { h1: 18, h2: 14, h3: 12, body: 11, small: 9 };
/** Vertical gap for an empty paragraph (extra line spacing). One empty line ≈ one line height. */
const EMPTY_PARAGRAPH_GAP_MM = 4;

function toTextAlign(value: unknown): TextAlign {
  if (value === "center" || value === "right" || value === "justify") return value;
  return "left";
}

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
      doc.setPage(doc.getNumberOfPages());
      y = MARGIN;
    }
  }

  function setFontStyle(fontSize: number, bold: boolean, italic: boolean) {
    doc.setFontSize(fontSize);
    const style = bold && italic ? "bolditalic" : bold ? "bold" : italic ? "italic" : "normal";
    doc.setFont("helvetica", style);
  }

  /** Reference x for alignment: left edge, page center, or right edge. */
  function getTextRefX(align: TextAlign, indent: number): number {
    if (align === "center") return pageWidth / 2;
    if (align === "right") return pageWidth - MARGIN;
    return MARGIN + indent;
  }

  function addText(
    text: string,
    options: {
      fontSize?: number;
      bold?: boolean;
      italic?: boolean;
      indent?: number;
      align?: TextAlign;
    } = {}
  ) {
    const {
      fontSize = FONT_SIZES.body,
      bold = false,
      italic = false,
      indent = 0,
      align = "left",
    } = options;
    setFontStyle(fontSize, bold, italic);
    const lines = doc.splitTextToSize(text, maxWidth - indent);
    const lh = fontSize * LINE_HEIGHT * 0.35;
    const refX = getTextRefX(align, indent);
    const textOpts = align !== "left" && align !== "justify" ? { align } : undefined;
    for (const line of lines) {
      checkPageBreak(lh);
      doc.text(line, refX, y, textOpts);
      y += lh;
    }
  }

  /** Build logical lines (each line = list of segments) from runs with wrapping. */
  function buildLinesFromRuns(
    runs: TextRun[],
    fontSize: number,
    lineMaxWidth: number
  ): TextRun[][] {
    const lines: TextRun[][] = [];
    let currentLine: TextRun[] = [];
    let currentLineWidth = 0;

    for (const run of runs) {
      if (!run.text.length) continue;
      setFontStyle(fontSize, run.bold, run.italic);
      let remaining = run.text;
      while (remaining.length > 0) {
        const spaceLeft = lineMaxWidth - currentLineWidth;
        const runLines = doc.splitTextToSize(remaining, Math.max(1, spaceLeft));
        if (runLines.length === 0) break;
        const first = runLines[0];
        if (first.length === 0) {
          remaining = "";
          break;
        }
        const firstW = doc.getTextWidth(first);
        currentLine.push({ text: first, bold: run.bold, italic: run.italic });
        currentLineWidth += firstW;
        if (runLines.length === 1) {
          remaining = "";
          continue;
        }
        lines.push(currentLine);
        currentLine = [];
        currentLineWidth = 0;
        remaining = remaining.slice(first.length);
      }
    }
    if (currentLine.length > 0) lines.push(currentLine);
    return lines;
  }

  /** Draw paragraph content as inline runs (bold/italic) with wrapping. Supports alignment. */
  function addRuns(
    runs: TextRun[],
    options: { fontSize?: number; indent?: number; align?: TextAlign } = {}
  ) {
    const { fontSize = FONT_SIZES.body, indent = 0, align = "left" } = options;
    const leftX = MARGIN + indent;
    const rightX = pageWidth - MARGIN;
    const lineMaxWidth = rightX - leftX;
    const lh = fontSize * LINE_HEIGHT * 0.35;

    const logicalLines = buildLinesFromRuns(runs, fontSize, lineMaxWidth);

    for (const segments of logicalLines) {
      checkPageBreak(lh);
      let totalWidth = 0;
      setFontStyle(fontSize, false, false);
      for (const seg of segments) {
        setFontStyle(fontSize, seg.bold, seg.italic);
        totalWidth += doc.getTextWidth(seg.text);
      }
      let segX: number;
      if (align === "center") segX = pageWidth / 2 - totalWidth / 2;
      else if (align === "right") segX = rightX - totalWidth;
      else segX = leftX;

      for (const seg of segments) {
        setFontStyle(fontSize, seg.bold, seg.italic);
        doc.text(seg.text, segX, y);
        segX += doc.getTextWidth(seg.text);
      }
      y += lh;
    }
  }

  function processNode(node: ProseNode, listIndent = 0) {
    switch (node.type) {
      case "doc":
        node.content?.forEach((c) => processNode(c));
        break;

      case "paragraph":
        if (!node.content?.length) {
          y += EMPTY_PARAGRAPH_GAP_MM;
          break;
        }
        const runs = getTextRuns(node);
        const paraText = runs.map((r) => r.text).join("");
        const paraAlign = toTextAlign(node.attrs?.textAlign);
        if (paraText.trim()) addRuns(runs, { indent: listIndent, align: paraAlign });
        break;

      case "heading": {
        const level = node.attrs?.level ?? 1;
        const text = getTextFromNode(node);
        const size = level === 1 ? FONT_SIZES.h1 : level === 2 ? FONT_SIZES.h2 : FONT_SIZES.h3;
        const headingAlign = toTextAlign(node.attrs?.textAlign);
        checkPageBreak(size * LINE_HEIGHT * 0.5);
        y += size * 0.3;
        addText(text, { fontSize: size, bold: true, align: headingAlign });
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
                lines.forEach((line: string) => {
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
        const prefix = style === "bullet" ? "• " : num !== undefined ? `${num}. ` : "";
        const runs = getTextRuns(c);
        const text = runs.map((r) => r.text).join("");
        const align = toTextAlign(c.attrs?.textAlign);
        if (text.trim()) {
          addRuns([{ text: prefix, bold: false, italic: false }, ...runs], { indent, align });
        }
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
