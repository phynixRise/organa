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
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-foreground tracking-wider">Tables</h1>

      <div className="grid grid-cols-2 gap-3">
        <div className="card-gym text-center">
          <Coffee className="w-5 h-5 text-[green-500] mx-auto mb-1" />
          <div className="font-display text-2xl text-foreground">{freeCount}</div>
          <div className="text-xs text-muted-foreground">Libres</div>
        </div>
        <div className="card-gym text-center">
          <Users className="w-5 h-5 text-[red-500] mx-auto mb-1" />
          <div className="font-display text-2xl text-foreground">{occupiedCount}</div>
          <div className="text-xs text-muted-foreground">Occupées</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {tables.map((t) => (
          <button key={t.id} onClick={() => toggleStatus(t.id)}
            className={`p-6 rounded-2xl border-2 transition-all text-center ${
              t.status === 'free'
                ? 'bg-[green-500]/5 border-[green-500]/30 hover:border-[green-500]'
                : 'bg-[red-500]/5 border-[red-500]/30 hover:border-[red-500]'
            }`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
              t.status === 'free' ? 'bg-[green-500]/10' : 'bg-[red-500]/10'
            }`}>
              {t.status === 'free' ? <CheckCircle className="w-6 h-6 text-[green-500]" /> : <Clock className="w-6 h-6 text-[red-500]" />}
            </div>
            <div className="font-display text-xl text-foreground tracking-wider mb-1">{t.name}</div>
            <div className={`text-xs font-medium ${t.status === 'free' ? 'text-[green-500]' : 'text-[red-500]'}`}>
              {t.status === 'free' ? 'Libre' : 'Occupée'}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
