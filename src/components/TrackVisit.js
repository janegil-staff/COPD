'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function TrackVisit() {
  const pathname = usePathname();

  useEffect(() => {
    console.log('[TrackVisit] firing for', pathname); // check this appears in browser console
    fetch('/api/track-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: pathname }),
    })
      .then((res) => res.json())
      .then((data) => console.log('[TrackVisit] response:', data))
      .catch(console.error);
  }, [pathname]);

  return null;
}