'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, UserPlus, Save } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { getPlans } from '@/lib/gym/dataService';
import type { SubscriptionPlan } from '@/lib/gym/types';

const memberSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(8, 'Phone number is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  birthDate: z.string().optional(),
  planId: z.string().optional(),
  startDate: z.string().optional(),
  notes: z.string().optional(),
});

type MemberFormData = z.infer<typeof memberSchema>;

export default function NewMemberPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: plans = [] } = useQuery({
    queryKey: ['gym-plans'],
    queryFn: getPlans,
  });

  const createMutation = useMutation({
    mutationFn: async (data: MemberFormData) => {
      const payload: Record<string, unknown> = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      };
      if (data.email) payload.email = data.email;
      if (data.birthDate) payload.birthDate = data.birthDate;
      if (data.notes) payload.notes = data.notes;
      if (data.planId && data.startDate) {
        payload.subscription = { planId: data.planId, startDate: data.startDate };
      }
      return api.post('/customers', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-members'] });
      router.push('/gym/members');
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to create member');
    },
  });

  const { register, handleSubmit, watch, formState: { errors } } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      birthDate: '',
      planId: '',
      startDate: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  const selectedPlanId = watch('planId');
  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  const onSubmit = useCallback((data: MemberFormData) => {
    setError(null);
    createMutation.mutate(data);
  }, [createMutation]);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl text-white/40 hover:text-white/60 hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Add Member</h1>
          <p className="text-sm text-white/40">Register a new gym member</p>
        </div>
      </div>

      <Card className="bg-[#1a1a24] border-white/5">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">First Name *</label>
                <input
                  {...register('firstName')}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0A0A0F] border border-white/5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#F97316]/50"
                  placeholder="Ahmed"
                />
                {errors.firstName && <p className="text-xs text-red-400 mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Last Name *</label>
                <input
                  {...register('lastName')}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0A0A0F] border border-white/5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#F97316]/50"
                  placeholder="Ben Ahmed"
                />
                {errors.lastName && <p className="text-xs text-red-400 mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-1.5">Phone *</label>
              <input
                {...register('phone')}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0A0A0F] border border-white/5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#F97316]/50"
                placeholder="20 123 456"
              />
              {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Email</label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0A0A0F] border border-white/5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#F97316]/50"
                  placeholder="ahmed@email.com"
                />
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Birth Date</label>
                <input
                  type="date"
                  {...register('birthDate')}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0A0A0F] border border-white/5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#F97316]/50"
                />
              </div>
            </div>

            <div className="border-t border-white/5 pt-6">
              <h3 className="text-sm font-medium text-white/60 mb-4">Initial Subscription (optional)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Plan</label>
                  <select
                    {...register('planId')}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0A0A0F] border border-white/5 text-white text-sm focus:outline-none focus:border-[#F97316]/50"
                  >
                    <option value="">No plan</option>
                    {plans.filter((p) => p.isActive).map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} — {(plan.price / 1000).toFixed(3)} TND ({plan.durationDays}d)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Start Date</label>
                  <input
                    type="date"
                    {...register('startDate')}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0A0A0F] border border-white/5 text-white text-sm focus:outline-none focus:border-[#F97316]/50"
                  />
                </div>
              </div>
              {selectedPlan && (
                <p className="text-xs text-white/40 mt-2">
                  Duration: {selectedPlan.durationDays} days — Ends: {new Date(
                    new Date(watch('startDate') || new Date()).getTime() + selectedPlan.durationDays * 86400000
                  ).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-1.5">Notes</label>
              <textarea
                {...register('notes')}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0A0A0F] border border-white/5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#F97316]/50 resize-none"
                placeholder="Any notes about this member..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 text-white/60 text-sm hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#F97316] text-white text-sm font-medium hover:bg-[#EA580C] disabled:opacity-50 transition-colors"
              >
                {createMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                {createMutation.isPending ? 'Creating...' : 'Add Member'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
