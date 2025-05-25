import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@/components/ui/button";

interface Props {
  content: string;
  setContent: (val: string) => void;
}

export const EditorDescricao = ({ content, setContent }: Props) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    autofocus: true,
    onUpdate: ({ editor }) => setContent(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "focus:outline-none prose dark:prose-invert prose-neutral max-w-none min-h-[300px] text-base px-4 py-3",
      },
    },
  });

  if (!editor) return null;

  const activeClass = (isActive: boolean) =>
    isActive
      ? "bg-blue-500 text-white"
      : "bg-gray-100 text-gray-700 hover:bg-gray-200";

  return (
    <div className="relative max-w-full bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm transition">
      {/* Toolbar fixa acima do editor */}
      <div className="flex gap-2 px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-xl">
        <Button
          size="sm"
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={activeClass(editor.isActive("bold"))}
          title="Negrito (Ctrl+B)"
        >
          <strong>B</strong>
        </Button>

        <Button
          size="sm"
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={activeClass(editor.isActive("italic"))}
          title="Itálico (Ctrl+I)"
        >
          <em>I</em>
        </Button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
};
