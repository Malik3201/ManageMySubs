import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';
import ToastContainer from '../ui/ToastContainer';
import ChatWidget from '../ai/ChatWidget';

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-transparent">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />
        <main className="app-main flex-1 overflow-y-auto px-4 py-5 pb-24 md:px-8 md:pb-8">
          <div className="mx-auto w-full max-w-[1400px]">
            <Outlet />
          </div>
        </main>
      </div>
      <MobileNav />
      <ToastContainer />
      <ChatWidget />
    </div>
  );
}
