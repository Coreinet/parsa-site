'use client';

import { usePathname } from 'next/navigation';
import { pageForPath, type PageId } from '@/content/nav';

/** Which nav item is current: the page for the path (case studies under Work, articles under Blog). */
export function useActivePage(): PageId | null {
  return pageForPath(usePathname());
}
