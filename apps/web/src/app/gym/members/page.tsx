'use client';

import { useEffect, useState } from 'react';
import { useOrg } from '@/contexts/org-context';
import { api } from '@/lib/api';
import { Search, Plus, UserCheck, UserX, Mail, Phone, Download, MessageCircle, CheckSquare, Square } from 'lucide-react';
import Link from 'next/link';

interface Member { id: string; name: string; email: string | null; phone: string | null; barcode: string | null; createdAt: string; }

export default function GymMembers() {
  const { selectedOrg } = useOrg();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!selectedOrg) return;
    setLoading(true);
    api.get<Member[]>(`/organizations/${selectedOrg.id}/customers`).then(setMembers).catch(() => setMembers([])).finally(() => setLoading(false));
  }, [selectedOrg]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOrg || !form.name.trim()) return;
    setError('');
    try {
      const data: any = { name: form.name.trim() };
      if (form.email.trim()) data.email = form.email.trim();
      if (form.phone.trim()) data.phone = form.phone.trim();
      const member = await api.post<Member>(`/organizations/${selectedOrg.id}/customers`, data);
      setMembers((prev) => [...prev, member]);
      setForm({ name: '', email: '', phone: '' });
      setShowForm(false);
    } catch (err: any) { setError(err?.message || 'Erreur'); }
  }

  async function handleDelete(id: string) {
    if (!selectedOrg || !confirm('Supprimer ce membre ?')) return;
    try { await api.delete(`/organizations/${selectedOrg.id}/customers/${id}`); setMembers((prev) => prev.filter((m) => m.id !== id)); } catch {}
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((m) => m.id)));
    }
  }

  function exportCSV() {
    const headers = ['Nom', 'Email', 'Téléphone', 'Code-barres', 'Date de création'];
    const rows = filtered.map((m) => [m.name, m.email || '', m.phone || '', m.barcode || '', new Date(m.createdAt).toLocaleDateString('fr')]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `membres_${selectedOrg?.name || 'export'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function sendWhatsAppBulk() {
    const selectedMembers = filtered.filter((m) => selected.has(m.id) && m.phone);
    if (selectedMembers.length === 0) { alert('Sélectionnez des membres avec un numéro de téléphone'); return; }
    const message = encodeURIComponent("Bonjour ! Votre abonnement arrive à expiration. Veuillez renouveler votre abonnement pour continuer à bénéficier de nos services. Merci !");
    // Open WhatsApp for each member
    selectedMembers.forEach((m) => {
      const phone = m.phone!.replace(/\s/g, '').replace(/^(\+216|00216|216)/, '216');
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    });
  }

  const filtered = members.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()) || (m.email && m.email.toLowerCase().includes(search.toLowerCase())) || (m.phone && m.phone.includes(search)));

  if (!selectedOrg) return <div className="text-center py-12 text-[#9CA3AF]">Sélectionnez une entreprise</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-[#F8F8F2] tracking-wider">Membres</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 bg-[#F97316] text-white rounded-lg text-sm font-medium hover:bg-[#EA580C] transition">
          <Plus className="w-4 h-4" />{showForm ? 'Annuler' : 'Ajouter'}
        </button>
      </div>

      {/* Search + Bulk actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un membre..." className="w-full pl-10 pr-4 py-2.5 bg-[#1C1C27] border border-white/5 rounded-lg text-sm text-[#F8F8F2] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F97316]/50" />
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 bg-[#1C1C27] border border-white/5 rounded-lg text-sm text-[#9CA3AF] hover:text-[#F8F8F2] hover:bg-[#22222E] transition">
            <Download className="w-4 h-4" />CSV
          </button>
          {selected.size > 0 && (
            <button onClick={sendWhatsAppBulk} className="flex items-center gap-2 px-3 py-2 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-lg text-sm text-[#22C55E] hover:bg-[#22C55E]/20 transition">
              <MessageCircle className="w-4 h-4" />WhatsApp ({selected.size})
            </button>
          )}
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="card-gym space-y-3">
          {error && <div className="text-sm text-[#EF4444] bg-[#EF4444]/10 p-2 rounded-lg">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input type="text" placeholder="Nom complet *" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="px-3 py-2 bg-[#1C1C27] border border-white/5 rounded-lg text-sm text-[#F8F8F2] placeholder-[#9CA3AF]" required />
            <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="px-3 py-2 bg-[#1C1C27] border border-white/5 rounded-lg text-sm text-[#F8F8F2] placeholder-[#9CA3AF]" />
            <input type="tel" placeholder="Téléphone (+216)" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="px-3 py-2 bg-[#1C1C27] border border-white/5 rounded-lg text-sm text-[#F8F8F2] placeholder-[#9CA3AF]" />
          </div>
          <button type="submit" className="px-4 py-2 bg-[#F97316] text-white text-sm rounded-lg hover:bg-[#EA580C] transition">Enregistrer</button>
        </form>
      )}

      {/* Members Grid */}
      {loading ? <div className="text-center py-12 text-[#9CA3AF]">Chargement...</div> : filtered.length === 0 ? <div className="text-center py-12 text-[#9CA3AF]">{search ? 'Aucun membre trouvé' : 'Aucun membre'}</div> : (
        <>
          {/* Select all */}
          <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
            <button onClick={selectAll} className="flex items-center gap-1 hover:text-[#F8F8F2] transition">
              {selected.size === filtered.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              Tout sélectionner ({filtered.length})
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((m) => (
              <div key={m.id} className={`card-gym hover:border-[#F97316]/30 transition-colors ${selected.has(m.id) ? 'border-[#F97316]/50 bg-[#F97316]/5' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleSelect(m.id)} className="text-[#9CA3AF] hover:text-[#F97316]">
                      {selected.has(m.id) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                    </button>
                    <Link href={`/gym/members/${m.id}`} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#F97316]/10 rounded-full flex items-center justify-center"><UserCheck className="w-5 h-5 text-[#F97316]" /></div>
                      <div>
                        <div className="text-sm font-medium text-[#F8F8F2]">{m.name}</div>
                        <div className="text-xs text-[#9CA3AF] font-mono">{new Date(m.createdAt).toLocaleDateString('fr')}</div>
                      </div>
                    </Link>
                  </div>
                  <button onClick={() => handleDelete(m.id)} className="text-[#6B7280] hover:text-[#EF4444] transition"><UserX className="w-4 h-4" /></button>
                </div>
                <div className="space-y-1 ml-8">
                  {m.email && <div className="flex items-center gap-2 text-xs text-[#9CA3AF]"><Mail className="w-3 h-3" />{m.email}</div>}
                  {m.phone && <div className="flex items-center gap-2 text-xs text-[#9CA3AF]"><Phone className="w-3 h-3" />{m.phone}</div>}
                  {m.barcode && <div className="flex items-center gap-2 text-xs text-[#9CA3AF] font-mono"><span className="text-[#6B7280]">⊞</span>{m.barcode}</div>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
