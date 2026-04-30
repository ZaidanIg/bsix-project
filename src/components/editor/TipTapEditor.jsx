"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Strikethrough, Heading1, Heading2, List, ListOrdered, Quote, Undo, Redo } from "lucide-react";
import { useEffect } from "react";

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const btnClass = "h-8 w-8 p-0";

  return (
    <div className="flex flex-wrap gap-1 p-1 border-b bg-slate-50 rounded-t-md">
      <Button variant="ghost" size="sm" className={btnClass} onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} data-active={editor.isActive("bold") ? "true" : "false"}>
        <Bold className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" className={btnClass} onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} data-active={editor.isActive("italic") ? "true" : "false"}>
        <Italic className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" className={btnClass} onClick={() => editor.chain().focus().toggleStrike().run()} disabled={!editor.can().chain().focus().toggleStrike().run()} data-active={editor.isActive("strike") ? "true" : "false"}>
        <Strikethrough className="h-4 w-4" />
      </Button>
      <div className="w-px h-8 bg-slate-200 mx-1" />
      <Button variant="ghost" size="sm" className={btnClass} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} data-active={editor.isActive("heading", { level: 1 }) ? "true" : "false"}>
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" className={btnClass} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} data-active={editor.isActive("heading", { level: 2 }) ? "true" : "false"}>
        <Heading2 className="h-4 w-4" />
      </Button>
      <div className="w-px h-8 bg-slate-200 mx-1" />
      <Button variant="ghost" size="sm" className={btnClass} onClick={() => editor.chain().focus().toggleBulletList().run()} data-active={editor.isActive("bulletList") ? "true" : "false"}>
        <List className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" className={btnClass} onClick={() => editor.chain().focus().toggleOrderedList().run()} data-active={editor.isActive("orderedList") ? "true" : "false"}>
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" className={btnClass} onClick={() => editor.chain().focus().toggleBlockquote().run()} data-active={editor.isActive("blockquote") ? "true" : "false"}>
        <Quote className="h-4 w-4" />
      </Button>
      <div className="w-px h-8 bg-slate-200 mx-1" />
      <Button variant="ghost" size="sm" className={btnClass} onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().chain().focus().undo().run()}>
        <Undo className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" className={btnClass} onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().chain().focus().redo().run()}>
        <Redo className="h-4 w-4" />
      </Button>
      
      <style jsx global>{`
        button[data-active="true"] { background-color: #e2e8f0; color: #0f172a; }
        .tiptap { padding: 1rem; min-height: 250px; outline: none; }
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        .tiptap p { margin-bottom: 0.75em; }
        .tiptap h1 { font-size: 1.875rem; font-weight: bold; margin-bottom: 0.5em; mt: 1em; }
        .tiptap h2 { font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5em; mt: 1em; }
        .tiptap ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1em; }
        .tiptap ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 1em; }
        .tiptap blockquote { border-left: 3px solid #cbd5e1; padding-left: 1rem; margin-left: 0; color: #475569; font-style: italic; }
      `}</style>
    </div>
  );
};

export default function TipTapEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none',
      },
    },
  });

  // Sinkronisasi jika content dari props berubah (misal saat reset form)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="border border-slate-300 rounded-md overflow-hidden bg-white">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
