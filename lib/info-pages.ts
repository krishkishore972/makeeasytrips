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
    title: "About Makeasytrips",
    eyebrow: "The project",
    description:
      "Makeasytrips is an independent learning project that studies how a modern travel product is structured, then rebuilds those patterns with original design and copy.",
    sections: [
      {
        heading: "Why it exists",
        body: [
          "Travel planning is a good design problem: it combines search, comparison, trust, and a lot of small decisions. Makeasytrips is a place to practise those patterns end to end without copying a brand or pretending to sell real inventory.",
          "The build uses Next.js, TypeScript, Tailwind CSS, Motion, and a local CSV data layer. Every route, component, and line of copy is written for this project.",
        ],
      },
      {
        heading: "What it is not",
        body: [
          "Makeasytrips is not affiliated with, endorsed by, or connected to any travel company. It does not process payments, create accounts, or store personal information. Prices and inventory are fictional demo data.",
        ],
      },
    ],
  },
  "how-it-works": {
    title: "How Makeasytrips works",
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
          "Stays show location, breakfast, taxes, and check-in details. Holiday packages show what is included and what is not. Self-drive cars show transmission, fuel, seats, kilometre plans, and the refundable deposit.",
          "On a detail page, the enquiry form validates your name and phone number with Zod, saves the enquiry, and opens WhatsApp with the same details so you can send them on. No card is charged and no booking is created.",
        ],
      },
    ],
  },
  careers: {
    title: "Careers",
    eyebrow: "Work with us",
    description:
      "Makeasytrips is a solo learning project, so there are no open roles. This page is a placeholder for the kind of team the product would need.",
    sections: [
      {
        heading: "The team we would build",
        body: [
          "A small product team with a designer who cares about typography, an engineer who enjoys a clean data layer, and a trip designer who has actually missed a connecting train.",
          "The work would be India-first: stays, road trips, and packages shaped around how people here actually travel, including weekend breaks, family visits, and long-delayed honeymoons.",
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
          "Makeasytrips is a learning-purpose clone that studies travel-product structure, layout, and flows. It uses original branding, original copy, and local abstract illustrations.",
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
          "Fewer, longer trips can be better than a rushed checklist. A self-drive car can turn a transfer into part of the trip. Local stays and local guides keep more value in the place you are visiting.",
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
          "Search fields submit a query to the stays, holidays, or rent-a-car route, and the filters and results all live in the URL. Choosing a rate, package, or car opens an enquiry form. Sending it saves the enquiry and opens WhatsApp with the same details; there is no account, payment, or saved trip.",
          "The sign-in dialog is intentionally non-functional and stores nothing. The newsletter saves only your email address, and the contact page saves the message you write so the team can reply.",
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
      "How cancellation information is shown in the demo, and what a real booking flow would need. No live bookings are handled.",
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
          "Cancellation rules are shown on each fare, rate, package, and car page. The enquiry form saves the item you were viewing and its context, so a reply can refer to the same rules. No reservation exists, so there is nothing to cancel and no refund to process.",
        ],
      },
    ],
  },
  contact: {
    title: "Contact us",
    eyebrow: "Say hello",
    description:
      "Send a message and it is saved for the Makeasytrips team. Enquiries from service pages are saved too, with the item you were looking at.",
    sections: [
      {
        heading: "Trip questions",
        body: [
          "Use the form below to tell us what you are planning. Your name, email address, optional phone number, and message are stored so the team can follow up.",
          "Service pages also save an enquiry when you request a quote on WhatsApp. That record includes the selected flight, stay, holiday, or car so the reply can pick up where you left off.",
        ],
      },
      {
        heading: "What we store",
        body: [
          "Contact messages, service enquiries, and newsletter sign-ups are written to the project database. No payment details, passwords, or identity documents are collected.",
          "This is still a learning project, so replies are not guaranteed and no message triggers an automated email.",
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
      "Makeasytrips stores the contact details you choose to send so enquiries and the newsletter can work. There are no accounts, payments, analytics, or advertising trackers.",
    sections: [
      {
        heading: "What is collected",
        body: [
          "Service enquiries save your name, phone number, the item you were viewing, and any details shown in the enquiry. Contact messages save your name, email address, optional phone number, and message. Newsletter sign-ups save your email address.",
          "The travel catalogue is stored in MongoDB and was loaded from the project's authored fixtures. Search and filter state lives in the URL so it can be shared or refreshed.",
        ],
      },
      {
        heading: "How it is used",
        body: [
          "Contact details are used only to reply to your enquiry or to send the newsletter you asked for. They are not sold, shared with advertisers, or used for profiling.",
          "There is no automated email sender in this learning project, so a saved enquiry or message does not trigger an email by itself. The team reads submissions from the database.",
        ],
      },
      {
        heading: "What is not collected",
        body: [
          "No passwords, accounts, payment details, identity documents, or precise location data are collected. The sign-in dialog is a non-functional demo and stores nothing.",
          "The site sets no advertising, analytics, or preference cookies. Standard request logs may be kept by the hosting provider, which is outside the application's control.",
        ],
      },
      {
        heading: "Removing your details",
        body: [
          "Send a message from the contact page and ask for your enquiry, contact message, or newsletter email to be deleted. Because there are no accounts, include the phone number or email address you used so the right record can be found.",
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
          "Makeasytrips is provided as-is for learning and portfolio review. Prices, availability, ratings, and offers are fictional. Nothing on the site constitutes a real travel offer or a promise of service.",
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
      "Makeasytrips is an independent learning project. It is not a travel agency and is not affiliated with any travel brand.",
    sections: [
      {
        heading: "No real bookings",
        body: [
          "Every hotel, holiday package, car listing, price, rating, and offer in this project is fictional demo data. No booking is created, no payment is taken, and no supplier is contacted.",
          "Enquiries and contact messages are real records in the project database so the team can reply. They are not bookings, and they do not hold inventory or charge anything.",
        ],
      },
      {
        heading: "Original work",
        body: [
          "Makeasytrips uses original branding, copy, and local abstract illustrations. It does not include third-party logos, photography, or copyrighted marketing text. The project studies structure, layout, and interaction patterns only.",
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
