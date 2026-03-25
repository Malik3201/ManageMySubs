import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { LogOut, User, Mail, Shield } from 'lucide-react';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import { useSettings, useUpdateSettings } from '../hooks/useSettings';

export default function Settings() {
  const { user, logout } = useAuthStore();
  const { data: settings, isLoading, isError, refetch } = useSettings();
  const updateMut = useUpdateSettings();
  const [businessName, setBusinessName] = useState('');

  useEffect(() => {
    if (settings?.businessName) setBusinessName(settings.businessName);
  }, [settings]);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-white via-white to-primary-50 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-600">Workspace</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Account and session settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review your seller profile, current session details, and secure sign-out controls.
        </p>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <User className="h-4 w-4" /> Profile
          </h2>
        </CardHeader>
        <CardBody className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-100 to-primary-50 ring-1 ring-primary-100">
              <span className="text-xl font-bold text-primary-700">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">{user?.name}</p>
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

      <Card className="mb-4">
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Mail className="h-4 w-4" /> Receipt settings
          </h2>
        </CardHeader>
        <CardBody className="space-y-3">
          {isLoading ? (
            <LoadingSpinner />
          ) : isError ? (
            <ErrorState
              title="Settings unavailable"
              description="We couldn't load your receipt settings."
              onRetry={refetch}
            />
          ) : (
            <>
              <Input
                label="Business name (shown on receipt header)"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Prosols Tools"
              />
              {updateMut.isError && (
                <p className="text-sm text-danger-600">
                  {updateMut.error?.response?.data?.error?.message || 'Failed to save settings'}
                </p>
              )}
              <div className="flex justify-end">
                <Button loading={updateMut.isPending} onClick={() => updateMut.mutate({ businessName })}>
                  Save
                </Button>
              </div>
            </>
          )}
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
