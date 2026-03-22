import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { cn } from '../../utils/cn';

const items = [
  { to: '/', icon: LayoutDashboard, label: 'Home', end: true },
  { to: '/customers', icon: Users, label: 'People' },
  { to: '/subscriptions', icon: CreditCard, label: 'Subs' },
  { to: '/sales', icon: TrendingUp, label: 'Sales' },
  { to: '/renewals', icon: RefreshCw, label: 'Renew' },
];

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/80 bg-white/90 shadow-[0_-8px_30px_-12px_rgba(15,23,42,0.15)] backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-between gap-0.5 px-1 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {items.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-2xl px-1 py-1.5 text-[10px] font-bold transition-all',
                isActive
                  ? 'bg-gradient-to-b from-primary-50 to-white text-primary-700 shadow-sm ring-1 ring-primary-100'
                  : 'text-slate-400'
              )
            }
          >
            <Icon className="h-5 w-5" strokeWidth={2} />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
