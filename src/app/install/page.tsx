'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InstallPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home - install guide is now shown as a sheet in Settings
    router.replace('/');
  }, [router]);

  return null;
}
