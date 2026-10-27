import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatPersianDate } from '../../../shared/utils/date.js';

const money = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 });
const count = new Intl.NumberFormat('fa-IR');

function ChartCard({ title, description, children }) {
  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4">
        <h3 className="text-sm font-extrabold">{title}</h3>
        <p className="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <div className="h-64 min-w-0 sm:h-72">
        {children}
      </div>
    </section>
  );
}

function ChartTooltip({ active, payload, label, isMoney = false }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs shadow-xl dark:border-slate-700 dark:bg-slate-950">
      <p className="mb-2 font-bold">{label}</p>
      {payload.map((item) => (
        <p className="mt-1 text-slate-600 dark:text-slate-300" key={item.dataKey}>
          {item.name}: <strong className="text-slate-900 dark:text-white">
            {isMoney ? `${money.format(Number(item.value) || 0)} تومان` : count.format(Number(item.value) || 0)}
          </strong>
        </p>
      ))}
    </div>
  );
}

const axisTick = { fill: '#94a3b8', fontSize: 10, fontFamily: 'IRANSansX, sans-serif' };

export function WeeklySalesCharts({ reports = [] }) {
  const data = useMemo(() => {
    const reportMap = new Map(reports.map((report) => [report.date, report]));
    const today = new Date();
    const dates = [];

    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - offset));
      const key = date.toISOString().slice(0, 10);
      const report = reportMap.get(key) || {};

      dates.push({
        date: key,
        day: formatPersianDate(key).replace(/\u200e/g, ''),
        totalSales: Number(report.totalSales) || 0,
        totalProfit: Number(report.totalProfit) || 0,
        salesCount: Number(report.salesCount) || 0,
      });
    }

    return dates;
  }, [reports]);

  return (
    <div className="mt-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-base font-extrabold">گزارش فروش هفت روز اخیر</h2>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">از امروز تا شش روز قبل، بر اساس تمام شعبه‌ها</p>
        </div>
        <span className="rounded-full border border-slate-200 px-3 py-1.5 text-[10px] text-slate-500 dark:border-slate-700 dark:text-slate-400">۷ روز</span>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard title="مبلغ فروش روزانه" description="مجموع مبلغ فروش ثبت‌شده در هر روز">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 4 }}>
              <defs>
                <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
              <XAxis dataKey="day" tick={axisTick} tickLine={false} axisLine={false} minTickGap={8} />
              <YAxis tick={axisTick} tickLine={false} axisLine={false} width={48} tickFormatter={(value) => count.format(value)} />
              <Tooltip content={<ChartTooltip isMoney />} />
              <Area type="monotone" dataKey="totalSales" name="فروش" stroke="#6366f1" strokeWidth={3} fill="url(#salesFill)" activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="سود روزانه" description="مجموع سود فروش‌ها در هر روز">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 4 }}>
              <defs>
                <linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
              <XAxis dataKey="day" tick={axisTick} tickLine={false} axisLine={false} minTickGap={8} />
              <YAxis tick={axisTick} tickLine={false} axisLine={false} width={48} tickFormatter={(value) => count.format(value)} />
              <Tooltip content={<ChartTooltip isMoney />} />
              <Area type="monotone" dataKey="totalProfit" name="سود" stroke="#10b981" strokeWidth={3} fill="url(#profitFill)" activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="xl:col-span-2">
          <ChartCard title="تعداد فروش روزانه" description="تعداد فاکتورهای فروش ثبت‌شده در هر روز">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis dataKey="day" tick={axisTick} tickLine={false} axisLine={false} minTickGap={8} />
                <YAxis allowDecimals={false} tick={axisTick} tickLine={false} axisLine={false} width={40} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="salesCount" name="تعداد فاکتور" fill="#0ea5e9" radius={[6, 6, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}