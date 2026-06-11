import { Mark, mergeAttributes } from '@tiptap/core';

export const JobLarge = Mark.create({
  name: 'jobLarge',

  parseHTML() {
    return [
      { tag: 'span[data-job-lg="1"]' },
      { tag: 'span[data-job-lg]' },
    ];
  },

  renderHTML() {
    return [
      'span',
      mergeAttributes({
        'data-job-lg': '1',
        class: 'text-lg font-medium leading-relaxed text-zinc-900 sm:text-xl',
      }),
      0,
    ];
  },
});
