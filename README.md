# The Tangent

> *The part of the lecture nobody talks about.*

A personal blog about educational and research concepts — written with sharp takes, genuine curiosity, and zero tolerance for boring explanations.

---

## What is this?

**The Tangent** is a writing project built around one idea: the most interesting parts of any subject are almost never in the official curriculum. They live in the gaps — the history behind a concept, the failed attempts before the clean solution, the edge cases that break the beautiful theory.

This site is where those gaps get explored.

There are two types of writing here:

| Format | Description |
|---|---|
| 🧠 **Brain Farts** | Short, reactive, probably half-baked - but honest. Quick thoughts that couldn't wait to be fully formed. |
| 🕳️ **Rabbit Holes** | Long-form deep dives. Magazine-style pieces that actually went somewhere. |

---

## Pages

| Page | Description |
|---|---|
| `index.html` | Homepage — featured article, recent Rabbit Holes, recent Brain Farts |
| `brain-farts.html` | Full Brain Farts listing |
| `rabbit-holes.html` | Full Rabbit Holes listing |
| `article.html` | Single article template |
| `about.html` | About the site and the writer |

---

## Tech Stack

Built with zero frameworks and zero dependencies — just:

- **HTML** - structure
- **CSS** - styling (Inter Tight font, electric purple `#7B5CF0` accent, dark theme)
- **Vanilla JS** - animations (particle background, custom cursor, scroll reveals)

No build tools. No npm. No nonsense. Open `index.html` in a browser and it works.

---

## Design

- **Theme:** Dark, bold, minimal
- **Accent:** Electric Purple `#7B5CF0`
- **Font:** Inter (900 weight headings)
- **Animations:** Ambient particle network, custom cursor with lag ring, scroll-triggered reveals
- **Responsive:** Mobile friendly

---

## Folder Structure

```
the-tangent/
├── index.html
├── about.html
├── brain-farts.html
├── rabbit-holes.html
├── article.html
├── css/
│   └── style.css
└── js/
    └── main.js
```

---

## Adding a New Article

1. Duplicate `article.html`
2. Rename it (e.g. `why-entropy-matters.html`)
3. Replace the title, content, tags, and meta info inside the file
4. Add a link to it from `brain-farts.html` or `rabbit-holes.html`
5. Commit and push — GitHub Pages deploys automatically

---

## Deployment

Hosted on **GitHub Pages** — free, no credits, no expiry.

Live at: `https://yourusername.github.io/the-tangent`

---

*Built from scratch. Written with opinions. Goes on tangents unapologetically.*
