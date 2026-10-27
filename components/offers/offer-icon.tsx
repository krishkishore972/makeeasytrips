import {
  BedDouble,
  CalendarDays,
  CarFront,
  Gift,
  MapPin,
  Palmtree,
  Percent,
  Plane,
  Sparkles,
  Sun,
  Tag,
  TrainFront,
  type LucideIcon,
} from "lucide-react";
import type { OfferIcon as OfferIconName } from "@/lib/search-options";

const icons: Record<OfferIconName, LucideIcon> = {
  plane: Plane,
  bed: BedDouble,
  palmtree: Palmtree,
  train: TrainFront,
  car: CarFront,
  sparkles: Sparkles,
  tag: Tag,
  percent: Percent,
  gift: Gift,
  calendar: CalendarDays,
  sun: Sun,
  map: MapPin,
};

type OfferIconProps = {
  name: OfferIconName;
  className?: string;
};

export function OfferIcon({ name, className }: OfferIconProps) {
  const Icon = icons[name] ?? Tag;
  return <Icon aria-hidden="true" className={className} />;
}
