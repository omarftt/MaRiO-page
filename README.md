# MaRiO — project page

Project page for **MaRiO: Multi-agent Collaborative Reasoning via Shared Observations in MLLMs**
(NeurIPS 2026, Datasets & Benchmarks Track).

Live site (once published): https://omarftt.github.io/MaRiO-page/
Dataset: https://huggingface.co/datasets/mariobench2026/MaRiO

## Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

A static server is required: the example explorer is built in JavaScript from `static/data/*.json` via `fetch`, which does not work
from a `file://` URL.

## Layout

```
index.html
static/
  css/   bulma.min.css · index.css · mario.css   (mario.css is the only custom sheet)
  js/    mario.js
  data/  examples.json
  images/figures/  figures cropped from the PDF at 600 dpi (webp + jpg/png fallback)
        /tables/   the paper's own tables, cropped at 600 dpi
        /tasks/    benchmark sample observations for the explorer
        /logos/
```

Results tables are images cropped from the paper rather than hand-written HTML,
matching the SignRR page. Button icons are inline SVG, so there is no icon bundle.

`mario.js` builds one widget, the example explorer in the Benchmark section. It
reads `static/data/examples.json`, which holds ten real benchmark items with the
real predictions of four models on them. Five come from the real-world sources
(four RealEstate10K, one NAVI) and five from the simulators, so both halves of
the benchmark are represented; each item carries a `source` field that the
widget shows as a chip.

## What is quoted and what is written

The abstract is the paper's, word for word, with the one tracked-change
revision applied (the struck-out clause about spatial versus geometric tasks is
dropped in favour of the static-perception wording). The three table captions
are the paper's captions, and the teaser caption leads with the paper's Figure 1
caption. Those are citable and must not be paraphrased.

Everything else on the page is written for the page: the tagline, the short
notes under each section, and the analysis subheadings, which follow the
paper's own subsection names. They summarise the paper and must stay faithful
to it, but they are not quotations.

## Before publishing

- [ ] Confirm the author list and affiliations. Order comes from the CV; the full first
      names are expansions of its initials, and Shruti Vyas is inferred rather than confirmed.
      The same names are in the hero and in the `citation_author` meta tags.
- [ ] Restore a BibTeX section once there is a real citation to publish.
- [ ] Swap the two "coming soon" buttons for the paper PDF and code repo links.
- [ ] Remove `<meta name="robots" content="noindex, nofollow">` from `index.html`.
- [ ] Confirm the venue string. The PDF footer says "Track on Evaluations and Datasets";
      the page says "Datasets and Benchmarks Track" in three places.

## Deploy

```bash
git remote add origin https://github.com/omarftt/MaRiO-page.git
git push -u origin main
```

Then enable GitHub Pages on `main` / root. `.nojekyll` is already present.

## Credit

Built on the [Academic Project Page Template](https://github.com/eliahuhorwitz/Academic-project-page-template),
adapted from the [Nerfies](https://nerfies.github.io) project page. Website content
is CC BY-SA 4.0; the MaRiO dataset is CC BY-NC 4.0.
