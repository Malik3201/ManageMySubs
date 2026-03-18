import { useState } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { useSalesReport, useProfitReport } from '../hooks/useReports';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import { currency } from '../utils/formatters';
import { todayStr } from '../utils/dateHelpers';

export default function Reports() {
  const now = new Date();
  const firstOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const [from, setFrom] = useState(firstOfMonth);
  const [to, setTo] = useState(todayStr());
  const [groupBy, setGroupBy] = useState('daily');

  const salesParams = { from, to, groupBy };
  const profitParams = { from, to };

  const { data: salesData, isLoading: salesLoading, isError: salesError, refetch: refetchSales } = useSalesReport(salesParams);
  const { data: profitData, isLoading: profitLoading, isError: profitError, refetch: refetchProfit } = useProfitReport(profitParams);

  const loading = salesLoading || profitLoading;

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900 mb-4 sm:text-2xl">Reports</h1>

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Group</label>
          <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="py-20" />
      ) : salesError || profitError ? (
        <ErrorState
          title="Reports unavailable"
          description="We couldn't load your sales or profit reports."
          onRetry={() => {
            refetchSales();
            refetchProfit();
          }}
        />
      ) : (
        <div className="space-y-4">
          {profitData && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card><CardBody>
                <p className="text-xs text-slate-500">Total Sales</p>
                <p className="text-xl font-bold text-slate-900">{currency(profitData.totalSales)}</p>
              </CardBody></Card>
              <Card><CardBody>
                <p className="text-xs text-slate-500">Total Profit</p>
                <p className="text-xl font-bold text-success-600">{currency(profitData.totalProfit)}</p>
              </CardBody></Card>
              <Card><CardBody>
                <p className="text-xs text-slate-500">Total Entries</p>
                <p className="text-xl font-bold text-slate-900">{profitData.totalCount}</p>
              </CardBody></Card>
              <Card><CardBody>
                <p className="text-xs text-slate-500">Avg Profit</p>
                <p className="text-xl font-bold text-primary-600">
                  {profitData.totalCount ? currency(Math.round(profitData.totalProfit / profitData.totalCount)) : '₹0'}
                </p>
              </CardBody></Card>
            </div>
          )}

          {profitData?.byCategory?.length > 0 && (
            <Card>
              <CardHeader><h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Profit by Category</h2></CardHeader>
              <CardBody>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="py-2 text-left font-medium text-slate-500">Category</th>
                        <th className="py-2 text-right font-medium text-slate-500">Count</th>
                        <th className="py-2 text-right font-medium text-slate-500">Sales</th>
                        <th className="py-2 text-right font-medium text-slate-500">Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profitData.byCategory.map((row) => (
                        <tr key={row.category} className="border-b border-slate-50">
                          <td className="py-2 font-medium text-slate-800">{row.category}</td>
                          <td className="py-2 text-right text-slate-600">{row.count}</td>
                          <td className="py-2 text-right text-slate-600">{currency(row.sales)}</td>
                          <td className="py-2 text-right font-medium text-success-600">{currency(row.profit)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          )}

          {salesData?.rows?.length > 0 ? (
            <Card>
              <CardHeader>
                <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" /> Sales Breakdown ({groupBy})
                </h2>
              </CardHeader>
              <CardBody>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="py-2 text-left font-medium text-slate-500">{groupBy === 'daily' ? 'Date' : 'Month'}</th>
                        <th className="py-2 text-right font-medium text-slate-500">Count</th>
                        <th className="py-2 text-right font-medium text-slate-500">Sales</th>
                        <th className="py-2 text-right font-medium text-slate-500">Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesData.rows.map((row) => (
                        <tr key={row.date || row.month} className="border-b border-slate-50">
                          <td className="py-2 font-medium text-slate-800">{row.date || row.month}</td>
                          <td className="py-2 text-right text-slate-600">{row.count}</td>
                          <td className="py-2 text-right text-slate-600">{currency(row.sales)}</td>
                          <td className="py-2 text-right font-medium text-success-600">{currency(row.profit)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          ) : (
            <EmptyState icon={BarChart3} title="No sales data" description="Sales data will appear here once subscriptions are created." />
          )}
        </div>
      )}
    </div>
  );
}
