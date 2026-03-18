import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit, RefreshCw, ArrowRightLeft, Archive, RotateCcw,
  CreditCard, Calendar, Clock, User, Phone, Mail, Tag, FileText, DollarSign, CheckCircle,
} from 'lucide-react';
import { useSubscription, useToggleArchiveSubscription } from '../hooks/useSubscriptions';
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
  const paymentMut = useUpdatePayment();
  const replacementMut = useCreateReplacement();

  const [replaceOpen, setReplaceOpen] = useState(false);
  const [replaceForm, setReplaceForm] = useState({
    reason: '', usedDaysBeforeDeactivation: 0, replacementType: 'partial_paid', paidExtraDays: 0, notes: '',
  });

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

  const handleReplacement = () => {
    replacementMut.mutate(
      { subscriptionId: id, data: { ...replaceForm, usedDaysBeforeDeactivation: Number(replaceForm.usedDaysBeforeDeactivation), paidExtraDays: Number(replaceForm.paidExtraDays) } },
      { onSuccess: () => setReplaceOpen(false) }
    );
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

  const info = [
    { label: 'Category', value: catName, icon: Tag },
    { label: 'Duration', value: `${capitalize(sub.durationType)} (${sub.totalDays} days)`, icon: Calendar },
    { label: 'Start Date', value: formatDate(sub.startDate), icon: Calendar },
    { label: 'End Date', value: formatDate(sub.currentEndDate), icon: Calendar },
    { label: 'Elapsed', value: `${sub.elapsedDays ?? 0} days`, icon: Clock },
    { label: 'Remaining', value: `${sub.remainingDays ?? 0} days`, icon: Clock },
    { label: 'Selling Price', value: currency(sub.sellingPrice), icon: DollarSign },
    { label: 'Purchase Price', value: currency(sub.purchasePrice), icon: DollarSign },
    { label: 'Profit', value: currency(sub.profit), icon: DollarSign },
    { label: 'Amount Received', value: currency(sub.amountReceived), icon: CreditCard },
    { label: 'Amount Remaining', value: currency(sub.amountRemaining), icon: CreditCard },
    { label: 'Payment Method', value: sub.paymentMethod || '—', icon: CreditCard },
  ];
  const replacementDaysGranted = Math.max(0, (sub.totalDays || 0) - Number(replaceForm.usedDaysBeforeDeactivation || 0));
  const replacementCoverage = replacementDaysGranted + (replaceForm.replacementType === 'partial_paid' ? Number(replaceForm.paidExtraDays || 0) : 0);
  const canReplace = ['active', 'expiring_soon'].includes(sub.computedStatus || sub.status);

  return (
    <div className="mx-auto max-w-2xl">
      <button onClick={() => navigate('/subscriptions')} className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Subscriptions
      </button>

      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{sub.clientName || 'Unnamed Client'}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <StatusBadge status={sub.computedStatus || sub.status} />
            <PaymentBadge status={sub.paymentStatus} />
            {sub.renewalCount > 0 && (
              <span className="text-xs text-primary-600 font-medium">Renewal #{sub.renewalCount}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        <Button size="sm" variant="secondary" onClick={() => navigate(`/subscriptions/${id}/edit`)}>
          <Edit className="h-3.5 w-3.5" /> Edit
        </Button>
        <Button size="sm" variant="secondary" onClick={() => navigate(`/subscriptions/${id}/renew`)}>
          <RefreshCw className="h-3.5 w-3.5" /> Renew
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setReplaceOpen(true)} disabled={!canReplace}>
          <ArrowRightLeft className="h-3.5 w-3.5" /> Replace
        </Button>
        {sub.paymentStatus !== 'paid' && (
          <Button size="sm" variant="success" onClick={handleMarkPaid} loading={paymentMut.isPending}>
            <CheckCircle className="h-3.5 w-3.5" /> Mark Paid
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => archiveMut.mutate(id)}>
          {sub.isArchived ? <RotateCcw className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
          {sub.isArchived ? 'Restore' : 'Archive'}
        </Button>
      </div>

      {sub.clientPhone || sub.clientEmail ? (
        <Card className="mb-4">
          <CardBody className="flex flex-wrap gap-4 text-sm">
            {sub.clientPhone && (
              <span className="flex items-center gap-1.5 text-slate-600"><Phone className="h-4 w-4 text-slate-400" />{sub.clientPhone}</span>
            )}
            {sub.clientEmail && (
              <span className="flex items-center gap-1.5 text-slate-600"><Mail className="h-4 w-4 text-slate-400" />{sub.clientEmail}</span>
            )}
          </CardBody>
        </Card>
      ) : null}

      <Card className="mb-4">
        <CardHeader><h2 className="text-sm font-semibold text-slate-700">Subscription Details</h2></CardHeader>
        <CardBody>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
            {info.map(({ label, value, icon: Icon }) => (
              <div key={label}>
                <dt className="flex items-center gap-1 text-xs text-slate-400 mb-0.5">
                  <Icon className="h-3 w-3" /> {label}
                </dt>
                <dd className="text-sm font-medium text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>
        </CardBody>
      </Card>

      {sub.tags?.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {sub.tags.map((t) => (
            <span key={t} className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">{t}</span>
          ))}
        </div>
      )}

      {sub.notes && (
        <Card className="mb-4">
          <CardBody>
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-slate-400 mt-0.5" />
              <p className="text-sm text-slate-600">{sub.notes}</p>
            </div>
          </CardBody>
        </Card>
      )}

      {replacementsError ? (
        <Card className="mb-4">
          <CardBody>
            <p className="text-sm text-danger-600">Replacement history could not be loaded right now.</p>
          </CardBody>
        </Card>
      ) : replacements?.length > 0 && (
        <Card className="mb-4">
          <CardHeader><h2 className="text-sm font-semibold text-slate-700">Replacements</h2></CardHeader>
          <CardBody className="space-y-3">
            {replacements.map((r) => (
              <div key={r._id} className="rounded-lg bg-slate-50 p-3 text-sm">
                <div className="flex items-center justify-between mb-1">
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
                {r.reason && <p className="text-xs text-slate-400 mt-1">{r.reason}</p>}
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      <Card className="mb-4">
        <CardHeader><h2 className="text-sm font-semibold text-slate-700">Activity Timeline</h2></CardHeader>
        <CardBody>
          <Timeline subscriptionId={id} />
        </CardBody>
      </Card>

      <Card className="mb-4">
        <CardBody>
          <MessageTemplates data={templateData} />
        </CardBody>
      </Card>

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
