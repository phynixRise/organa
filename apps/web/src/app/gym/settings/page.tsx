'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Bell,
  Users,
  Trash2,
  Save,
  Plus,
  Edit3,
  X,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Globe,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/auth-context';
import { useOrganization } from '@/contexts/organization-context';
import { getGym, updateGym } from '@/lib/gym/dataService';
import type { NotificationTemplate } from '@/lib/gym/types';

type TabId = 'profile' | 'templates' | 'staff' | 'danger';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'templates', label: 'Templates', icon: Bell },
  { id: 'staff', label: 'Staff', icon: Users },
  { id: 'danger', label: 'Danger Zone', icon: Trash2 },
];

const profileSchema = z.object({
  name: z.string().min(1, 'Gym name is required'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const defaultTemplates: NotificationTemplate[] = [
  {
    type: 'expiry_reminder',
    fr: 'Bonjour {name}, votre abonnement au {gym} expire le {date}. Merci de le renouveler.',
    ar: 'مرحباً {name)، اشتراكك في {gym} ينتهي في {date}. يرجى التجديد.',
  },
  {
    type: 'payment_received',
    fr: 'Merci {name} pour votre paiement au {gym}. Montant: {amount} TND.',
    ar: 'شكراً {name} على دفعتك في {gym}. المبلغ: {amount} تونسي.',
  },
  {
    type: 'welcome',
    fr: 'Bienvenue {name} au {gym}! Votre abonnement est actif jusqu\'au {date}.',
    ar: 'مرحباً {name} في {gym}! اشتراكك نشط حتى {date}.',
  },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [showSuccess, setShowSuccess] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: organization?.name || '' },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { name: string; notificationTemplates?: NotificationTemplate[] }) => updateGym(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
  });

  const onProfileSubmit = useCallback((data: ProfileFormData) => {
    updateMutation.mutate(data);
  }, [updateMutation]);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-display text-[#F8F8F2]">Settings</h1>
        <p className="text-sm text-[#6B7280]">Manage your gym settings</p>
      </div>

      <div className="flex gap-1 p-1 bg-[#111118] rounded-xl overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabId)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-[#F97316]/10 text-[#F97316]'
                : 'text-[#6B7280] hover:text-[#9CA3AF] hover:bg-[#1C1C27]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'profile' && (
            <Card className="bg-[#111118] border-white/5">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="relative group">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#F97316] to-[#EA580C] flex items-center justify-center text-[#F8F8F2] text-2xl font-bold">
                        {organization?.name?.charAt(0) || 'G'}
                      </div>
                      <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Upload className="w-5 h-5 text-[#F8F8F2]" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-[#F8F8F2]">Gym Logo</h3>
                      <p className="text-xs text-[#6B7280]">Click to upload</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-[#9CA3AF] mb-1.5">Gym Name</label>
                    <input
                      {...register('name')}
                      className="w-full px-4 py-2.5 rounded-lg bg-[#0A0A0F] border border-white/5 text-[#F8F8F2] placeholder:text-[#6B7280] text-sm focus:border-[#F97316]/30 focus:outline-none"
                    />
                    {errors.name && <p className="text-xs text-[#EF4444] mt-1">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm text-[#9CA3AF] mb-1.5">Owner</label>
                    <input
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-2.5 rounded-lg bg-[#0A0A0F] border border-white/5 text-[#6B7280] text-sm cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-[#9CA3AF] mb-1.5">Default Language</label>
                    <div className="flex gap-3">
                      {['fr', 'ar', 'en'].map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0A0A0F] border border-white/10 text-[#9CA3AF] text-sm hover:bg-white/10 transition-colors"
                        >
                          <Globe className="w-4 h-4" />
                          {lang === 'fr' ? 'Francais' : lang === 'ar' ? 'العربية' : 'English'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <AnimatePresence>
                      {showSuccess && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="flex items-center gap-2 text-[#22C55E] text-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Settings saved
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <button
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#F97316] text-[#F8F8F2] text-sm font-medium hover:bg-[#EA580C] disabled:opacity-50 transition-colors ml-auto"
                    >
                      <Save className="w-4 h-4" />
                      {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-4">
              {defaultTemplates.map((template, i) => (
                <motion.div
                  key={template.type}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-[#111118] border-white/5">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-[#F8F8F2] capitalize">
                          {template.type.replace(/_/g, ' ')}
                        </h3>
                        <span className="text-xs text-[#6B7280] px-2 py-1 rounded bg-[#0A0A0F]">{template.type}</span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-[#6B7280] mb-1">French</label>
                          <textarea
                            defaultValue={template.fr}
                            rows={2}
                            className="w-full px-4 py-2.5 rounded-lg bg-[#0A0A0F] border border-white/5 text-[#F8F8F2] text-sm focus:border-[#F97316]/30 focus:outline-none resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[#6B7280] mb-1">Arabic</label>
                          <textarea
                            defaultValue={template.ar}
                            rows={2}
                            dir="rtl"
                            className="w-full px-4 py-2.5 rounded-lg bg-[#0A0A0F] border border-white/5 text-[#F8F8F2] text-sm focus:border-[#F97316]/30 focus:outline-none resize-none"
                          />
                        </div>
                        <p className="text-xs text-[#6B7280]">
                          Variables: {'{name}'}, {'{gym}'}, {'{date}'}, {'{amount}'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              <button
                onClick={() => updateMutation.mutate({ name: organization?.name || '', notificationTemplates: defaultTemplates })}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#F97316] text-[#F8F8F2] text-sm font-medium hover:bg-[#EA580C] transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Templates
              </button>
            </div>
          )}

          {activeTab === 'staff' && (
            <Card className="bg-[#111118] border-white/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-medium text-[#9CA3AF]">Staff Accounts</h3>
                  <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F97316]/10 text-[#F97316] text-xs font-medium hover:bg-[#F97316]/20 transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                    Add Staff
                  </button>
                </div>
                <div className="text-center py-8">
                  <Users className="w-10 h-10 text-[#F8F8F2]/20 mx-auto mb-3" />
                  <p className="text-sm text-[#6B7280]">No staff accounts yet</p>
                  <p className="text-xs text-[#6B7280] mt-1">Staff can manage members and attendance</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'danger' && (
            <Card className="bg-[#111118] border-[#EF4444]/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-[#EF4444]/10">
                    <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[#EF4444]">Danger Zone</h3>
                    <p className="text-xs text-[#6B7280]">Irreversible actions</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#EF4444]/5 border border-[#EF4444]/10">
                    <div>
                      <p className="text-sm font-medium text-[#F8F8F2]">Delete Gym</p>
                      <p className="text-xs text-[#6B7280]">Permanently delete this gym and all its data</p>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-[#EF4444]/10 text-[#EF4444] text-sm font-medium hover:bg-[#EF4444]/20 transition-colors">
                      Delete Gym
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
