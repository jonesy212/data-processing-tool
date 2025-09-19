interface BumpVersionOptions {
  notesStrategy?: 'append' | 'replace' | 'prepend' | 'ignore';
  clearPreviousNotes?: boolean;
  maxNotes?: number;
}


export { BumpVersionOptions };
