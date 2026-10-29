# LocxPert styles

The root website pages (`index.html`, `services.html`, `gallery.html`, `about.html`, `booking.html`, and `contact.html`) use `main.css`. Its imports follow the same editing pattern as the challenge projects:

1. `token.css` — brand colours, typography, spacing, layout, and motion variables. Change shared design values here.
2. `base.css` — reset, global typography, page backgrounds, and shared section defaults.
3. `components.css` — buttons, navigation, image frames, page sections, forms, and footer.
4. `mediaquery.css` — responsive changes, mobile first, at tablet and desktop widths.

The active site follows the LocxPert identity with near-black surfaces, warm metallic gold accents, and light text. Primary buttons use a gold gradient; shared tokens define the palette and matching glow shadows. The `--color-orange*` names remain for existing selectors, but their values now use the gold palette.

`script/site.js` keeps each interactive feature in its own section and skips pages that do not contain the relevant elements.

## Alternate page copy

The files under `pages/` are a separate, older copy with different HTML classes and visual styles. They load `structured.css`, which imports `structured-tokens.css`, `structured-base.css`, `structured-components.css`, and `structured-mediaquery.css`. Keep those styles separate from the root site styles; the class names and tokens are different.
