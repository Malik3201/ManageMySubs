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
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/70 bg-white/85 backdrop-blur-xl md:hidden">
      <div className="mx-2 flex items-center justify-around py-2">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex min-w-14 flex-col items-center gap-1 rounded-2xl px-2 py-1.5 text-[10px] font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-100'
                  : 'text-slate-400'
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
