# Paulina's Portfolio

Personal portfolio of **Paulina Szatanik-Wierzynski**, Lead Product Designer — https://uxpaulina.online

A hand-maintainable static site (plain HTML/CSS/JS, no build step), rebuilt from the original Framer site.

## Structure

```
index.html                        Homepage
contact/index.html                Contact page (form via formsubmit.co)
design-system-automation/         Case study: AI-Ready Design System
saveris/                          Case study: Smart Connect
foodsafety/                       Case study: Food safety mobile app
404.html                          Not-found page (GitHub Pages picks this up)
css/style.css                     All styles — design tokens at the top
js/main.js                        Berlin clock, hero dot spiral, text reveal
assets/images/                    All images (descriptive names)
assets/video/                     Case study & gallery videos
assets/fonts/                     Space Grotesk (300/500/700)
assets/resume.pdf                 Downloadable resume
```

## Editing

- **Text**: edit the HTML files directly — all copy lives there.
- **Colors & type**: change the CSS variables at the top of `css/style.css`.
- **Images**: replace files in `assets/images/` (keep the same filename) or add
  new ones and update the `<img src>` in the HTML.
- **Resume**: replace `assets/resume.pdf`.

## Previewing locally

Any static server works, e.g.:

```
python3 -m http.server 8000
```

then open http://localhost:8000

## Deploying

The site is plain static files — it works on GitHub Pages (Settings → Pages →
deploy from `main` branch), Netlify, Vercel, or any web host.

Note for the contact form: the first submission from the live site sends a
one-time confirmation email to paulina8szatanik@gmail.com (formsubmit.co).
Confirm it once and the form is active.
