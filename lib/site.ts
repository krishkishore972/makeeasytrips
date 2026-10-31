export const siteConfig = {
  name: "TripNest",
  tagline: "Travel that feels like yours.",
  description:
    "TripNest is a learning-purpose travel experience for finding stays, planning holiday packages, and renting self-drive cars across India. Built with Next.js, TypeScript, and a local CSV data layer.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en_IN",
  currency: "INR",
  navigation: [
    { label: "Hotels", href: "/hotels", icon: "bed" },
    { label: "Holidays", href: "/holidays", icon: "palmtree" },
    { label: "Rent a car", href: "/rent-a-car", icon: "car" },
    { label: "Offers", href: "/offers", icon: "tag" },
  ],
  utilityNavigation: [
    { label: "List your property", href: "/info/list-your-property" },
    { label: "My trips", href: "/my-trips" },
    { label: "Wishlist", href: "/wishlist" },
  ],
  footer: {
    explore: [
      { label: "Hotels", href: "/hotels" },
      { label: "Holiday packages", href: "/holidays" },
      { label: "Rent a car", href: "/rent-a-car" },
      { label: "Offers", href: "/offers" },
    ],
    company: [
      { label: "About TripNest", href: "/info/about" },
      { label: "How it works", href: "/info/how-it-works" },
      { label: "Careers", href: "/info/careers" },
      { label: "Press", href: "/info/press" },
      { label: "Sustainability", href: "/info/sustainability" },
    ],
    support: [
      { label: "Help centre", href: "/info/help" },
      { label: "Cancellation guide", href: "/info/cancellations" },
      { label: "Contact us", href: "/info/contact" },
      { label: "Accessibility", href: "/info/accessibility" },
    ],
    legal: [
      { label: "Privacy", href: "/info/privacy" },
      { label: "Terms", href: "/info/terms" },
      { label: "Cookies", href: "/info/cookies" },
      { label: "Demo disclaimer", href: "/info/disclaimer" },
    ],
  },
  social: [
    { label: "Instagram", href: "https://instagram.com", icon: "instagram" },
    { label: "X", href: "https://x.com", icon: "x" },
    { label: "LinkedIn", href: "https://linkedin.com", icon: "linkedin" },
    { label: "YouTube", href: "https://youtube.com", icon: "youtube" },
  ],
} as const;

export type SiteNavigationItem = (typeof siteConfig.navigation)[number];
