import {
  Dumbbell, Store, Coffee, UtensilsCrossed,
  ShoppingBag, Building2, Home, HeartPulse, Hotel
} from 'lucide-react';

export const GYM_TYPES = ['gym', 'fitness'];
export const BOUTIQUE_TYPES = ['boutique', 'tienda'];
export const CAFE_TYPES = ['cafe', 'restaurant'];
export const RENTAL_TYPES = ['rental_property'];
export const MEDICAL_TYPES = ['cabinet_medical'];
export const HOTEL_TYPES = ['hotel'];

export const ALL_BUSINESS_TYPES = [
  { value: 'cafe', label: 'Café / Restaurant', icon: Coffee },
  { value: 'restaurant', label: 'Restaurant', icon: UtensilsCrossed },
  { value: 'boutique', label: 'Boutique', icon: Store },
  { value: 'tienda', label: 'Épicerie / Tienda', icon: ShoppingBag },
  { value: 'gym', label: 'Salle de sport', icon: Dumbbell },
  { value: 'hotel', label: 'Hôtel', icon: Hotel },
  { value: 'cabinet_medical', label: 'Cabinet médical', icon: HeartPulse },
  { value: 'rental_property', label: 'Location immobilière', icon: Home },
];

export function getBizIcon(businessType: string) {
  const found = ALL_BUSINESS_TYPES.find((t) => t.value === businessType);
  return found?.icon ?? Store;
}

export function getBizLabel(businessType: string): string {
  const found = ALL_BUSINESS_TYPES.find((t) => t.value === businessType);
  return found?.label ?? businessType;
}

export function getDashboardPath(businessType: string): string {
  if (GYM_TYPES.includes(businessType)) return '/gym/dashboard';
  if (CAFE_TYPES.includes(businessType)) return '/cafe/dashboard';
  if (BOUTIQUE_TYPES.includes(businessType)) return '/boutique/dashboard';
  if (HOTEL_TYPES.includes(businessType)) return '/boutique/dashboard';
  if (RENTAL_TYPES.includes(businessType)) return '/boutique/dashboard';
  if (MEDICAL_TYPES.includes(businessType)) return '/cafe/dashboard';
  return '/boutique/dashboard';
}

export function getBizColor(businessType: string): string {
  if (GYM_TYPES.includes(businessType)) return '#00b4d8';
  if (CAFE_TYPES.includes(businessType)) return '#22C55E';
  if (BOUTIQUE_TYPES.includes(businessType)) return '#3B82F6';
  if (HOTEL_TYPES.includes(businessType)) return '#F59E0B';
  if (RENTAL_TYPES.includes(businessType)) return '#8B5CF6';
  if (MEDICAL_TYPES.includes(businessType)) return '#EC4899';
  return '#00b4d8';
}

export function getDaysRemaining(endDate: string): number {
  return Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}
