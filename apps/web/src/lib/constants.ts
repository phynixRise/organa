export const GYM_TYPES = ['gym', 'fitness', 'salle_de_sport'];
export const BOUTIQUE_TYPES = ['boutique', 'tienda'];
export const CAFE_TYPES = ['cafe', 'restaurant'];

export function getDashboardPath(businessType: string): string {
  if (GYM_TYPES.includes(businessType)) return '/gym/dashboard';
  if (BOUTIQUE_TYPES.includes(businessType)) return '/boutique/dashboard';
  if (CAFE_TYPES.includes(businessType)) return '/cafe/dashboard';
  return '/boutique/dashboard';
}

export function getBizColor(businessType: string): string {
  if (GYM_TYPES.includes(businessType)) return '#F97316';
  if (CAFE_TYPES.includes(businessType)) return '#22C55E';
  return '#3B82F6';
}

export function getDaysRemaining(endDate: string): number {
  return Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}
