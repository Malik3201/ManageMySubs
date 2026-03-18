import { useAuthStore } from '../store/authStore';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { LogOut, User, Mail, Shield } from 'lucide-react';

export default function Settings() {
  const { user, logout } = useAuthStore();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-bold text-slate-900 mb-6 sm:text-2xl">Settings</h1>

      <Card className="mb-4">
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <User className="h-4 w-4" /> Profile
          </h2>
        </CardHeader>
        <CardBody className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-xl font-bold text-primary-700">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <p className="font-semibold text-slate-900">{user?.name}</p>
              <p className="text-sm text-slate-500 flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" /> {user?.email}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Shield className="h-4 w-4" /> Security
          </h2>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-slate-500 mb-3">
            Your session is secured with JWT authentication. Token is stored locally and sent with each request.
          </p>
          <Button variant="danger" onClick={logout}>
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <p className="text-xs text-slate-400 text-center">
            ManageMySubs v1.0.0 — Subscription Seller Management
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
