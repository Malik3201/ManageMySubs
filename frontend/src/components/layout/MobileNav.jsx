import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CreditCard, Bell, BarChart3, Layers } from 'lucide-react';
import { clsx } from 'clsx';

const items = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/categories', icon: Layers, label: 'Categories' },
  { to: '/subscriptions', icon: CreditCard, label: 'Subs' },
  { to: '/reminders', icon: Bell, label: 'Reminders' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
];

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white md:hidden">
      <div className="flex items-center justify-around py-1.5">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium transition-colors rounded-lg',
                isActive ? 'text-primary-600' : 'text-slate-400'
              )
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
