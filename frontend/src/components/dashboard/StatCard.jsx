export default function StatCard({ label, value, icon: Icon, color = 'text-primary-600', bgColor = 'bg-primary-50' }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/90 p-4 shadow-[0_14px_40px_-20px_rgba(15,23,42,0.35)] backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className={`rounded-2xl p-3 ${bgColor} ring-1 ring-white/70`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
