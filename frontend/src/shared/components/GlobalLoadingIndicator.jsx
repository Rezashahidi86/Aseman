import { useEffect, useState } from 'react';

export function GlobalLoadingIndicator() {
  const [pending, setPending] = useState(0);

  useEffect(() => {
    const start = () => setPending((count) => count + 1);
    const finish = () => setPending((count) => Math.max(0, count - 1));
    window.addEventListener('aseman:request-start', start);
    window.addEventListener('aseman:request-finish', finish);
    return () => {
      window.removeEventListener('aseman:request-start', start);
      window.removeEventListener('aseman:request-finish', finish);
    };
  }, []);

  if (!pending) return null;

  return <div className="fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden bg-indigo-100 dark:bg-slate-800" role="progressbar" aria-label="در حال بارگذاری" aria-valuetext="در حال دریافت اطلاعات"><div className="h-full w-1/3 animate-[aseman-loading_1.2s_ease-in-out_infinite] rounded-full bg-indigo-600 dark:bg-indigo-400" /></div>;
}
