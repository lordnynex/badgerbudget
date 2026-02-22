import { useCallback, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TableKit } from "@tiptap/extension-table";
import Heading from "@tiptap/extension-heading";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Typography from "@tiptap/extension-typography";
import TextAlign from "@tiptap/extension-text-align";
import Gapcursor from "@tiptap/extension-gapcursor";
import Dropcursor from "@tiptap/extension-dropcursor";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Highlighter,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Table,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  CheckSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

const EMPTY_DOC = { type: "doc", content: [{ type: "paragraph" }] };

function parseContent(content: string | null | undefined): object {
  if (!content || content.trim() === "") return EMPTY_DOC;
  try {
    const parsed = JSON.parse(content) as object;
    if (parsed && typeof parsed === "object" && "type" in parsed) return parsed;
  } catch {
    // fallback: treat as plain text in a paragraph
    return { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: content }] }] };
  }
  return EMPTY_DOC;
}

interface RichDocumentEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
  /** Ref for the element to capture for PDF export */
  printRef?: React.RefObject<HTMLDivElement | null>;
  /** Optional toolbar actions (e.g. Save, Export) to render in the editor chrome */
  toolbarActions?: React.ReactNode;
  /** Use full height to fill available space */
  fullHeight?: boolean;
  /** Compact display: no border, smaller typography, minimal min-height */
  compact?: boolean;
  /** Keep toolbar visible when scrolling (sticky at top of editor area) */
  stickyToolbar?: boolean;
}

export function RichDocumentEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  className,
  editable = true,
  toolbarActions,
  fullHeight = false,
  compact = false,
  stickyToolbar = false,
}: RichDocumentEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        link: false,
        underline: false,
        strike: false,
        horizontalRule: false,
        gapcursor: false,
        dropcursor: false,
      }),
      Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
      TableKit,
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder }),
      Underline,
      Strike,
      Highlight,
      TaskList,
      TaskItem.configure({ nested: true }),
      HorizontalRule,
      Typography,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Gapcursor,
      Dropcursor,
    ],
    content: parseContent(value),
    editable,
    editorProps: {
      attributes: {
        class: cn(
          "focus:outline-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:border-muted [&_blockquote]:pl-4 [&_blockquote]:italic [&_table]:border-collapse [&_th]:border [&_th]:p-2 [&_td]:border [&_td]:p-2",
          compact
            ? "px-2 py-1 [&_h1]:text-base [&_h1]:font-bold [&_h2]:text-sm [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-medium [&_p]:my-0.5 [&_p]:text-sm"
            : "px-4 py-3 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-semibold [&_p]:my-2",
          fullHeight ? "min-h-[400px]" : compact ? "min-h-0" : "min-h-[200px]"
        ),
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) return;
    const parsed = parseContent(value);
    const current = editor.getJSON();
    // Guard: never overwrite editor with empty when we have substantial content
    // (prevents data loss from race conditions, stale refetches, or malformed JSON)
    const isEmptyIncoming = !value || value.trim() === "";
    const isEffectivelyEmpty = JSON.stringify(parsed) === JSON.stringify(EMPTY_DOC);
    const hasContent =
      (current.content?.length ?? 0) > 1 ||
      ((current.content?.[0] as { content?: unknown[] } | undefined)?.content?.length ?? 0) > 0;
    if ((isEmptyIncoming || isEffectivelyEmpty) && hasContent) return;
    if (JSON.stringify(current) !== JSON.stringify(parsed)) {
      editor.commands.setContent(parsed, { emitUpdate: false });
    }
  }, [value, editor]);

  const handleUpdate = useCallback(() => {
    if (!editor) return;
    const json = editor.getJSON();
    onChange(JSON.stringify(json));
  }, [editor, onChange]);

  useEffect(() => {
    if (!editor) return;
    editor.on("update", handleUpdate);
    return () => {
      editor.off("update", handleUpdate);
    };
  }, [editor, handleUpdate]);

  if (!editor) return null;

  return (
    <div
      className={cn(
        "flex flex-col",
        !compact && "rounded-md border bg-background",
        fullHeight && "min-h-0 flex-1",
        className
      )}
    >
      {editable && (
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-2 border-b bg-background p-2",
            stickyToolbar && "sticky top-0 z-10"
          )}
        >
          <div className="flex flex-wrap items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            title="Bold"
          >
            <Bold className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            title="Italic"
          >
            <Italic className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
            title="Underline"
          >
            <UnderlineIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive("strike")}
            title="Strikethrough"
          >
            <Strikethrough className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            isActive={editor.isActive("highlight")}
            title="Highlight"
          >
            <Highlighter className="size-4" />
          </ToolbarButton>
          <span className="mx-1 h-5 w-px bg-border" />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive("heading", { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive("heading", { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive("heading", { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className="size-4" />
          </ToolbarButton>
          <span className="mx-1 h-5 w-px bg-border" />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            title="Bullet list"
          >
            <List className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            title="Numbered list"
          >
            <ListOrdered className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            isActive={editor.isActive("taskList")}
            title="Task list"
          >
            <CheckSquare className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
            title="Quote"
          >
            <Quote className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            title="Insert table"
          >
            <Table className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal rule"
          >
            <Minus className="size-4" />
          </ToolbarButton>
          <span className="mx-1 h-5 w-px bg-border" />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            isActive={editor.isActive({ textAlign: "left" })}
            title="Align left"
          >
            <AlignLeft className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            isActive={editor.isActive({ textAlign: "center" })}
            title="Align center"
          >
            <AlignCenter className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            isActive={editor.isActive({ textAlign: "right" })}
            title="Align right"
          >
            <AlignRight className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            isActive={editor.isActive({ textAlign: "justify" })}
            title="Justify"
          >
            <AlignJustify className="size-4" />
          </ToolbarButton>
          </div>
          {toolbarActions && (
            <div className="flex items-center gap-1 border-l pl-2">
              {toolbarActions}
            </div>
          )}
        </div>
      )}
      <div className={cn("flex-1 min-h-0 overflow-auto", fullHeight && "flex flex-col")}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function ToolbarButton({
  onClick,
  isActive,
  title,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={cn(isActive && "bg-muted")}
    >
      {children}
    </Button>
  );
}
