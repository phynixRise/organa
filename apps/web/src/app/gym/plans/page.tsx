'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Plus,
  GripVertical,
  Edit3,
  Trash2,
  Clock,
  DollarSign,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
  formatTND,
} from '@/lib/gym/dataService';
import type { SubscriptionPlan } from '@/lib/gym/types';

const planSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  durationDays: z.number().min(1, 'Duration must be at least 1 day'),
  price: z.number().min(0, 'Price must be positive'),
});

type PlanFormData = z.infer<typeof planSchema>;

const durationPresets = [
  { label: '1 Month', days: 30 },
  { label: '3 Months', days: 90 },
  { label: '6 Months', days: 180 },
  { label: '1 Year', days: 365 },
];

export default function PlansPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['gym-plans'],
    queryFn: getPlans,
  });

  const createMutation = useMutation({
    mutationFn: (data: PlanFormData) => createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-plans'] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SubscriptionPlan> }) => updatePlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-plans'] });
      setShowForm(false);
      setEditingPlan(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-plans'] });
      setShowDeleteConfirm(null);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => updatePlan(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-plans'] });
    },
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: { name: '', durationDays: 30, price: 0 },
  });

  const watchDuration = watch('durationDays');

  const openCreateForm = useCallback(() => {
    setEditingPlan(null);
    reset({ name: '', durationDays: 30, price: 0 });
    setShowForm(true);
  }, [reset]);

  const openEditForm = useCallback((plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    reset({ name: plan.name, durationDays: plan.durationDays, price: plan.price });
    setShowForm(true);
  }, [reset]);

  const onSubmit = useCallback((data: PlanFormData) => {
    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, data });
    } else {
      createMutation.mutate(data);
    }
  }, [editingPlan, createMutation, updateMutation]);

  const handleReorder = useCallback(async (newOrder: SubscriptionPlan[]) => {
    // Optimistic update - in production would save sort order to API
    queryClient.setQueryData(['gym-plans'], newOrder);
  }, [queryClient]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-display text-[#F8F8F2]">Plans</h1>
          <p className="text-sm text-[#6B7280]">{plans.length} subscription plans</p>
        </div>
        <button
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#F97316] text-[#F8F8F2] text-sm font-medium hover:bg-[#EA580C] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Plan
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="bg-[#111118] border-white/5">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-6 w-32 bg-[#0A0A0F] rounded animate-pulse" />
                  <div className="h-4 w-24 bg-[#0A0A0F] rounded animate-pulse" />
                  <div className="h-8 w-20 bg-[#0A0A0F] rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <Card className="bg-[#111118] border-white/5">
          <CardContent className="p-12 text-center">
            <DollarSign className="w-12 h-12 text-[#F8F8F2]/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#F8F8F2] mb-2">No plans yet</h3>
            <p className="text-sm text-[#6B7280] mb-4">Create your first subscription plan</p>
            <button
              onClick={openCreateForm}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F97316] text-[#F8F8F2] text-sm font-medium hover:bg-[#EA580C] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Plan
            </button>
          </CardContent>
        </Card>
      ) : (
        <Reorder.Group axis="y" values={plans} onReorder={handleReorder} className="space-y-3">
          {plans.map((plan) => (
            <Reorder.Item key={plan.id} value={plan}>
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.01 }}
              >
                <Card className={`bg-[#111118] border-white/5 ${!plan.isActive ? 'opacity-50' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="text-[#F8F8F2]/20 cursor-grab">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-[#F8F8F2]">{plan.name}</h3>
                          {!plan.isActive && (
                            <span className="px-2 py-0.5 rounded text-xs bg-[#0A0A0F] text-[#6B7280]">Inactive</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="flex items-center gap-1 text-sm text-[#6B7280]">
                            <Clock className="w-3.5 h-3.5" />
                            {plan.durationDays} days
                          </span>
                          <span className="flex items-center gap-1 text-sm text-[#6B7280]">
                            <DollarSign className="w-3.5 h-3.5" />
                            {(plan.price / 1000).toFixed(3)} TND
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleActiveMutation.mutate({ id: plan.id, isActive: !plan.isActive })}
                          className={`p-2 rounded-lg transition-colors ${
                            plan.isActive ? 'text-[#22C55E] hover:bg-[#22C55E]/10' : 'text-[#6B7280] hover:bg-[#1C1C27]'
                          }`}
                        >
                          {plan.isActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                        </button>
                        <button
                          onClick={() => openEditForm(plan)}
                          className="p-2 rounded-lg text-[#6B7280] hover:text-[#9CA3AF] hover:bg-[#1C1C27] transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(plan.id)}
                          className="p-2 rounded-lg text-[#6B7280] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111118] border border-white/10 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[#F8F8F2]">{editingPlan ? 'Edit Plan' : 'Add Plan'}</h2>
                <button
                  onClick={() => { setShowForm(false); setEditingPlan(null); }}
                  className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#9CA3AF] hover:bg-[#1C1C27]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm text-[#9CA3AF] mb-1.5">Plan Name</label>
                  <input
                    {...register('name')}
                    className="w-full px-4 py-2.5 rounded-lg bg-[#0A0A0F] border border-white/5 text-[#F8F8F2] placeholder:text-[#6B7280] text-sm focus:border-[#F97316]/30 focus:outline-none"
                    placeholder="e.g. Monthly Premium"
                  />
                  {errors.name && <p className="text-xs text-[#EF4444] mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm text-[#9CA3AF] mb-1.5">Duration (days)</label>
                  <input
                    type="number"
                    {...register('durationDays', { valueAsNumber: true })}
                    className="w-full px-4 py-2.5 rounded-lg bg-[#0A0A0F] border border-white/5 text-[#F8F8F2] placeholder:text-[#6B7280] text-sm focus:border-[#F97316]/30 focus:outline-none"
                  />
                  {errors.durationDays && <p className="text-xs text-[#EF4444] mt-1">{errors.durationDays.message}</p>}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {durationPresets.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setValue('durationDays', preset.days, { shouldValidate: true })}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          watchDuration === preset.days
                            ? 'bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20'
                            : 'bg-[#0A0A0F] text-[#6B7280] border border-white/5 hover:bg-white/10'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[#9CA3AF] mb-1.5">Price (TND millimes)</label>
                  <input
                    type="number"
                    {...register('price', { valueAsNumber: true })}
                    className="w-full px-4 py-2.5 rounded-lg bg-[#0A0A0F] border border-white/5 text-[#F8F8F2] placeholder:text-[#6B7280] text-sm focus:border-[#F97316]/30 focus:outline-none"
                    placeholder="e.g. 49000 (49 TND)"
                  />
                  {errors.price && <p className="text-xs text-[#EF4444] mt-1">{errors.price.message}</p>}
                  <p className="text-xs text-[#6B7280] mt-1">1 TND = 1000 millimes</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setEditingPlan(null); }}
                    className="flex-1 py-2.5 px-4 rounded-lg bg-[#0A0A0F] text-[#9CA3AF] text-sm hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-1 py-2.5 px-4 rounded-lg bg-[#F97316] text-[#F8F8F2] text-sm font-medium hover:bg-[#EA580C] disabled:opacity-50 transition-colors"
                  >
                    {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingPlan ? 'Save Changes' : 'Create Plan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111118] border border-white/10 rounded-2xl p-6 w-full max-w-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-[#EF4444]/10">
                  <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
                </div>
                <h3 className="text-lg font-bold text-[#F8F8F2]">Delete Plan</h3>
              </div>
              <p className="text-sm text-[#9CA3AF] mb-6">
                This will permanently delete this plan. Members with this plan will keep their subscription until it expires.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-[#0A0A0F] text-[#9CA3AF] text-sm hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => showDeleteConfirm && deleteMutation.mutate(showDeleteConfirm)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-[#EF4444]/10 text-[#EF4444] text-sm font-medium hover:bg-[#EF4444]/20 disabled:opacity-50 transition-colors"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
