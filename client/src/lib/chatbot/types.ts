export type OverlayId =
  'about' | 'experience' | 'skills' | 'projects' | 'credentials' | 'status' | 'contact';

export interface Answer {
  /** Short lead sentence. */
  summary: string;
  /** Supporting points, each a plain sentence or list line. */
  points: string[];
  /** Where the facts came from, shown as source chips. */
  sources: string[];
  /** A section the visitor can open for more. */
  action?: { label: string; overlay: OverlayId };
  followUps: string[];
}
