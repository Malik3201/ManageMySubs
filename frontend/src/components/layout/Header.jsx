import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, ChevronDown, Layers, Bell, BarChart3, Settings, Sparkles } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/cn';

const moreLinks = [
  { to: '/categories', label: 'Categories', icon: Layers },
  { to: '/reminders', label: 'Reminders', icon: Bell },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Header() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  return (
    <header className="shrink-0 border-b border-white/70 bg-white/80 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex h-14 items-center justify-between gap-3 sm:h-16">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={toggleSidebar}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-secondary-100 md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex min-w-0 items-center gap-2 md:hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 shadow-md shadow-primary-600/25">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <span className="block truncate text-sm font-bold text-slate-900">ManageMySubs</span>
              <span className="block truncate text-[11px] text-slate-500">Seller workspace</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative" ref={ref}>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-primary-200 hover:bg-primary-50/50 md:hidden'
              )}
            >
              More
              <ChevronDown className={cn('h-4 w-4 transition', open && 'rotate-180')} />
            </button>
            {open && (
              <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200/90 bg-white py-1 shadow-xl shadow-slate-900/10">
                {moreLinks.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-secondary-50"
                  >
                    <Icon className="h-4 w-4 text-slate-400" />
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="hidden text-right sm:block">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Signed in</p>
            <p className="truncate text-sm font-semibold text-slate-800">{user?.name || 'User'}</p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-accent-50 text-sm font-bold text-primary-800 ring-2 ring-white shadow-sm">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
