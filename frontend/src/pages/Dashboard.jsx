import { useMemo } from 'react';
import { format, subDays } from 'date-fns';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  DollarSign,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import { useSalesReport } from '../hooks/useReports';
import StatCard from '../components/dashboard/StatCard';
import MiniBarChart from '../components/dashboard/MiniBarChart';
import RingProgress from '../components/dashboard/RingProgress';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import { currency } from '../utils/formatters';

export default function Dashboard() {
  const { data, isLoading, isError, refetch } = useDashboard();

  const chartParams = useMemo(() => {
    const end = new Date();
    const start = subDays(end, 13);
    return {
      from: format(start, 'yyyy-MM-dd'),
      to: format(end, 'yyyy-MM-dd'),
      groupBy: 'daily',
    };
  }, []);

  const { data: salesSeries } = useSalesReport(chartParams);

  if (isLoading) return <LoadingSpinner size="lg" className="py-20" />;
  if (isError) {
    return (
      <ErrorState title="Dashboard unavailable" description="We couldn't load your dashboard right now." onRetry={refetch} />
    );
  }

  const totalForShare = Math.max(1, (data?.activeCount ?? 0) + (data?.expiringSoonCount ?? 0) + (data?.expiredCount ?? 0));
  const expiringPct = Math.min(100, Math.round(((data?.expiringSoonCount ?? 0) / totalForShare) * 100));
  const paymentPressure = Math.min(
    100,
    ((data?.paymentPending ?? 0) > 0 ? 35 : 0) + expiringPct * 0.65
  );

  const secondaryStats = [
    {
      label: 'Active',
      value: data?.activeCount ?? 0,
      icon: Activity,
      color: 'text-success-600',
      bgColor: 'bg-success-50',
      surfaceClass: 'from-white to-emerald-50/90 border-emerald-100/80',
    },
    {
      label: 'Reminders due',
      value: data?.remindersDue ?? 0,
      icon: Bell,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      surfaceClass: 'from-white to-blue-50/90 border-blue-100/80',
    },
    {
      label: 'Monthly sales',
      value: currency(data?.monthlySales ?? 0),
      icon: Wallet,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      surfaceClass: 'from-white to-indigo-50/90 border-indigo-100/80',
    },
    {
      label: 'Monthly profit',
      value: currency(data?.monthlyProfit ?? 0),
      icon: TrendingUp,
      color: 'text-success-600',
      bgColor: 'bg-success-50',
      surfaceClass: 'from-white to-teal-50/90 border-teal-100/80',
    },
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-white/20 bg-gradient-to-br from-slate-950 via-primary-900 to-accent-900 p-6 text-white shadow-[0_32px_80px_-36px_rgba(79,70,229,0.75)]">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:justify-between">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary-200/90">Overview</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Your subscription business at a glance</h1>
            <p className="mt-3 text-sm text-primary-100/85">
              Revenue, profit, and renewal pressure — tuned for fast decisions on mobile and desktop.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                to="/sales"
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/15"
              >
                Sales ledger <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/renewals"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/95 hover:bg-white/10"
              >
                Renewal queue
              </Link>
            </div>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3 lg:max-w-3xl">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-100/70">Today sales</p>
              <p className="mt-2 text-3xl font-bold tracking-tight">{currency(data?.todaySales ?? 0)}</p>
              <p className="mt-2 text-xs text-primary-100/75">Booked from new subscription entries today</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-100/70">Today profit</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-200">{currency(data?.todayProfit ?? 0)}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-accent-300"
                  style={{
                    width: `${Math.min(100, (Number(data?.todayProfit) || 0) > 0 ? 72 : 18)}%`,
                  }}
                />
              </div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100/80">Expiring soon</p>
                  <p className="mt-2 text-3xl font-bold">{data?.expiringSoonCount ?? 0}</p>
                  <p className="mt-1 text-xs text-amber-100/80">Next 3 days window</p>
                </div>
                <div className="relative h-[72px] w-[72px]">
                  <RingProgress value={expiringPct} size={72} stroke={7} className="text-slate-800/30" progressClassName="text-amber-400" />
                  <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-white">
                    {expiringPct}%
                  </span>
                </div>
              </div>
              <p className="mt-2 text-xs text-amber-100/70">Share of tracked subscriptions nearing renewal</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[24px] border border-slate-200/80 bg-gradient-to-br from-white via-white to-secondary-50 p-5 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.45)] lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Sales pulse</h2>
              <p className="text-sm text-slate-500">Daily revenue buckets from your sales report (last ~2 weeks).</p>
            </div>
            <span className="rounded-full bg-secondary-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-secondary-700">
              Live
            </span>
          </div>
          <MiniBarChart rows={salesSeries?.rows || []} valueKey="sales" />
        </div>

        <div className="rounded-[24px] border border-slate-200/80 bg-gradient-to-br from-white to-amber-50/80 p-5 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.35)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Attention</h2>
              <p className="text-sm text-slate-500">Payments + renewal focus combined.</p>
            </div>
            <AlertTriangle className="h-6 w-6 text-amber-500" />
          </div>
          <div className="mt-6 flex items-center gap-4">
            <div className="relative h-[96px] w-[96px]">
              <RingProgress value={paymentPressure} size={96} stroke={8} progressClassName="text-primary-500" />
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-800">
                {Math.round(paymentPressure)}%
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <p className="flex justify-between gap-6">
                <span className="text-slate-500">Pending payment</span>
                <span className="font-semibold text-slate-900">{data?.paymentPending ?? 0}</span>
              </p>
              <p className="flex justify-between gap-6">
                <span className="text-slate-500">Reminders</span>
                <span className="font-semibold text-slate-900">{data?.remindersDue ?? 0}</span>
              </p>
              <Link to="/reminders" className="mt-2 inline-flex text-sm font-semibold text-primary-600 hover:underline">
                Open reminders →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-slate-900">Performance grid</h2>
          <p className="text-sm text-slate-500">Key operational metrics across your workspace.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {secondaryStats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
          <StatCard
            label="Expired"
            value={data?.expiredCount ?? 0}
            icon={AlertTriangle}
            color="text-danger-600"
            bgColor="bg-danger-50"
            surfaceClass="from-white to-rose-50/90 border-rose-100/80"
          />
          <StatCard
            label="Paid subs"
            value={data?.paidCount ?? 0}
            icon={DollarSign}
            color="text-success-600"
            bgColor="bg-success-50"
            surfaceClass="from-white to-lime-50/90 border-lime-100/80"
          />
          <StatCard
            label="Renewals (mo)"
            value={data?.renewalsThisMonth ?? 0}
            icon={TrendingUp}
            color="text-accent-700"
            bgColor="bg-accent-50"
            surfaceClass="from-white to-cyan-50/90 border-cyan-100/80"
          />
          <StatCard
            label="Replacements"
            value={data?.replacementsActive ?? 0}
            icon={Activity}
            color="text-warning-600"
            bgColor="bg-warning-50"
            surfaceClass="from-white to-orange-50/90 border-orange-100/80"
          />
        </div>
      </section>
    </div>
  );
}
