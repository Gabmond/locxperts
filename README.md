# LocxPert website

This is a static HTML, CSS, and vanilla JavaScript website. There is no build step or JavaScript framework.

## Run locally

Open `index.html` in a browser. The site can also be served from any static web host. DM Serif Display loads from Google Fonts; system serif fonts are used if it is unavailable.

## Add LocxPert photography

The project includes the LocxPert logo but no loc-care or portfolio photographs. Clearly labelled CSS image spaces are used so the pages contain no broken image links and no illustrative images are presented as client work.

To replace a space, add an approved photo under `assets/images/` and put an `<img>` inside the existing `<figure class="media-placeholder media-placeholder--landscape media-placeholder--photo">`. Use `assets/images/your-photo.jpg` from `index.html` or `../assets/images/your-photo.jpg` from files in `pages/`. Retain the appropriate portrait, landscape, or square aspect-ratio class. The `media-placeholder--photo` class hides the decorative placeholder strokes. Get permission before publishing identifiable client images.

## Booking flow

The booking form validates in the browser and opens a prefilled WhatsApp click-to-chat URL. The customer reviews and sends the message, attaches any selected photos manually, and waits for the loctician to confirm the final service, price, date, time, and location. This website does not upload selected files or save form submissions.

## Main files

- The six root HTML files (`index.html`, `services.html`, `gallery.html`, `about.html`, `booking.html`, and `contact.html`) are the active site pages.
- `styles/main.css` loads the root site's CSS in order: `token.css`, `base.css`, `components.css`, then `mediaquery.css`.
- `styles/README.md` explains what belongs in each stylesheet and documents the alternate page copy.
- `script/site.js` controls the mobile menu, copyright year, gallery interactions, booking handoff, and reduced-motion-aware page reveals. Each feature is grouped in its own section.
- `pages/` contains a separate older copy of the same pages. Those files use `styles/structured.css` and its own `structured-*` stylesheets; edit the root pages for the active website.
