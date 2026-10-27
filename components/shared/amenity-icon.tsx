import {
  BellRing,
  CarFront,
  Check,
  Coffee,
  CookingPot,
  Dumbbell,
  Laptop,
  ParkingCircle,
  PawPrint,
  Shirt,
  Sparkles,
  Sun,
  Umbrella,
  UtensilsCrossed,
  Waves,
  Wifi,
  Wine,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const amenityIcons: Record<string, LucideIcon> = {
  wifi: Wifi,
  breakfast: Coffee,
  pool: Waves,
  spa: Sparkles,
  gym: Dumbbell,
  restaurant: UtensilsCrossed,
  bar: Wine,
  "airport-shuttle": CarFront,
  parking: ParkingCircle,
  "pet-friendly": PawPrint,
  workspace: Laptop,
  laundry: Shirt,
  "room-service": BellRing,
  "beach-access": Umbrella,
  kitchenette: CookingPot,
  terrace: Sun,
};

type AmenityIconProps = {
  amenity: string;
  className?: string;
};

export function AmenityIcon({ amenity, className }: AmenityIconProps) {
  const Icon = amenityIcons[amenity] ?? Check;
  return <Icon aria-hidden="true" className={cn("size-4", className)} />;
}
