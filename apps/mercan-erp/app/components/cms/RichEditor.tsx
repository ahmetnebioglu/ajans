"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo, 
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon
} from 'lucide-react';

interface RichEditorProps {
  content: string;
  onChange: (content: string) => void;
  label?: string;
}

export default function RichEditor({ content, onChange, label }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[150px] p-5 text-sm font-medium',
      },
    },
  });

  if (!editor) return null;

  const btnCls = (active?: boolean) =>
    `p-2 rounded-lg transition-all ${active ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'}`;

  return (
    <div className="space-y-3">
      {label && <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>}
      
      <div className="border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900/50 focus-within:ring-4 focus-within:ring-emerald-600/10 transition-all shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
          <button onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }} className={btnCls(editor.isActive('bold'))} title="Kalın"><Bold size={15} /></button>
          <button onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }} className={btnCls(editor.isActive('italic'))} title="İtalik"><Italic size={15} /></button>
          <button onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }} className={btnCls(editor.isActive('underline'))} title="Altı Çizili"><UnderlineIcon size={15} /></button>
          
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
          
          <button onClick={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('left').run(); }} className={btnCls(editor.isActive({ textAlign: 'left' }))} title="Sola Hizala"><AlignLeft size={15} /></button>
          <button onClick={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('center').run(); }} className={btnCls(editor.isActive({ textAlign: 'center' }))} title="Ortala"><AlignCenter size={15} /></button>
          <button onClick={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('right').run(); }} className={btnCls(editor.isActive({ textAlign: 'right' }))} title="Sağa Hizala"><AlignRight size={15} /></button>
          <button onClick={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('justify').run(); }} className={btnCls(editor.isActive({ textAlign: 'justify' }))} title="İki Yana Yasla"><AlignLeft size={15} className="rotate-90 opacity-50" /></button>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

          <button onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }} className={btnCls(editor.isActive('bulletList'))} title="Madde Listesi"><List size={15} /></button>
          <button onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }} className={btnCls(editor.isActive('orderedList'))} title="Numaralı Liste"><ListOrdered size={15} /></button>
          <button onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run(); }} className={btnCls(editor.isActive('blockquote'))} title="Alıntı"><Quote size={15} /></button>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

          <button onClick={(e) => { e.preventDefault(); editor.chain().focus().undo().run(); }} className={btnCls()} title="Geri Al"><Undo size={15} /></button>
          <button onClick={(e) => { e.preventDefault(); editor.chain().focus().redo().run(); }} className={btnCls()} title="İleri Al"><Redo size={15} /></button>
        </div>

        {/* Editor Area */}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
