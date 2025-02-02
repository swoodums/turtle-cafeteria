/* frontend/src/app/page.tsx */

'use client';

import { useEffect } from 'react';
import { useRouter, redirect } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/recipes');
  }, [router]);

  return null;
}

// export default function Home() {
//   redirect('/recipes');
// }