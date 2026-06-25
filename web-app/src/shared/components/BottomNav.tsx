// ============================================
// FILE: web-app/src/shared/components/BottomNav.tsx
// Fixed bottom navigation (safe-area aware).
// ============================================
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { BoxIcon, FileTextIcon, HomeIcon, UserIcon } from './Icons';

const items = [
  { to: '/dashboard', label: 'Dashboard', Icon: HomeIcon },
  { to: '/transactions', label: 'Transaksi', Icon: FileTextIcon },
  { to: '/stock', label: 'Stok', Icon: BoxIcon },
  { to: '/profile', label: 'Profil', Icon: UserIcon },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white pb-safe">
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {items.map(({ to, label, Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                clsx(
                  'flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[11px] transition-colors',
                  isActive
                    ? 'text-brand-600'
                    : 'text-gray-500 active:text-gray-700'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={22} className={clsx(isActive && 'font-bold')} />
                  <span className={clsx(isActive && 'font-semibold')}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}