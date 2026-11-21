# Events reference and implementation

## Reference evidence

REA inspected `https://www.district.in/events/` using a controlled Chromium
navigation on 2026-11-21. Evidence:
`ev_cceda139e69b6bb60d876bfd14bbb6dc6fd58f1327b8f0689534632aab488bbe`.

Observed in the captured DOM and accessibility tree:

- A featured-events area with event artwork, date, title, venue, and a ticket CTA.
- Category browsing and an all-events card grid.
- Event cards link to event-specific detail routes.

This was a single initial-page capture, not a full investigation of District's
checkout, filtering implementation, or backend. No District content, artwork,
APIs, or ticketing integrations are used by this website.

## Adaptation

- `/events` lists admin-created events and supports category and text filtering.
- `/events/[slug]` shows the event photos and details.
- Events are organised in **Goa only**; location is fixed to Goa in validation.
- `/admin/events` uses the existing authenticated catalogue create/edit/delete flow.
- Event images use the existing signed upload endpoint and photo limits.
- Enquiries reuse the existing name/phone dialog, durable enquiry record, and
  prefilled WhatsApp hand-off. Optional enquiry details allow customers to include
  dates, guest counts, and requirements.
- There is no ticket purchase, booking review, confirmation, or payment flow.
- No events are fabricated or automatically imported. Until an admin adds one,
  the public page offers a general Goa-event planning enquiry.
