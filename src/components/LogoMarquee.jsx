import { Utensils, Scissors, Wrench, Home, ShoppingBag, Car, Stethoscope, GraduationCap } from 'lucide-react';

const items = [
  { icon: Utensils, label: 'Restaurants' },
  { icon: Scissors, label: 'Salons' },
  { icon: Wrench, label: 'Garages' },
  { icon: Home, label: 'Immobilier' },
  { icon: ShoppingBag, label: 'Commerces' },
  { icon: Car, label: 'Auto' },
  { icon: Stethoscope, label: 'Santé' },
  { icon: GraduationCap, label: 'Formation' },
];

const doubled = [...items, ...items];

export default function LogoMarquee() {
  return (
    <div className="bg-white border-y border-violet-100 py-5 overflow-hidden">
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-1 min-w-[80px]">
            <item.icon className="w-7 h-7 text-violet-600" />
            <span className="text-xs text-gray-400">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
