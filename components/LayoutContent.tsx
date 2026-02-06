'use client';

import { usePathname } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Logo from '@/components/Logo';

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <header className="mb-8">
        <Logo />
      </header>
      <Navigation />
      <main className="mt-6">{children}</main>
      <Navigation />
    </div>
  );
}
