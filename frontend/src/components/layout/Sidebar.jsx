import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  TrendingUp,
  RefreshCw,
  HandCoins,
  Layers,
  Bell,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { cn } from '../../utils/cn';

const mainNav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/subscriptions', icon: CreditCard, label: 'Subscriptions' },
  { to: '/sales', icon: TrendingUp, label: 'Sales' },
  { to: '/renewals', icon: RefreshCw, label: 'Renewals' },
  { to: '/vendors', icon: HandCoins, label: 'Vendors' },
];

const workspaceNav = [
  { to: '/categories', icon: Layers, label: 'Categories' },
  { to: '/reminders', icon: Bell, label: 'Reminders' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

function NavSection({ title, items, onNavigate }) {
  return (
    <div className="px-3">
      {title && (
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{title}</p>
      )}
      <div className="space-y-0.5">
        {items.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-600/25'
                  : 'text-slate-600 hover:bg-secondary-50 hover:text-slate-900'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                    isActive ? 'bg-white/15 text-white' : 'bg-secondary-100/80 text-slate-500 group-hover:bg-white group-hover:text-primary-600'
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                </span>
                <span className="truncate">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default function Sidebar() {
  const logout = useAuthStore((s) => s.logout);
  const { sidebarOpen, closeSidebar } = useUIStore();

  const renderNav = (isMobile = false) => (
    <>
      <div className="flex h-[72px] shrink-0 items-center gap-3 border-b border-white/60 bg-white/40 px-5 backdrop-blur-md">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 shadow-lg shadow-primary-600/30">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <span className="block truncate text-base font-bold tracking-tight text-slate-900">ManageMySubs</span>
          <span className="text-[11px] font-medium text-slate-500">Seller workspace</span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto py-5">
        <NavSection title="Menu" items={mainNav} onNavigate={isMobile ? closeSidebar : undefined} />
        <NavSection title="Workspace" items={workspaceNav} onNavigate={isMobile ? closeSidebar : undefined} />
      </div>

      <div className="shrink-0 border-t border-white/60 bg-white/30 p-3 backdrop-blur-md">
        <button
          type="button"
          onClick={() => {
            closeSidebar();
            logout();
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-rose-50 hover:text-rose-700"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary-100 text-slate-500">
            <LogOut className="h-[18px] w-[18px]" />
          </span>
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="relative hidden w-64 shrink-0 flex-col overflow-hidden border-r border-white/70 bg-gradient-to-b from-white via-secondary-50/40 to-white shadow-[8px_0_40px_-20px_rgba(15,23,42,0.12)] md:flex lg:w-72">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary-100/30 to-transparent" />
        <div className="relative flex min-h-0 flex-1 flex-col">{renderNav()}</div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={closeSidebar}
            aria-label="Close sidebar"
          />
          <aside className="relative flex h-full w-[min(88vw,320px)] flex-col overflow-hidden border-r border-white/80 bg-gradient-to-b from-white to-secondary-50/90 shadow-2xl">
            {renderNav(true)}
          </aside>
        </div>
      )}
    </>
  );
}
