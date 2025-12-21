// functions.ts
import parse from 'html-react-parser';
import { cn } from '@/lib/utils';

export const quillStyles: Record<string, string> = {
  p: 'mb-4 text-base text-gray-100 font-medium',
  h1: 'mt-6 mb-2 text-3xl font-bold text-white',
  h2: 'mt-5 mb-2 text-2xl font-bold text-white',
  h3: 'mt-4 mb-2 text-xl font-bold text-white',
  h4: 'mt-3 mb-2 text-lg font-bold text-white',
  h5: 'mt-2 mb-2 text-base font-bold text-white',
  h6: 'mt-1 mb-2 text-sm font-bold text-white',
  strong: 'font-bold !text-purple-300',
  em: 'italic text-gray-100',
  u: 'underline text-gray-100',
  a: 'text-purple-300 hover:underline hover:text-purple-200',
  blockquote: 'border-l-4 border-purple-400 pl-4 italic text-gray-100 my-4',
  ul: 'list-disc pl-6 mb-4 space-y-2',
  ol: 'list-decimal pl-6 mb-4 space-y-2',
  li: 'text-gray-100',
  pre: 'bg-gray-800 p-4 rounded text-sm overflow-x-auto my-4 text-gray-100',
  code: 'bg-gray-800 px-1 py-0.5 rounded text-sm font-mono text-purple-300',
  img: 'max-w-full h-auto my-4',
};

export const parseWithQuillStyles = (html: string) => {
  return parse(html, {
    replace: (domNode: any) => {
      if (domNode.type === 'tag') {
        const tagName = domNode.name.toLowerCase();
        // Avoid invalid nested <p> inside other <p> wrappers (e.g. CardDescription)
        // Convert paragraph tags to spans to prevent hydration errors.
        if (tagName === 'p') {
          domNode.name = 'span';
        }
        if (quillStyles[tagName]) {
          const existingClass = domNode.attribs?.class || '';
          const newClass = cn(existingClass, quillStyles[tagName]);
          domNode.attribs = { ...domNode.attribs, class: newClass };
          return domNode;
        }
      }
    },
  });
};
