import { useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, List, Type, Underline as UnderlineIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { JobLarge } from '@/lib/tiptap/JobLargeMark';

type Props = {
  id: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
};

export function JobOverviewRichEditor({
  id,
  value,
  onChange,
  placeholder = 'Describe el puesto…',
  className,
}: Props) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const editor = useEditor({
    immediatelyRender: true,
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        code: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Underline,
      JobLarge,
      Placeholder.configure({ placeholder, showOnlyWhenEditable: true }),
    ],
    content: value || '<p></p>',
    editorProps: {
      attributes: {
        class:
          'tiptap-prose ProseMirror min-h-[12rem] max-w-none rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus-visible:ring-2 focus-visible:ring-[#17304b]/20',
        'data-testid': 'job-overview-rte',
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChangeRef.current(ed.getHTML());
    },
  });

  if (!editor) {
    return (
      <div className="min-h-[12rem] animate-pulse rounded-md border border-zinc-100 bg-zinc-50" aria-hidden />
    );
  }

  return (
    <div className={cn('space-y-2', className)} data-editor-id={id}>
      <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Formato de overview">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={cn('h-8 rounded-md px-2', editor.isActive('bold') && 'bg-zinc-100')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="mr-1 size-3.5" />
          Negrita
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={cn('h-8 rounded-md px-2', editor.isActive('underline') && 'bg-zinc-100')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="mr-1 size-3.5" />
          Subrayado
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={cn('h-8 rounded-md px-2', editor.isActive('jobLarge') && 'bg-zinc-100')}
          title="Texto más grande (puedes combinar con negrita)"
          onClick={() => editor.chain().focus().toggleMark('jobLarge').run()}
        >
          <Type className="mr-1 size-3.5" />
          Texto grande
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={cn('h-8 rounded-md px-2', editor.isActive('bulletList') && 'bg-zinc-100')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="mr-1 size-3.5" />
          Viñetas
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
