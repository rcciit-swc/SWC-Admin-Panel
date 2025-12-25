'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';
import { Bold, Italic, List, ListOrdered, Heading2 } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 p-2 border-b border-white/10 bg-[#0d0d12] rounded-t-lg flex-wrap">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-white/10 transition-colors ${
          editor.isActive('bold')
            ? 'bg-violet-500/20 text-violet-400'
            : 'text-zinc-400'
        }`}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-white/10 transition-colors ${
          editor.isActive('italic')
            ? 'bg-violet-500/20 text-violet-400'
            : 'text-zinc-400'
        }`}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-white/10 mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded hover:bg-white/10 transition-colors ${
          editor.isActive('heading', { level: 2 })
            ? 'bg-violet-500/20 text-violet-400'
            : 'text-zinc-400'
        }`}
        title="Heading"
      >
        <Heading2 className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-white/10 mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-white/10 transition-colors ${
          editor.isActive('bulletList')
            ? 'bg-violet-500/20 text-violet-400'
            : 'text-zinc-400'
        }`}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-white/10 transition-colors ${
          editor.isActive('orderedList')
            ? 'bg-violet-500/20 text-violet-400'
            : 'text-zinc-400'
        }`}
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
    </div>
  );
};

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Enter text...',
  minHeight = '200px',
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: `prose prose-invert max-w-none focus:outline-none min-h-[${minHeight}] p-3 text-sm text-white`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync editor content with external value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden bg-[#0a0a0f] focus-within:ring-2 focus-within:ring-violet-500/50 focus-within:border-violet-500/50 transition-all">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
