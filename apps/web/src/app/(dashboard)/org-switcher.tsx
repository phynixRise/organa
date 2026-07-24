'use client';

import { useState, useRef, useEffect } from 'react';
import { useOrg } from '@/contexts/org-context';

export default function OrgSwitcher() {
  const { orgs, selectedOrg, selectOrg, createOrg } = useOrg();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('cafe');
  const [error, setError] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleCreate() {
    if (!newName.trim()) return;
    setError('');
    try {
      await createOrg({ name: newName.trim(), businessType: newType });
      setCreating(false);
      setNewName('');
      setOpen(false);
    } catch (err: any) {
      setError(err?.message || 'Erreur');
    }
  }

  if (!selectedOrg) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
      >
        <span className="font-medium text-gray-800">{selectedOrg.name}</span>
        <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
          {selectedOrg.businessType}
        </span>
        <span className="text-gray-400 text-xs">▼</span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1">
          <div className="px-3 py-2 text-xs text-gray-400 font-medium uppercase tracking-wide">
            Mes entreprises
          </div>
          {orgs.map((org) => (
            <button
              key={org.id}
              onClick={() => { selectOrg(org); setOpen(false); }}
              className={`w-full text-left px-3 py-2 flex items-center justify-between text-sm hover:bg-gray-50 ${
                org.id === selectedOrg.id ? 'bg-blue-50' : ''
              }`}
            >
              <div>
                <div className="font-medium text-gray-800">{org.name}</div>
                <div className="text-xs text-gray-400">{org.businessType}</div>
              </div>
              {org.id === selectedOrg.id && <span className="text-blue-600">✓</span>}
            </button>
          ))}
          <div className="border-t border-gray-100 mt-1 pt-1">
            {!creating ? (
              <button
                onClick={() => setCreating(true)}
                className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50"
              >
                + Créer une nouvelle entreprise
              </button>
            ) : (
              <div className="p-3 space-y-2">
                {error && <div className="text-xs text-red-600">{error}</div>}
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nom de l'entreprise"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                >
                  <option value="cafe">Café / Restaurant</option>
                  <option value="boutique">Boutique</option>
                  <option value="gym">Salle de sport</option>
                  <option value="services">Services</option>
                  <option value="autre">Autre</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreate}
                    className="flex-1 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Créer
                  </button>
                  <button
                    onClick={() => setCreating(false)}
                    className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
