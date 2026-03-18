import { Menu, CreditCard } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';

export default function Header() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const user = useAuthStore((s) => s.user);

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 md:h-16">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 md:hidden">
          <div className="h-7 w-7 rounded-lg bg-primary-600 flex items-center justify-center">
            <CreditCard className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-bold text-slate-900">SubsManager</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
          <span className="text-sm font-semibold text-primary-700">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
      </div>
    </header>
  );
}
