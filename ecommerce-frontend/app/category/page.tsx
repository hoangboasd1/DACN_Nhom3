'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CategoriesPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page since we don't need a separate categories page
    router.replace('/');
  }, [router]);

  return null; // No need to render anything as we're redirecting
} 