# MaRiO project page

Source for the project page of **MaRiO: Multi-agent Collaborative Reasoning via
Shared Observations in MLLMs** (NeurIPS 2026, Datasets & Benchmarks Track).

- Site: https://omarftt.github.io/MaRiO-page/
- Dataset: https://huggingface.co/datasets/mariobench2026/MaRiO

## Running it locally

The page is static, but it has to be served over HTTP. The example explorer
loads its questions with `fetch`, which browsers block on `file://` URLs.

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Layout

```
index.html
static/
  css/     mario.css is the only custom stylesheet; the rest come with the template
  js/      mario.js builds the example explorer
  data/    examples.json, the questions the explorer shows
  images/  figures/ and tables/ are cropped from the paper at 600 dpi,
           tasks/ holds the agent views used by the explorer
```

Tables and figures are images taken from the paper rather than rebuilt in HTML,
so the numbers on the page always match the numbers in the PDF.

The explorer shows ten benchmark questions together with the answers four
models actually gave. Five questions use real-world scenes and five use
simulated ones, covering both halves of the dataset.

## Credits

Built on the [Academic Project Page Template](https://github.com/eliahuhorwitz/Academic-project-page-template),
adapted from [Nerfies](https://nerfies.github.io).

Site content is CC BY-SA 4.0. The MaRiO dataset is CC BY-NC 4.0.
