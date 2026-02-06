'use client';

import { usePathname } from 'next/navigation';
import Navigation from '@/components/Navigation';

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Guirilandia
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          Domina el vocabulario con repetición espaciada
        </p>
      </header>
      <Navigation />
      <main>{children}</main>
      <Navigation />
    </div>
  );
}
