# Final Prompt: Seven Continents Travel & Tours Website

> Save this file in the project root (for example as `PROMPT.md` or `AGENTS.md`). Follow it exactly and work in the stages described at the end.

## Role

You are a senior front-end developer and designer. Build a **premium, modern website** for **Seven Continents Travel & Tours**, a Manila-based travel agency, replacing their 2016 site. It must feel like a boutique travel brand, not a template, while staying true to the agency's existing identity.

---

## Tech Constraints

- Static site: **plain HTML, CSS, and vanilla JavaScript**.
- **Do not use React, Vue, Next.js, or any framework.** No build step. No booking system.
- Tailwind via CDN is allowed during development. Keep class usage tidy.
- File structure:
  - `index.html`
  - `gallery.html`
  - `css/`
  - `js/main.js`
  - `images/` (already populated with the photos and logo)
  - `references/` (screenshots of the old site, read-only reference)
- The header and footer must be **identical** on both pages.
- Do not modify or delete anything inside `images/` or `references/`.

---

## Step 0: Inspect Before Building

Before writing any code:

1. List everything in `images/` and `references/`.
2. Report what you found, grouped by use: logo, banners/hero candidates, gallery photos by region, client photos, old icons, other.
3. Tell me which files you plan to use for which section.
4. Flag any image that is too small or low-resolution for its intended use (for example the logo), with its pixel dimensions.
5. Wait for my confirmation before continuing.

**Never invent, hotlink, or download images.** Use only what is in `images/`.

---

## Old Site Reference

Screenshots of the current 2016 website are in `references/` (home page, gallery page, and possibly contact page).

Use them **only** for:

- section order and content
- brand identity (logo, blue/green palette, tagline)
- which photos exist and where they were used

Do **not** reproduce:

- the flat orange bands or the geometric pattern backgrounds
- thin light-gray text or white text on orange
- the six stacked carousels on the old gallery page
- the small, low-quality client snapshots as they are
- the contact details shown in the screenshots (they conflict between pages and are outdated). Use the placeholders below instead.

The new design should feel like a premium upgrade of this brand, not a copy of it. Do not use the screenshots as image sources.

---

## Brand

| Item | Value |
|---|---|
| Logo | Use the largest version in `images/` (blue and green globes; "SEVEN" in blue, "CONTINENTS" in green, "TRAVEL & TOURS" in gray) |
| Primary blue | `#3189C9` |
| Secondary green | `#2BAA3B` |
| Accent orange | `#F5A800` (buttons only) |
| Deep navy | `#0F2A43` (footer and one feature section) |
| Text | `#333333` |
| Soft background | `#F4F8FB` |
| Headings font | Playfair Display (Google Fonts) |
| Body font | Inter (Google Fonts) |
| Tagline | "Your Personal Travel Partners" |
| Tone | Warm, trustworthy, personal |

Define the colors as CSS variables:

    :root {
      --blue: #3189C9;
      --green: #2BAA3B;
      --orange: #F5A800;
      --navy: #0F2A43;
      --text: #333333;
      --bg-soft: #F4F8FB;
    }

---

## Design Direction

- Premium and editorial: large type, generous whitespace, max text width about 65 characters.
- Rounded cards (12-16px), soft shadows, smooth hover lifts.
- Subtle motion only:
  - fade-up on scroll (IntersectionObserver)
  - slow zoom on the hero image
  - no auto-playing carousels, no heavy animation libraries
- Sticky header that becomes translucent and blurred on scroll. Hamburger menu on mobile.
- **High-contrast text everywhere.** No thin light-gray text. No white text on orange.
- Mobile-first and fully responsive.
- Orange is used only for primary buttons. Blue and green carry the brand.
- Consistent image aspect ratios and a consistent look across all photos.

---

## Icons

- Use **Lucide icons only**, as inline SVG. No icon fonts, no external image files, no icons copied from the old site.
- One consistent stroke width (1.5).
- Brand blue on light backgrounds, white on dark backgrounds.
- Mark decorative icons `aria-hidden="true"`.

| Service | Icon |
|---|---|
| Air, Sea and Land Travel Reservations | suitcase |
| Hotel Bookings | bed |
| Ticketing/E-Tickets | ticket |
| Travel Documentation Services | file-text |
| Ground Transportation (Car/Bus Rentals, Train Tickets) | car |
| Domestic Flights/Packaged Tours | plane |
| Foreign Tours/Land Arrangements | globe |
| Travel Insurance | shield-check |

---

## Page 1: `index.html`

Sections, in order:

1. **Header:** logo, nav (About, Mission & Vision, Values, Services, Gallery, Contact), orange "Inquire Now" button linking to `#inquire`.
2. **Hero:** full-width travel image (choose the strongest from `images/`), dark gradient overlay, headline "Your Personal Travel Partners", one short supporting line, "Inquire Now" button.
3. **About:** two short paragraphs (text in the Content section).
4. **Mission and Vision:** compact cards, not walls of text.
5. **Core Values and Core Competencies:** clean icon cards.
6. **Services:** 8 cards, each with an icon, title, and one-line description. Hover effect.
7. **Gallery preview:** the 6 best photos in a uniform grid, with a "View Full Gallery" link to `gallery.html`.
8. **Happy Travelers:** only if suitable client photos exist. Otherwise skip and tell me. **Never invent testimonials.**
9. **Inquiry section** (`id="inquire"`): form on one side, contact details and map on the other.
10. **Footer:** logo, quick links, contact info, social links, "© 2026 Seven Continents Travel & Tours".

---

## Page 2: `gallery.html`

- Same header and footer as the home page.
- Page title with intro line: "Experience the wonder of an exceptional itinerary created just for you."
- **Filter tabs:** All, Philippines, Asia, Africa & Antarctica, Americas, Australia, Europe.
- Responsive photo grid with a consistent aspect ratio and lazy loading.
- Keyboard-accessible **lightbox**: next, previous, close button, Esc to close.
- This replaces the old six carousels.
- Correct the old spelling error "Antartica" to "Antarctica".
- Bottom call to action: "Want your own tailor-made package?" with a button linking to the inquiry section.
- If a photo does not clearly belong to a region, ask me before categorizing it.

---

## Inquiry Form

- Fields: full name, email, mobile number, destination, preferred travel dates, number of travelers, message.
- Submit through **Web3Forms** using the placeholder access key `YOUR_WEB3FORMS_KEY`.
- Include a hidden honeypot field for spam.
- Client-side validation, clear focus states, and success/error messages shown on the page without leaving it.
- **No payment, no booking engine.**

---

## Contact Details (placeholders until the owner confirms)

Leave these clearly marked. Do not copy any details from the old-site screenshots.

- Address: `TODO_CONFIRM`
- Phone: `TODO_CONFIRM`
- Email: `TODO_CONFIRM`
- Office hours: Monday to Friday, 9:00 a.m. to 5:00 p.m.
- Facebook: `TODO_CONFIRM`
- Instagram: `TODO_CONFIRM`
- Map: add a clearly commented placeholder for a Google Maps embed until the address is confirmed.

---

## Content

Keep the owner's wording. **Do not invent claims, services, awards, or statistics.**

### About

Seven Continents Travel and Tours (SCTT) is formed out of passion for travel and customer service. The desire of the owners to provide affordable, well-planned and efficient tour packages and travel arrangements is backed up with their experience in the hotel, cruise, travel and tours sales and operations proven by their vast experience in the travel and hospitality industry.

SCTT's partnership with the leading players in the industry - airlines, hotels, F&B providers, tour operators, transport service providers and travel insurance companies, has given the company the edge to provide their customers with competitively priced, quality products.

### Mission

1. To provide our customers with reliable, competitive and quality products and services carried with utmost care for the interest and satisfaction of our customers.
2. To carry out business in a strategic and professional manner which will serve the financial, ethics and social interests of our business partners and stakeholders.
3. To aim for process improvements to make sure that our business operations is at par, if not above the key players in the industry.

### Vision

We are the travel solutions provider chosen by top corporations, institutions and individuals; a business partner preferred by top players in the industry, and the fastest growing entity in the field of travel and tourism industry.

### Core Values

- **Passion:** We do what we do with commitment.
- **Collaboration:** We maintain sustainable and mutually beneficial business partnerships.
- **Integrity:** We mean what we promise, and do it.
- **Reliability:** We provide personalized service from beginning till your next transactions.
- **Quality:** We provide products customized to fit your needs, ensuring that quality is not compromised.

### Core Competencies

- **Business Knowledge:** With vast experience in the hospitality and travel industry, SCTT is abreast with the best practices in the industry to keep them in the lead.
- **Ingenuity:** The owners' exposure to travel experiences to many different destinations give them the edge to customize travel arrangements for their clients and come up with creative solutions to their needs.

### Services

Air, Sea and Land Travel Reservations; Hotel Bookings; Ticketing/E-Tickets; Travel Documentation Services; Ground Transportation (Car/Bus Rentals, Train Tickets); Domestic Flights/Packaged Tours; Foreign Tours/Land Arrangements; Travel Insurance.

You may write a short, simple, factual one-line description for each service card. **List them for my approval** before finalizing.

---

## Quality Requirements

- Semantic HTML, proper heading hierarchy, alt text on every image, visible keyboard focus.
- Meta description, Open Graph tags, favicon (use the logo globes), and a social preview image reference.
- Lazy-load images below the fold. Use `width` and `height` attributes to prevent layout shift.
- Never stretch a low-resolution image. Tell me instead.
- No console errors.
- Test layouts at 360px, 768px, and 1280px.

---

## Process

Work in stages. **Stop after each stage** and summarize what you did, so I can review it in the browser before you continue.

1. **Step 0:** inspect `images/` and `references/`, report, and wait for my confirmation.
2. **Stage 1:** file structure, CSS variables, fonts, header, footer.
3. **Stage 2:** hero, About, Mission/Vision, Values, Services.
4. **Stage 3:** gallery preview, plus `gallery.html` with filters and lightbox.
5. **Stage 4:** inquiry form and contact section.
6. **Stage 5:** polish, accessibility, and performance pass.

**Ask me before making any assumption** about content, images, or contact details. Do not change copy beyond what is listed above without asking. Commit-friendly changes only: do not refactor completed stages unless I ask.