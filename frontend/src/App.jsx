import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import ProtectedRoute from './router/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Subscriptions from './pages/Subscriptions';
import SubscriptionDetail from './pages/SubscriptionDetail';
import CreateSubscription from './pages/CreateSubscription';
import EditSubscription from './pages/EditSubscription';
import RenewSubscription from './pages/RenewSubscription';
import Reminders from './pages/Reminders';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Customers from './pages/Customers';
import Sales from './pages/Sales';
import Renewals from './pages/Renewals';

export default function App() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="customers" element={<Customers />} />
        <Route path="sales" element={<Sales />} />
        <Route path="renewals" element={<Renewals />} />
        <Route path="categories" element={<Categories />} />
        <Route path="subscriptions" element={<Subscriptions />} />
        <Route path="subscriptions/new" element={<CreateSubscription />} />
        <Route path="subscriptions/:id" element={<SubscriptionDetail />} />
        <Route path="subscriptions/:id/edit" element={<EditSubscription />} />
        <Route path="subscriptions/:id/renew" element={<RenewSubscription />} />
        <Route path="reminders" element={<Reminders />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
