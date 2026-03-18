import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  CreditCard,
  Bell,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { clsx } from 'clsx';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/categories', icon: Layers, label: 'Categories' },
  { to: '/subscriptions', icon: CreditCard, label: 'Subscriptions' },
  { to: '/reminders', icon: Bell, label: 'Reminders' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const logout = useAuthStore((s) => s.logout);
  const { sidebarOpen, closeSidebar } = useUIStore();

  const linkClasses = ({ isActive }) =>
    clsx(
      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
      isActive
        ? 'bg-primary-50 text-primary-700'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    );

  const renderNav = (isMobile = false) => (
    <>
      <div className="flex h-16 items-center gap-2 px-5 border-b border-slate-100">
        <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
          <CreditCard className="h-4 w-4 text-white" />
        </div>
        <div>
          <span className="block text-lg font-bold text-slate-900">SubsManager</span>
          {isMobile && <span className="text-xs text-slate-400">Seller workspace</span>}
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={linkClasses}
            onClick={isMobile ? closeSidebar : undefined}
          >
            <Icon className="h-4.5 w-4.5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <button
          onClick={() => {
            closeSidebar();
            logout();
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-danger-600 transition-colors"
        >
          <LogOut className="h-4.5 w-4.5" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden md:flex md:w-56 lg:w-64 flex-col border-r border-slate-200 bg-white">
        {renderNav()}
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm"
            onClick={closeSidebar}
            aria-label="Close sidebar"
          />
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col bg-white shadow-2xl">
            {renderNav(true)}
          </aside>
        </div>
      )}
    </>
  );
}
