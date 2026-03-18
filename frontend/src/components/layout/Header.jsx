import { Menu, CreditCard } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';

export default function Header() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const user = useAuthStore((s) => s.user);

  return (
    <header className="border-b border-white/60 bg-white/75 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex h-16 items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 md:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-[0_8px_20px_-10px_rgba(79,70,229,0.85)]">
            <CreditCard className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <span className="block text-sm font-semibold text-slate-900">SubsManager</span>
            <span className="block text-[11px] text-slate-400">Seller workspace</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Signed in</p>
          <p className="text-sm font-semibold text-slate-800">{user?.name || 'User'}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 ring-1 ring-primary-100">
          <span className="text-sm font-semibold text-primary-700">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
      </div>
      </div>
    </header>
  );
}
