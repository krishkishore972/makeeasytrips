export type InfoSection = {
  heading: string;
  body: readonly string[];
};

export type InfoPageContent = {
  title: string;
  eyebrow: string;
  description: string;
  sections: readonly InfoSection[];
};

/**
 * Static editorial content for the footer and utility links. Everything here is
 * original copy for the learning project, not copied marketing text.
 */
export const infoPages = {
  about: {
    title: "About TripNest",
    eyebrow: "The project",
    description:
      "TripNest is an independent learning project that studies how a modern travel product is structured, then rebuilds those patterns with original design and copy.",
    sections: [
      {
        heading: "Why it exists",
        body: [
          "Travel planning is a good design problem: it combines search, comparison, trust, and a lot of small decisions. TripNest is a place to practise those patterns end to end without copying a brand or pretending to sell real inventory.",
          "The build uses Next.js, TypeScript, Tailwind CSS, Motion, and a local CSV data layer. Every route, component, and line of copy is written for this project.",
        ],
      },
      {
        heading: "What it is not",
        body: [
          "TripNest is not affiliated with, endorsed by, or connected to any travel company. It does not process payments, create accounts, or store personal information. Prices and inventory are fictional demo data.",
        ],
      },
    ],
  },
  "how-it-works": {
    title: "How TripNest works",
    eyebrow: "The approach",
    description:
      "A calmer planning flow: start with a feeling, compare the details that matter, and keep the plan together.",
    sections: [
      {
        heading: "Start with a shape, not a spreadsheet",
        body: [
          "You can begin with a city, a date, or a mood. The search surfaces a focused set of options instead of an endless wall of results. Filters are there to narrow the list, not to become the main event.",
          "On results pages, the search summary stays visible and every filter lives in the URL. That means a search can be refreshed, shared, or returned to without losing context.",
        ],
      },
      {
        heading: "Show the honest details",
        body: [
          "Fares show baggage, cancellation rules, and total time. Stays show location, breakfast, taxes, and check-in details. Holiday packages show what is included and what is not.",
          "The checkout is a mock review step. It validates the form with Zod, shows a clear price summary, and then lands on a confirmation page. No card is charged and no personal data is persisted.",
        ],
      },
    ],
  },
  careers: {
    title: "Careers",
    eyebrow: "Work with us",
    description:
      "TripNest is a solo learning project, so there are no open roles. This page is a placeholder for the kind of team the product would need.",
    sections: [
      {
        heading: "The team we would build",
        body: [
          "A small product team with a designer who cares about typography, an engineer who enjoys a clean data layer, and a trip designer who has actually missed a connecting train.",
          "The work would be India-first: routes, stays, and packages shaped around how people here actually travel, including weekend breaks, family visits, and long-delayed honeymoons.",
        ],
      },
      {
        heading: "A note on this page",
        body: [
          "No applications are collected. There is no hiring pipeline behind this route. It exists so the navigation and page templates are complete for the learning build.",
        ],
      },
    ],
  },
  press: {
    title: "Press",
    eyebrow: "Media",
    description:
      "A placeholder press room for a project that is still being built. There are no press releases or media assets to download.",
    sections: [
      {
        heading: "About the build",
        body: [
          "TripNest is a learning-purpose clone that studies travel-product structure, layout, and flows. It uses original branding, original copy, and local abstract illustrations.",
          "The project deliberately avoids third-party logos, photography, and copyrighted text. The footer carries a standing disclaimer for readers who arrive without context.",
        ],
      },
      {
        heading: "Media contact",
        body: [
          "There is no press contact for this demo. If you are reviewing the project, start with the About and Disclaimer pages.",
        ],
      },
    ],
  },
  sustainability: {
    title: "Sustainability",
    eyebrow: "Travel with care",
    description:
      "A placeholder for the principles a travel product should hold itself to. No certifications or claims are being made here.",
    sections: [
      {
        heading: "The principles",
        body: [
          "Fewer, longer trips can be better than a rushed checklist. Trains deserve a fair look. Local stays and local guides keep more value in the place you are visiting.",
          "A real product would need measurable standards, honest labels, and a way to verify them. This demo does not claim any of that yet.",
        ],
      },
      {
        heading: "What comes next",
        body: [
          "When the holiday catalogue is built, each package can carry a simple transport and stay note so travellers can compare the shape of a trip, not just the price.",
        ],
      },
    ],
  },
  help: {
    title: "Help centre",
    eyebrow: "Support",
    description:
      "Short answers for the demo. If something looks unfinished, it probably is: this project is being built in phases.",
    sections: [
      {
        heading: "Using the demo",
        body: [
          "Search fields on the home page submit a query to the flights route. In Phase 1 that route confirms the query is in the URL; the result list, filters, and booking flow arrive in later phases.",
          "The sign-in and newsletter forms are intentionally non-functional. They show the interaction pattern and then explain that nothing was sent or stored.",
        ],
      },
      {
        heading: "Something is broken",
        body: [
          "Use the error page’s retry button to re-render the segment. If the problem repeats, check the browser console and the terminal running the development server. There is no support inbox for this project.",
        ],
      },
    ],
  },
  cancellations: {
    title: "Cancellation guide",
    eyebrow: "Before you book",
    description:
      "How cancellation information is meant to be shown once real booking flows exist. No live bookings are handled in this demo.",
    sections: [
      {
        heading: "What the product should show",
        body: [
          "Every fare and room should state its cancellation window, the fee, and the refund timeline before checkout. The rules should be visible on the result card, not buried in a modal.",
          "Where a supplier offers a flexible option, the price difference should be clear. A cheap fare that cannot change is not cheap if the plan is uncertain.",
        ],
      },
      {
        heading: "In this demo",
        body: [
          "There are no bookings to cancel. The cancellation content is a design placeholder for the review and confirmation steps.",
        ],
      },
    ],
  },
  "payment-security": {
    title: "Payment security",
    eyebrow: "Trust",
    description:
      "TripNest does not process payments. This page explains the mock checkout boundary and what a real implementation would need.",
    sections: [
      {
        heading: "The demo boundary",
        body: [
          "The review step collects traveller details only to demonstrate form structure and validation. It does not send them to a server, store them in a database, or pass them to a payment provider.",
          "The confirmation page is generated from local demo data. No card number, UPI ID, or bank detail is ever requested.",
        ],
      },
      {
        heading: "What a real build needs",
        body: [
          "A PCI-compliant payment provider, server-side price recalculation, idempotent booking creation, fraud checks, and a clear refund policy. None of those are in scope for this learning project.",
        ],
      },
    ],
  },
  contact: {
    title: "Contact us",
    eyebrow: "Say hello",
    description:
      "There is no support inbox for this learning project, but here is where a real conversation would start.",
    sections: [
      {
        heading: "Trip questions",
        body: [
          "A real TripNest would offer a short callback window, a written summary of the conversation, and a human who can explain the trade-offs between two options.",
          "This demo does not collect contact details. The sign-in dialog and newsletter form both stop short of sending anything.",
        ],
      },
      {
        heading: "Project feedback",
        body: [
          "If you are reviewing the build, the most useful feedback is about structure, accessibility, and whether the flows feel coherent. The REA notes in the repository document what was observed and what was inferred.",
        ],
      },
    ],
  },
  accessibility: {
    title: "Accessibility",
    eyebrow: "For everyone",
    description:
      "Accessibility is treated as part of the build, not a cleanup pass. This page records the current intentions and known gaps.",
    sections: [
      {
        heading: "What is in place",
        body: [
          "The layout uses semantic landmarks, a skip link, visible focus styles, labelled form fields, and reduced-motion handling. Motion is limited to transform and opacity, and scroll reveals run once.",
          "Dialogs use Radix primitives for focus trapping and Escape handling. Interactive targets aim for a 44px minimum on touch screens.",
        ],
      },
      {
        heading: "Known gaps",
        body: [
          "The demo has not been through a full screen-reader audit. Calendar, filter drawer, and result-card interactions do not exist yet, so their accessibility will be reviewed as those phases are built.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy",
    eyebrow: "Your data",
    description:
      "TripNest is a local learning project with no accounts, no database, and no analytics. There is very little to collect.",
    sections: [
      {
        heading: "What is collected",
        body: [
          "Nothing is persisted by the application. Form submissions in the demo are handled in the browser and discarded. Search state lives in the URL so it can be shared or refreshed.",
          "The site may be served by a hosting provider that keeps standard request logs. That is outside the application’s control and outside the scope of this demo.",
        ],
      },
      {
        heading: "What is not collected",
        body: [
          "No names, email addresses, phone numbers, payment details, or account credentials are stored. The newsletter and sign-in forms explicitly stop before sending anything.",
        ],
      },
    ],
  },
  terms: {
    title: "Terms of use",
    eyebrow: "The fine print",
    description:
      "Plain-language terms for a learning project. This is not a commercial booking service.",
    sections: [
      {
        heading: "Demo use",
        body: [
          "TripNest is provided as-is for learning and portfolio review. Prices, availability, ratings, and offers are fictional. Nothing on the site constitutes a real travel offer or a promise of service.",
          "You may read the code and learn from it. Do not present the demo as a real travel agency or use it to collect payments or personal data.",
        ],
      },
      {
        heading: "No liability",
        body: [
          "The project is not liable for decisions made from demo content. Always confirm fares, cancellation rules, and travel requirements with a real provider before booking.",
        ],
      },
    ],
  },
  cookies: {
    title: "Cookies",
    eyebrow: "Browser storage",
    description:
      "The demo does not set advertising or analytics cookies. Any future storage should be explained here before it ships.",
    sections: [
      {
        heading: "Current state",
        body: [
          "The application does not write cookies for accounts, preferences, or tracking. Theme and motion preferences are read from the operating system at runtime.",
          "If a later phase adds a saved-search feature, it should use a clear, minimal storage mechanism and explain it on this page.",
        ],
      },
      {
        heading: "Third parties",
        body: [
          "Fonts are served through Next.js font optimization. There are no embedded advertising scripts or third-party analytics tags in the project.",
        ],
      },
    ],
  },
  disclaimer: {
    title: "Demo disclaimer",
    eyebrow: "Please read",
    description:
      "TripNest is an independent learning project. It is not a travel agency and is not affiliated with any travel brand.",
    sections: [
      {
        heading: "No real bookings",
        body: [
          "Every flight, hotel, holiday package, price, rating, and offer in this project is fictional demo data. No booking is created, no payment is taken, and no supplier is contacted.",
          "The checkout flow is a mock review and confirmation. It exists to demonstrate form structure, validation, and price summaries, not to transact.",
        ],
      },
      {
        heading: "Original work",
        body: [
          "TripNest uses original branding, copy, and local abstract illustrations. It does not include third-party logos, photography, or copyrighted marketing text. The project studies structure, layout, and interaction patterns only.",
        ],
      },
    ],
  },
  "list-your-property": {
    title: "List your property",
    eyebrow: "For hosts",
    description:
      "A placeholder for the host side of the marketplace. No listings are accepted and no property data is collected.",
    sections: [
      {
        heading: "What the flow would cover",
        body: [
          "A host would describe the property, set room types and seasonal pricing, choose cancellation rules, and upload a gallery. The listing would then go through a review before appearing in search.",
          "The guest side would show the same details in plain language: what is included, what is nearby, and what happens if plans change.",
        ],
      },
      {
        heading: "In this demo",
        body: [
          "There is no host dashboard or application form. The route exists to complete the utility navigation and to mark the future scope honestly.",
        ],
      },
    ],
  },
} satisfies Record<string, InfoPageContent>;

export type InfoPageSlug = keyof typeof infoPages;

export function isInfoPageSlug(slug: string): slug is InfoPageSlug {
  return Object.prototype.hasOwnProperty.call(infoPages, slug);
}

export const infoPageSlugs = Object.keys(infoPages) as InfoPageSlug[];

export const relatedInfoSlugs: InfoPageSlug[] = [
  "about",
  "how-it-works",
  "help",
  "privacy",
  "disclaimer",
];
