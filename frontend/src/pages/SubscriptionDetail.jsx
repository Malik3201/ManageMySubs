import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit, RefreshCw, ArrowRightLeft, Archive, RotateCcw,
  CreditCard, Calendar, Clock, User, Phone, Mail, Tag, FileText, DollarSign, CheckCircle,
  Download, MessageCircle,
} from 'lucide-react';
import {
  useSubscription,
  useToggleArchiveSubscription,
  useGenerateSubscriptionReceipt,
} from '../hooks/useSubscriptions';
import { useReplacements, useCreateReplacement } from '../hooks/useReplacements';
import { useUpdatePayment } from '../hooks/usePayments';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import StatusBadge from '../components/subscription/StatusBadge';
import PaymentBadge from '../components/subscription/PaymentBadge';
import Timeline from '../components/subscription/Timeline';
import MessageTemplates from '../components/templates/MessageTemplates';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import { formatDate } from '../utils/dateHelpers';
import { currency, capitalize } from '../utils/formatters';
import { REPLACEMENT_TYPES } from '../utils/constants';

export default function SubscriptionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: sub, isLoading, isError, refetch } = useSubscription(id);
  const { data: replacements, isError: replacementsError } = useReplacements(id);
  const archiveMut = useToggleArchiveSubscription();
  const receiptMut = useGenerateSubscriptionReceipt();
  const paymentMut = useUpdatePayment();
  const replacementMut = useCreateReplacement();

  const [replaceOpen, setReplaceOpen] = useState(false);
  const [replaceForm, setReplaceForm] = useState({
    reason: '', usedDaysBeforeDeactivation: 0, replacementType: 'partial_paid', paidExtraDays: 0, notes: '',
  });
  const [animatedRemaining, setAnimatedRemaining] = useState(0);

  useEffect(() => {
    const target = Math.max(0, Number(sub?.remainingDays || 0));
    setAnimatedRemaining((current) => {
      if (current === target) return current;
      return current;
    });
    const interval = setInterval(() => {
      setAnimatedRemaining((current) => {
        if (current === target) {
          clearInterval(interval);
          return current;
        }
        const diff = target - current;
        const step = Math.max(1, Math.floor(Math.abs(diff) / 4));
        return current + Math.sign(diff) * step;
      });
    }, 90);
    return () => clearInterval(interval);
  }, [sub?.remainingDays]);

  // If receipt is being generated in background, poll for a short time.
  useEffect(() => {
    if (!sub || sub.receiptUrl) return;
    const timer = setInterval(() => refetch(), 5000);
    const stop = setTimeout(() => clearInterval(timer), 30000);
    return () => {
      clearInterval(timer);
      clearTimeout(stop);
    };
  }, [sub?.receiptUrl, refetch]);

  if (isLoading) return <LoadingSpinner size="lg" className="py-20" />;
  if (isError || !sub) {
    return (
      <ErrorState
        title="Subscription unavailable"
        description="We couldn't load this subscription."
        onRetry={refetch}
      />
    );
  }

  const catName = sub.categoryId?.name || 'Unknown';

  const handleMarkPaid = () => {
    paymentMut.mutate({ subscriptionId: id, data: { paymentStatus: 'paid' } });
  };

  const handleArchiveToggle = () => {
    const isRestore = sub.isArchived;
    const confirmed = window.confirm(
      isRestore
        ? 'Restore this subscription to active list?'
        : 'Archive this subscription? You can restore it later from archived filters.'
    );
    if (!confirmed) return;
    archiveMut.mutate(id);
  };

  const handleReplacement = () => {
    replacementMut.mutate(
      { subscriptionId: id, data: { ...replaceForm, usedDaysBeforeDeactivation: Number(replaceForm.usedDaysBeforeDeactivation), paidExtraDays: Number(replaceForm.paidExtraDays) } },
      { onSuccess: () => setReplaceOpen(false) }
    );
  };

  const openReceipt = () => {
    if (!sub.receiptUrl) return;
    window.open(sub.receiptUrl, '_blank', 'noopener,noreferrer');
  };

  const downloadReceipt = () => {
    if (!sub.receiptUrl) return;
    // We store a public Drive web link, so we open it in a new tab.
    window.open(sub.receiptUrl, '_blank', 'noopener,noreferrer');
  };

  const shareWhatsApp = () => {
    if (!sub.receiptUrl || !sub.clientPhone) return;
    const phone = String(sub.clientPhone).replace(/\D/g, '');
    if (!phone) return;

    const message = `Salam 👋\nApki subscription receipt yahan dekhein:\n${sub.receiptUrl}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleGenerateReceipt = () => {
    receiptMut.mutate(id);
  };

  const templateData = {
    clientName: sub.clientName,
    categoryName: catName,
    endDate: formatDate(sub.currentEndDate),
    amount: currency(sub.amountRemaining || sub.sellingPrice),
    sellingPrice: currency(sub.sellingPrice),
    newEndDate: formatDate(sub.currentEndDate),
    replacementEndDate: formatDate(sub.currentEndDate),
  };

  const replacementDaysGranted = Math.max(0, (sub.totalDays || 0) - Number(replaceForm.usedDaysBeforeDeactivation || 0));
  const replacementCoverage = replacementDaysGranted + (replaceForm.replacementType === 'partial_paid' ? Number(replaceForm.paidExtraDays || 0) : 0);
  const canReplace = ['active', 'expiring_soon'].includes(sub.computedStatus || sub.status);
  const remainingDays = Math.max(0, Number(sub.remainingDays || 0));
  const elapsedDays = Math.max(0, Number(sub.elapsedDays || 0));
  const totalDays = Math.max(1, Number(sub.totalDays || 1));
  const timelineProgress = Math.min(100, Math.round((elapsedDays / totalDays) * 100));
  const countdownTone =
    remainingDays < 3
      ? 'from-rose-500 to-danger-600 text-white shadow-[0_10px_28px_-12px_rgba(244,63,94,0.55)]'
      : remainingDays < 10
        ? 'from-amber-400 to-warning-600 text-white shadow-[0_10px_28px_-12px_rgba(245,158,11,0.5)]'
        : 'from-emerald-500 to-success-600 text-white shadow-[0_10px_28px_-12px_rgba(16,185,129,0.55)]';
  const detailMetrics = [
    {
      label: 'Selling Price',
      value: currency(sub.sellingPrice),
      icon: DollarSign,
      surface: 'from-emerald-50 to-white border-emerald-100',
      accent: 'text-emerald-700',
    },
    {
      label: 'Cost Price',
      value: currency(sub.purchasePrice),
      icon: CreditCard,
      surface: 'from-blue-50 to-white border-blue-100',
      accent: 'text-blue-700',
    },
    {
      label: 'Profit',
      value: currency(sub.profit),
      icon: DollarSign,
      surface: 'from-violet-50 to-white border-violet-100',
      accent: 'text-violet-700',
    },
    {
      label: 'Payment Status',
      value: capitalize(sub.paymentStatus),
      icon: CheckCircle,
      surface: sub.paymentStatus === 'paid' ? 'from-emerald-50 to-white border-emerald-100' : 'from-rose-50 to-white border-rose-100',
      accent: sub.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-rose-700',
      badge: true,
    },
  ];
  const detailInfo = [
    { label: 'Category', value: catName, icon: Tag },
    { label: 'Vendor', value: sub.vendorId?.name || '—', icon: User },
    { label: 'Duration', value: `${capitalize(sub.durationType)} (${sub.totalDays} days)`, icon: Calendar },
    { label: 'Payment Method', value: sub.paymentMethod || '—', icon: CreditCard },
    { label: 'Amount Received', value: currency(sub.amountReceived), icon: DollarSign },
    { label: 'Amount Remaining', value: currency(sub.amountRemaining), icon: Clock },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <button onClick={() => navigate('/subscriptions')} className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Subscriptions
      </button>

      <div className="mb-5 overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-950 via-primary-900 to-primary-700 p-5 text-white shadow-[0_30px_80px_-35px_rgba(67,56,202,0.7)]">
        <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-200">{catName}</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">{sub.clientName || 'Unnamed Client'}</h1>
          <p className="mt-2 max-w-xl text-sm text-primary-100/85">
            Track lifecycle, payments, renewal continuity, replacement coverage, and client communication from one place.
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <StatusBadge status={sub.computedStatus || sub.status} />
            <PaymentBadge status={sub.paymentStatus} />
            {sub.renewalCount > 0 && (
              <span className="text-xs text-primary-600 font-medium">Renewal #{sub.renewalCount}</span>
            )}
          </div>
        </div>
        <div className="rounded-2xl bg-white/10 px-4 py-3 text-right backdrop-blur">
          <p className="text-xs uppercase tracking-[0.2em] text-primary-100/70">Current Profit</p>
          <p className="mt-2 text-2xl font-bold">{currency(sub.profit)}</p>
        </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          <Card>
            <CardHeader className="rounded-t-2xl border-b border-white/60 bg-gradient-to-br from-white via-white to-primary-50/70">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">Subscription Details</h2>
                  <p className="text-xs text-slate-500">Visual lifecycle, key finance metrics, and quick management actions.</p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  <Button size="sm" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:-translate-y-0.5 hover:from-blue-600 hover:to-blue-700" onClick={() => navigate(`/subscriptions/${id}/edit`)}>
                    <Edit className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:-translate-y-0.5 hover:from-emerald-600 hover:to-emerald-700" onClick={() => navigate(`/subscriptions/${id}/renew`)}>
                    <RefreshCw className="h-3.5 w-3.5" />
                    Renew
                  </Button>
                  <Button size="sm" className="col-span-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:-translate-y-0.5 hover:from-amber-600 hover:to-orange-600 sm:col-span-1" onClick={() => setReplaceOpen(true)} disabled={!canReplace}>
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                    Replace
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:-translate-y-0.5 sm:flex-1"
                    onClick={openReceipt}
                    disabled={!sub.receiptUrl}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    View Receipt
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:-translate-y-0.5 sm:flex-1"
                    onClick={downloadReceipt}
                    disabled={!sub.receiptUrl}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    className="col-span-2 bg-gradient-to-r from-emerald-500 to-success-600 text-white hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:-translate-y-0.5"
                    onClick={shareWhatsApp}
                    disabled={!sub.receiptUrl || !sub.clientPhone}
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    WhatsApp Share
                  </Button>
                  <Button
                    size="sm"
                    className="col-span-2 bg-gradient-to-r from-violet-500 to-violet-600 text-white hover:-translate-y-0.5"
                    onClick={handleGenerateReceipt}
                    loading={receiptMut.isPending}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Generate Receipt
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="rounded-2xl border border-white/70 bg-gradient-to-br from-white to-secondary-50/70 p-4 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Remaining Time</p>
                    <div className="flex items-center gap-2">
                      <div className={`min-w-[88px] rounded-2xl bg-gradient-to-br px-4 py-3 text-center transition-all duration-300 ${countdownTone}`}>
                        <p className="text-3xl font-black leading-none">{animatedRemaining}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-center">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Days</p>
                      </div>
                    </div>
                  </div>
                  <div className="w-full sm:max-w-[340px]">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Start → End</p>
                    <p className="text-sm font-semibold text-slate-700">{formatDate(sub.startDate)} → {formatDate(sub.currentEndDate)}</p>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-700"
                        style={{ width: `${timelineProgress}%` }}
                      />
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                      <span>Elapsed: {elapsedDays}d</span>
                      <span>Remaining: {remainingDays}d</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {detailMetrics.map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <div key={metric.label} className={`rounded-2xl border bg-gradient-to-br p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 ${metric.surface}`}>
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{metric.label}</p>
                        <Icon className={`h-4 w-4 ${metric.accent}`} />
                      </div>
                      {metric.badge ? (
                        <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${metric.accent} bg-white ring-1 ring-current/10`}>
                          {metric.value}
                        </span>
                      ) : (
                        <p className={`mt-2 text-xl font-bold tracking-tight ${metric.accent}`}>{metric.value}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {detailInfo.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5 transition-colors hover:bg-slate-50">
                      <dt className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        <Icon className="h-3.5 w-3.5" /> {label}
                      </dt>
                      <dd className="text-sm font-semibold text-slate-800">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </CardBody>
          </Card>

          {replacementsError ? (
            <Card>
              <CardBody>
                <p className="text-sm text-danger-600">Replacement history could not be loaded right now.</p>
              </CardBody>
            </Card>
          ) : replacements?.length > 0 && (
            <Card>
              <CardHeader><h2 className="text-sm font-semibold text-slate-700">Replacements</h2></CardHeader>
              <CardBody className="grid gap-3 sm:grid-cols-2">
                {replacements.map((r) => (
                  <div key={r._id} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-medium text-slate-800">{capitalize(r.replacementType)}</span>
                      <span className="text-xs text-slate-400">{formatDate(r.issueDate)}</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Used: {r.usedDaysBeforeDeactivation}d | Granted: {r.replacementDaysGranted}d
                      {r.paidExtraDays > 0 && ` | Extra paid: ${r.paidExtraDays}d`}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(r.replacementStartDate)} → {formatDate(r.replacementEndDate)}
                    </p>
                    {r.reason && <p className="mt-1 text-xs text-slate-400">{r.reason}</p>}
                  </div>
                ))}
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader><h2 className="text-sm font-semibold text-slate-700">Activity Timeline</h2></CardHeader>
            <CardBody>
              <Timeline subscriptionId={id} />
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4 xl:col-span-4">
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-slate-700">Receipt</h2>
            </CardHeader>
            <CardBody className="space-y-2">
              {sub.receiptUrl ? (
                <>
                  <p className="text-sm text-emerald-700 font-semibold">Receipt is ready</p>
                  <button
                    type="button"
                    onClick={openReceipt}
                    className="w-full rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 transition"
                  >
                    View in browser
                  </button>
                </>
              ) : (
                <p className="text-sm text-slate-500">
                  Receipt is generating. Please wait a few seconds and refresh if it doesn't appear.
                </p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader><h2 className="text-sm font-semibold text-slate-700">Quick Actions</h2></CardHeader>
            <CardBody className="space-y-2">
              {sub.paymentStatus !== 'paid' && (
                <Button size="sm" variant="success" className="w-full justify-center" onClick={handleMarkPaid} loading={paymentMut.isPending}>
                  <CheckCircle className="h-3.5 w-3.5" /> Mark Paid
                </Button>
              )}
              <Button size="sm" variant="ghost" className="w-full justify-center" onClick={handleArchiveToggle}>
                {sub.isArchived ? <RotateCcw className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
                {sub.isArchived ? 'Restore Subscription' : 'Archive Subscription'}
              </Button>
            </CardBody>
          </Card>

          {(sub.clientName || sub.clientPhone || sub.clientEmail) && (
            <Card>
              <CardHeader><h2 className="text-sm font-semibold text-slate-700">Client Contact</h2></CardHeader>
              <CardBody className="space-y-2 text-sm">
                {sub.clientName && (
                  <span className="flex items-center gap-1.5 text-slate-700"><User className="h-4 w-4 text-slate-400" />{sub.clientName}</span>
                )}
                {sub.clientPhone && (
                  <span className="flex items-center gap-1.5 text-slate-600"><Phone className="h-4 w-4 text-slate-400" />{sub.clientPhone}</span>
                )}
                {sub.clientEmail && (
                  <span className="flex items-center gap-1.5 text-slate-600"><Mail className="h-4 w-4 text-slate-400" />{sub.clientEmail}</span>
                )}
              </CardBody>
            </Card>
          )}

          {sub.tags?.length > 0 && (
            <Card>
              <CardHeader><h2 className="text-sm font-semibold text-slate-700">Tags</h2></CardHeader>
              <CardBody className="flex flex-wrap gap-2">
                {sub.tags.map((t) => (
                  <span key={t} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary-700 ring-1 ring-primary-100">{t}</span>
                ))}
              </CardBody>
            </Card>
          )}

          {sub.notes && (
            <Card>
              <CardHeader><h2 className="text-sm font-semibold text-slate-700">Notes</h2></CardHeader>
              <CardBody>
                <div className="flex items-start gap-2">
                  <FileText className="mt-0.5 h-4 w-4 text-slate-400" />
                  <p className="text-sm text-slate-600">{sub.notes}</p>
                </div>
              </CardBody>
            </Card>
          )}

          <Card>
            <CardBody>
              <MessageTemplates data={templateData} />
            </CardBody>
          </Card>
        </div>
      </div>

      <Modal open={replaceOpen} onClose={() => setReplaceOpen(false)} title="Issue Replacement" size="lg">
        <div className="space-y-4">
          {!canReplace && (
            <div className="rounded-lg border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-600">
              Replacement is only available for active or expiring-soon subscriptions.
            </div>
          )}
          <Select
            label="Replacement Type"
            options={REPLACEMENT_TYPES}
            value={replaceForm.replacementType}
            onChange={(e) => setReplaceForm({ ...replaceForm, replacementType: e.target.value })}
          />
          <Input
            label="Days Used Before Deactivation"
            type="number"
            value={replaceForm.usedDaysBeforeDeactivation}
            onChange={(e) => setReplaceForm({ ...replaceForm, usedDaysBeforeDeactivation: e.target.value })}
          />
          {replaceForm.replacementType === 'partial_paid' && (
            <Input
              label="Paid Extra Days"
              type="number"
              value={replaceForm.paidExtraDays}
              onChange={(e) => setReplaceForm({ ...replaceForm, paidExtraDays: e.target.value })}
            />
          )}
          <Textarea
            label="Reason"
            value={replaceForm.reason}
            onChange={(e) => setReplaceForm({ ...replaceForm, reason: e.target.value })}
          />
          <Textarea
            label="Notes"
            value={replaceForm.notes}
            onChange={(e) => setReplaceForm({ ...replaceForm, notes: e.target.value })}
          />
          <div className="rounded-lg border border-primary-100 bg-primary-50 px-4 py-3 text-sm text-primary-900">
            Granted days: <span className="font-semibold">{replacementDaysGranted}</span>
            {replaceForm.replacementType === 'partial_paid' && (
              <>
                {' '}+ Extra paid days: <span className="font-semibold">{Number(replaceForm.paidExtraDays || 0)}</span>
              </>
            )}
            <div className="mt-1 text-primary-700">Total new coverage: {replacementCoverage} day(s)</div>
          </div>
          {replacementMut.isError && (
            <p className="text-sm text-danger-600">
              {replacementMut.error?.response?.data?.error?.message || 'Failed'}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setReplaceOpen(false)}>Cancel</Button>
            <Button onClick={handleReplacement} loading={replacementMut.isPending} disabled={!canReplace || replacementCoverage <= 0}>Issue Replacement</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
