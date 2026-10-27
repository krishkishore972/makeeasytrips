import type { HolidayTheme } from "@/lib/search-options";

export type HomeFaq = {
  question: string;
  answer: string;
};

/**
 * Original editorial copy for the home page. Kept out of the page component so
 * the same answers can be reused by a future help centre without duplication.
 */
export const HOME_FAQS: HomeFaq[] = [
  {
    question: "Is TripNest a real booking site?",
    answer:
      "No. TripNest is an original, learning-purpose travel experience. The catalogue, prices, and offers are demo content, and there is no payment, account, or inventory behind any of it. Nothing you do here reserves a real seat or room.",
  },
  {
    question: "Do the prices include taxes and fees?",
    answer:
      "Where a demo total is shown, it includes the taxes modelled for that product. Flight fares show the fare and tax split, stays add the property tax percentage, and holiday packages add a flat 5% demo tax. These are illustrative numbers, not live supplier quotes.",
  },
  {
    question: "Can I change or cancel something I found?",
    answer:
      "There is nothing to change yet. Cancellation rules are shown on flight, stay, and holiday pages so you can compare them, but the booking flow itself arrives in a later phase. No real reservation or payment is created.",
  },
  {
    question: "Why are the airlines, hotels, and packages unfamiliar?",
    answer:
      "Every name in the catalogue is fictional and written for this project. Using original airlines, stays, and itineraries keeps the demo free of real brand assets and copyrighted marketing copy while still exercising the same layouts and flows.",
  },
  {
    question: "Where does the catalogue data come from?",
    answer:
      "The catalogue lives in CSV files inside the repository. A typed data layer parses each file once, validates every row, and shares the cached result with pages and JSON APIs. There is no third-party travel API and no database.",
  },
  {
    question: "Should I book a package or build the trip myself?",
    answer:
      "A package is easier when you want the itinerary, transfers, and a few meals handled together. Building it yourself is better when dates are fixed or you want a specific stay. Both routes use the same catalogue, so you can compare the honest details side by side.",
  },
];

export type TravelNote = {
  title: string;
  excerpt: string;
  theme: HolidayTheme;
  href: string;
  image: string;
  readTime: string;
};

export const TRAVEL_NOTES: TravelNote[] = [
  {
    title: "The three-night rule",
    excerpt:
      "A short trip can still feel unhurried. Leave the second day completely open and let the place set the pace.",
    theme: "wellness",
    href: "/holidays?theme=wellness",
    image: "/images/holidays/backwaters.svg",
    readTime: "4 min read",
  },
  {
    title: "Packing for thin air",
    excerpt:
      "Layers beat luggage. A mountain week is mostly about what you can add or remove before the afternoon wind arrives.",
    theme: "mountains",
    href: "/holidays?theme=mountains",
    image: "/images/holidays/mountains.svg",
    readTime: "5 min read",
  },
  {
    title: "A city, read on foot",
    excerpt:
      "Pick one neighbourhood, choose a single landmark, and let the streets between them do the rest of the storytelling.",
    theme: "city",
    href: "/holidays?theme=city",
    image: "/images/holidays/city.svg",
    readTime: "3 min read",
  },
];
