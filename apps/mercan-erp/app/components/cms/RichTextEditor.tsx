"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { 
  Bold, Italic, List, ListOrdered, Quote, Undo, Redo, 
  AlignLeft, AlignCenter, AlignRight, Underline as UnderlineIcon,
  Link as LinkIcon, Image as ImageIcon, X
} from "lucide-react";
import { useState } from "react";
import MediaPicker from "./MediaPicker";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: "text-teal-400 underline font-bold cursor-pointer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-2xl border border-white/10 shadow-2xl my-8",
        },
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-invert prose-teal max-w-none min-h-[400px] outline-none p-6 font-medium italic",
      },
    },
  });

  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Bağlantı URL'sini girin:", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const onMediaSelect = (fileId: string, fileUrl?: string) => {
    if (fileUrl) {
      editor.chain().focus().setImage({ src: fileUrl }).run();
    }
    setIsMediaPickerOpen(false);
  };

  return (
    <div className="w-full border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden bg-white dark:bg-black/20">
      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 dark:bg-white/[0.03] border-b border-slate-200 dark:border-white/5">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} icon={<Bold size={16} />} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} icon={<Italic size={16} />} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} icon={<UnderlineIcon size={16} />} />
        
        <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-1" />
        
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} icon={<AlignLeft size={16} />} />
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} icon={<AlignCenter size={16} />} />
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} icon={<AlignRight size={16} />} />
        
        <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} icon={<List size={16} />} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} icon={<ListOrdered size={16} />} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} icon={<Quote size={16} />} />

        <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-1" />

        {/* YENİ BUTONLAR: LINK & IMAGE */}
        <ToolbarButton onClick={setLink} active={editor.isActive("link")} icon={<LinkIcon size={16} />} />
        <ToolbarButton onClick={() => setIsMediaPickerOpen(true)} active={false} icon={<ImageIcon size={16} />} />

        <div className="flex-1" />

        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} active={false} icon={<Undo size={16} />} />
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} active={false} icon={<Redo size={16} />} />
      </div>

      {/* EDITOR AREA */}
      <EditorContent editor={editor} />

      {/* MEDIA PICKER MODAL */}
      {isMediaPickerOpen && (
        <MediaPicker 
          isOpen={isMediaPickerOpen}
          onSelect={onMediaSelect} 
          onClose={() => setIsMediaPickerOpen(false)} 
        />
      )}
    </div>
  );
}

function ToolbarButton({ onClick, active, icon }: { onClick: () => void; active: boolean; icon: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded-lg transition-all ${
        active 
          ? "bg-teal-500/20 text-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.2)]" 
          : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
      }`}
    >
      {icon}
    </button>
  );
}
