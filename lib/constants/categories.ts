import {
  Beef, Stethoscope, Users, Wrench, Droplets,
  CircleDot, Syringe, Hammer, Zap, ShoppingCart, Bird, PiggyBank,
  Wand2, Home
} from 'lucide-react'

// Current active categories shown in the picker
export const DEFAULT_CATEGORIES = [
  { id: 'cat-4', name: 'Cattle Feed', name_si: 'ගව ආහාර', icon: 'Beef', color: '#a78bfa' },
  { id: 'cat-20', name: 'Poultry Feed', name_si: 'කුකුළු ආහාර', icon: 'Bird', color: '#fbbf24' },
  { id: 'cat-21', name: 'Pig Feed', name_si: 'ඌරු ආහාර', icon: 'PiggyBank', color: '#f472b6' },
  { id: 'cat-5', name: 'Veterinary & Medicine', name_si: 'පශු වෛද්‍ය සහ ඖෂධ', icon: 'Stethoscope', color: '#38bdf8' },
  { id: 'cat-13', name: 'Vaccination', name_si: 'එන්නත්', icon: 'Syringe', color: '#f472b6' },
  { id: 'cat-22', name: 'Bedding & Litter', name_si: 'ඇඳ සහ අපද්‍රව්‍ය', icon: 'Home', color: '#d97706' },
  { id: 'cat-23', name: 'Slaughter & Processing', name_si: 'ඝාතනය සහ සැකසීම', icon: 'Wand2', color: '#ef4444' },
  { id: 'cat-6', name: 'Labor', name_si: 'කම්කරු කුලිය', icon: 'Users', color: '#fb923c' },
  { id: 'cat-7', name: 'Equipment', name_si: 'උපකරණ', icon: 'Wrench', color: '#facc15' },
  { id: 'cat-14', name: 'Farm Maintenance', name_si: 'ගොවිපල නඩත්තුව', icon: 'Hammer', color: '#a8a29e' },
  { id: 'cat-15', name: 'Electricity', name_si: 'විදුලි', icon: 'Zap', color: '#eab308' },
  { id: 'cat-16', name: 'Water', name_si: 'ජල', icon: 'Droplets', color: '#60a5fa' },
  { id: 'cat-17', name: 'Livestock Purchase', name_si: 'පශු සම්පත් මිලදී ගැනීම', icon: 'ShoppingCart', color: '#14b8a6' },
  { id: 'cat-12', name: 'Other', name_si: 'වෙනත්', icon: 'CircleDot', color: '#94a3b8' },
]

// Legacy categories for backward compatibility (not shown in picker, but valid for past expenses)
export const LEGACY_CATEGORIES = [
  { id: 'cat-1', name: 'Seeds', name_si: 'බීජ', icon: 'Sprout', color: '#22c55e' },
  { id: 'cat-2', name: 'Fertilizer', name_si: 'පොහොර', icon: 'FlaskConical', color: '#84cc16' },
  { id: 'cat-3', name: 'Pesticides', name_si: 'කෘමිනාශක', icon: 'Bug', color: '#f97316' },
  { id: 'cat-8', name: 'Irrigation', name_si: 'වාරිමාර්ග', icon: 'Droplets', color: '#60a5fa' },
  { id: 'cat-9', name: 'Fuel', name_si: 'ඉන්ධන', icon: 'Truck', color: '#f43f5e' },
  { id: 'cat-10', name: 'Land & Lease', name_si: 'ඉඩම් සහ බදු', icon: 'MapPin', color: '#34d399' },
  { id: 'cat-11', name: 'Storage', name_si: 'ගබඩා', icon: 'Warehouse', color: '#c084fc' },
]

export const ALL_CATEGORIES = [...DEFAULT_CATEGORIES, ...LEGACY_CATEGORIES]

export const IconMap: Record<string, any> = {
  Beef, Stethoscope, Users, Wrench, Droplets, CircleDot,
  Syringe, Hammer, Zap, ShoppingCart, Bird, PiggyBank,
  Wand2, Home
}
