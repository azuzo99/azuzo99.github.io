// Text normalization shared by the design snapshot and the site copy test.

/** Collapse whitespace (incl. <br> line breaks) so layout differences do not matter. */
export function collapse(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

/** Apply the approved copy changes to design text (docs/inventory.md §10 #2, #7). */
export function applyCopyDecisions(s: string): string {
  return s.replace(/'/g, '’').replace(/\(07\)/g, '(06)');
}
