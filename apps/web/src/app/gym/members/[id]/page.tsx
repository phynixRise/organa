'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useOrg } from '@/contexts/org-context';
import { api } from '@/lib/api';
import { ArrowLeft, User, CreditCard, Calendar, FileText, Edit2, Snowflake, Play, QrCode } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  barcode: string | null;
  createdAt: string;
}

interface Order {
  id: string;
  totalMillimes: number;
  status: string;
  createdAt: string;
}

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  createdAt: string;
}

export default function MemberDetailPage() {
  const { id } = useParams();
  const { selectedOrg } = useOrg();
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!selectedOrg || !id) return;
    setLoading(true);
    Promise.all([
      api.get<Member[]>(`/organizations/${selectedOrg.id}/customers`).catch(() => []),
      api.get<Order[]>(`/organizations/${selectedOrg.id}/orders`).catch(() => []),
      api.get<Appointment[]>(`/organizations/${selectedOrg.id}/appointments`).catch(() => []),
    ]).then(([members, ords, appts]) => {
      const m = members.find((m: any) => m.id === id);
      setMember(m || null);
      setOrders(ords.filter((o: any) => o.customerId === id));
      setAppointments(appts.filter((a: any) => a.customerId === id));
      setLoading(false);
    });
  }, [selectedOrg, id]);

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-[#0A0A0F]"><div className="text-[#9CA3AF]">Chargement...</div></div>;
  if (!member) return <div className="flex items-center justify-center min-h-screen bg-[#0A0A0F]"><div className="text-[#EF4444]">Membre non trouvé</div></div>;

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: User },
    { id: 'payments', label: 'Paiements', icon: CreditCard },
    { id: 'attendance', label: 'Présence', icon: Calendar },
    { id: 'qr', label: 'QR Code', icon: QrCode },
  ];

  const totalPaid = orders.filter((o) => o.status === 'completed').reduce((sum, o) => sum + o.totalMillimes, 0);

  return (
    <div className="min-h-screen bg-[#0A0A0F] p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-[#111118] border border-white/5 rounded-lg hover:bg-[#1C1C27] transition">
          <ArrowLeft className="w-5 h-5 text-[#9CA3AF]" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#F97316]/10 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-[#F97316]" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-[#F8F8F2] tracking-wider">{member.name}</h1>
            <div className="text-sm text-[#9CA3AF]">
              Membre depuis {new Date(member.createdAt).toLocaleDateString('fr')}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#111118] border border-white/5 rounded-lg p-1 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${activeTab === tab.id ? 'bg-[#F97316] text-white' : 'text-[#9CA3AF] hover:text-[#F8F8F2] hover:bg-[#1C1C27]'}`}>
              <Icon className="w-4 h-4" />{tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card-gym lg:col-span-2 space-y-4">
            <h2 className="font-display text-xl text-[#F8F8F2] tracking-wider">Informations</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-[#9CA3AF]">Nom</label><div className="text-sm text-[#F8F8F2]">{member.name}</div></div>
              <div><label className="text-xs text-[#9CA3AF]">Email</label><div className="text-sm text-[#F8F8F2]">{member.email || '—'}</div></div>
              <div><label className="text-xs text-[#9CA3AF]">Téléphone</label><div className="text-sm text-[#F8F8F2]">{member.phone || '—'}</div></div>
              <div><label className="text-xs text-[#9CA3AF]">Code-barres</label><div className="text-sm text-[#F8F8F2] font-mono">{member.barcode || '—'}</div></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="card-gym text-center">
              <div className="text-xs text-[#9CA3AF] mb-1">Total payé</div>
              <div className="font-display text-3xl text-[#22C55E]">{(totalPaid / 1000).toFixed(3)} TND</div>
            </div>
            <div className="card-gym text-center">
              <div className="text-xs text-[#9CA3AF] mb-1">Commandes</div>
              <div className="font-display text-3xl text-[#F8F8F2]">{orders.length}</div>
            </div>
            <div className="card-gym text-center">
              <div className="text-xs text-[#9CA3AF] mb-1">Présences</div>
              <div className="font-display text-3xl text-[#3B82F6]">{appointments.length}</div>
            </div>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="card-gym">
          <h2 className="font-display text-xl text-[#F8F8F2] tracking-wider mb-4">Historique des paiements</h2>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-[#9CA3AF]">Aucun paiement</div>
          ) : (
            <div className="space-y-2">
              {orders.map((o) => (
                <div key={o.id} className="flex items-center justify-between p-3 bg-[#1C1C27] rounded-lg">
                  <div>
                    <div className="text-sm text-[#F8F8F2] font-mono">{o.id.slice(0, 8)}...</div>
                    <div className="text-xs text-[#9CA3AF]">{new Date(o.createdAt).toLocaleDateString('fr')}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-[#F8F8F2]">{(o.totalMillimes / 1000).toFixed(3)} TND</div>
                    <span className={`text-xs px-2 py-0.5 rounded ${o.status === 'completed' ? 'bg-[#22C55E]/10 text-[#22C55E]' : o.status === 'open' ? 'bg-[#EAB308]/10 text-[#EAB308]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
                      {o.status === 'completed' ? 'Payé' : o.status === 'open' ? 'En attente' : 'Annulé'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="card-gym">
          <h2 className="font-display text-xl text-[#F8F8F2] tracking-wider mb-4">Historique de présence</h2>
          {appointments.length === 0 ? (
            <div className="text-center py-8 text-[#9CA3AF]">Aucune présence enregistrée</div>
          ) : (
            <div className="space-y-2">
              {appointments.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-[#1C1C27] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#22C55E]/10 rounded-full flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-[#22C55E]" />
                    </div>
                    <div>
                      <div className="text-sm text-[#F8F8F2]">{new Date(a.startTime).toLocaleDateString('fr')}</div>
                      <div className="text-xs text-[#9CA3AF]">
                        {new Date(a.startTime).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })} — {new Date(a.endTime).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#22C55E]/10 text-[#22C55E]">Présent</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* QR Code Tab */}
      {activeTab === 'qr' && (
        <div className="card-gym text-center space-y-4">
          <h2 className="font-display text-xl text-[#F8F8F2] tracking-wider">QR Code du membre</h2>
          <div className="inline-block p-6 bg-white rounded-xl">
            <div className="w-48 h-48 flex items-center justify-center text-gray-400">
              {member.barcode ? (
                <div className="text-center">
                  <div className="text-4xl mb-2">⊞</div>
                  <div className="font-mono text-sm text-gray-600">{member.barcode}</div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-4xl mb-2">?</div>
                  <div className="text-sm">Pas de code-barres</div>
                </div>
              )}
            </div>
          </div>
          <div className="text-sm text-[#9CA3AF]">
            Scannez ce code pour l'enregistrement de présence
          </div>
        </div>
      )}
    </div>
  );
}
