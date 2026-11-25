export const siteConfig = {
  name: "Makeasytrips",
  tagline: "Travel that feels like yours.",
  description:
    "Makeasytrips is a learning-purpose travel experience for finding stays, planning holiday packages, and renting self-drive cars across India. Built with Next.js, TypeScript, and a local CSV data layer.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en_IN",
  currency: "INR",
  company: {
    legalName: "Makeasytrips",
    phones: [
      { label: "91777\u00a071607", href: "tel:+919177771607" },
      { label: "91777\u00a071803", href: "tel:+919177771803" },
    ],
    address: {
      lines: ["Plot No 4, Badangpet, Nadurgul", "Near MVSR College Road", "Hyderabad 501510"],
      locality: "Hyderabad",
      region: "Telangana",
      postalCode: "501510",
      country: "IN",
    },
  },
  navigation: [
    { label: "Hotels", href: "/hotels", icon: "bed" },
    { label: "Holidays", href: "/holidays", icon: "palmtree" },
    { label: "Rent a car", href: "/rent-a-car", icon: "car" },
    { label: "Events", href: "/events", icon: "calendar" },
    { label: "Offers", href: "/offers", icon: "tag" },
  ],
  utilityNavigation: [{ label: "List your property", href: "/info/list-your-property" }],
  footer: {
    explore: [
      { label: "Hotels", href: "/hotels" },
      { label: "Holiday packages", href: "/holidays" },
      { label: "Rent a car", href: "/rent-a-car" },
      { label: "Events in Goa", href: "/events" },
      { label: "Offers", href: "/offers" },
    ],
    company: [
      { label: "About Makeasytrips", href: "/info/about" },
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
