'use client';

import { useState } from 'react';
import { Coffee, Users, CheckCircle, Clock } from 'lucide-react';

interface TableInfo { id: number; name: string; status: 'free' | 'occupied'; orders: number; total: number; }

const INITIAL_TABLES: TableInfo[] = [
  { id: 1, name: 'Table 1', status: 'free', orders: 0, total: 0 },
  { id: 2, name: 'Table 2', status: 'free', orders: 0, total: 0 },
  { id: 3, name: 'Table 3', status: 'free', orders: 0, total: 0 },
  { id: 4, name: 'Table 4', status: 'free', orders: 0, total: 0 },
  { id: 5, name: 'Table 5', status: 'free', orders: 0, total: 0 },
  { id: 6, name: 'Table 6', status: 'free', orders: 0, total: 0 },
  { id: 7, name: 'Table 7', status: 'free', orders: 0, total: 0 },
  { id: 8, name: 'Table 8', status: 'free', orders: 0, total: 0 },
];

export default function CafeTables() {
  const [tables, setTables] = useState<TableInfo[]>(INITIAL_TABLES);

  function toggleStatus(id: number) {
    setTables((prev) => prev.map((t) =>
      t.id === id ? { ...t, status: t.status === 'free' ? 'occupied' : 'free', orders: t.status === 'free' ? 0 : t.orders, total: t.status === 'free' ? 0 : t.total } : t
    ));
  }

  const freeCount = tables.filter((t) => t.status === 'free').length;
  const occupiedCount = tables.filter((t) => t.status === 'occupied').length;

  return (
    <div className="cafe-theme max-w-[1440px] mx-auto px-4 sm:px-6 py-8 space-y-6">
      <h1 className="font-display text-3xl font-bold text-stone-800 dark:text-stone-100 tracking-tight flex items-center gap-3">
        <Coffee className="w-8 h-8 text-amber-600 dark:text-amber-400" />
        Tables
      </h1>

      <div className="grid grid-cols-2 gap-3">
        <div className="card-cafe text-center">
          <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-2">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="font-display text-2xl font-bold text-stone-800 dark:text-stone-100">{freeCount}</div>
          <div className="text-xs text-stone-400">Libres</div>
        </div>
        <div className="card-cafe text-center">
          <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-2">
            <Clock className="w-5 h-5 text-red-500" />
          </div>
          <div className="font-display text-2xl font-bold text-stone-800 dark:text-stone-100">{occupiedCount}</div>
          <div className="text-xs text-stone-400">Occupées</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {tables.map((t) => (
          <button key={t.id} onClick={() => toggleStatus(t.id)}
            className={`p-6 rounded-2xl border-2 transition-all text-center ${
              t.status === 'free'
                ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/50 hover:border-green-400'
                : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50 hover:border-red-400'
            }`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
              t.status === 'free' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              {t.status === 'free' ? <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" /> : <Clock className="w-6 h-6 text-red-500" />}
            </div>
            <div className="font-display text-xl font-bold text-stone-800 dark:text-stone-100 tracking-tight mb-1">{t.name}</div>
            <div className={`text-xs font-medium ${t.status === 'free' ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
              {t.status === 'free' ? 'Libre' : 'Occupée'}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
