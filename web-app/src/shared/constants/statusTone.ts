// ============================================
// FILE: web-app/src/shared/constants/statusTone.ts
// Maps common status strings → UI tone.
// Extracted so StatusBadge.tsx can be Fast-Refresh compliant.
// ============================================
export type Tone =
  | 'gray'
  | 'green'
  | 'red'
  | 'amber'
  | 'blue'
  | 'brand';

/** Map common transaction/stock statuses to a tone. */
export function statusTone(status: string): Tone {
  const s = status?.toLowerCase();
  switch (s) {
    case 'approved':
    case 'active':
    case 'received':
    case 'completed':
      return 'green';
    case 'rejected':
    case 'cancelled':
    case 'inactive':
      return 'red';
    case 'pending':
    case 'draft':
      return 'amber';
    case 'in_progress':
    case 'in-progress':
      return 'blue';
    default:
      return 'gray';
  }
}