# DukemStash Homepage Mockup Spec

Create a marketing homepage for DukemStash - a developer knowledge hub for code snippets, AI prompts, commands, notes, files, images, and links.

The vibe should match a builder/developer personality: clean, modern, slightly nerdy, ambitious, and focused on turning messy ideas into scalable systems. It should feel like something made by a full-stack engineer who loves React, AWS, AI, DevOps, and productivity tools.

**Output:** `prototypes/homepage/` with `index.html`, `styles.css`, `script.js`

---

## Color Palette

Dark theme with subtle glassmorphism, soft gradients, and premium SaaS styling.

Dark background suggestions:

* Primary background: `#0f172a`
* Secondary background: `#111827`
* Card background: `#1e293b`
* Border color: `#334155`
* Text primary: `#f8fafc`
* Text secondary: `#94a3b8`

Accent colors for item types:

* Snippet: `#3b82f6` (Blue)
* Prompt: `#f59e0b` (Amber)
* Command: `#06b6d4` (Cyan)
* Note: `#22c55e` (Green)
* File: `#64748b` (Slate)
* Image: `#ec4899` (Pink)
* URL: `#6366f1` (Indigo)

---

## Hero Section (Main Focus)

The hero shows a "chaos to order" concept with three elements side by side.

The visual style should feel like a mix of developer workspace, SaaS dashboard, and startup landing page.

### Chaos Container (Left)

A box labeled "Your knowledge today..." containing floating developer-related items representing where knowledge is scattered:

* Notion, GitHub, Slack, VS Code logos
* Browser tabs, Terminal, Text file, Bookmark icons
* Optional extras: Jira ticket, Discord, ChatGPT prompt, random sticky note, Stack Overflow tab

The box should look messy and overloaded, with overlapping items and random positioning.

**The icons should animate:**

* Float around randomly, bouncing off walls
* Subtle rotation and scale pulsing
* Move away from mouse cursor on hover
* Slight blur or glow effect on hover
* Different movement speeds to make the chaos feel more natural

### Transform Arrow (Center)

A pulsing arrow pointing from chaos to order.

The arrow should have a glowing gradient effect and subtle particle trail or blur shadow to make it feel dynamic.

### Dashboard Preview (Right)

A box labeled "...with DukemStash" showing a clean, organized dashboard mockup.

The dashboard should feel like a polished developer tool with:

* Sidebar with nav items
* Search bar at the top
* Grid of item cards with colored top borders (using the item type colors)
* Small tags like "React", "AWS", "Docker", "Prompt", "Terraform", "DevOps", "Next.js"
* Stats row showing things like total snippets, prompts, collections, and saved time
* Optional mini chart or activity feed

---

## Other Sections

1. **Navigation** - Fixed top nav with logo, "Features"/"Pricing"/"AI" links, Sign In/Get Started buttons

2. **Hero Text** - Above the visual:

   * Headline: "Stop Losing Your Developer Knowledge"
   * Highlight part of the headline with gradient text
   * Subheadline about scattered snippets, prompts, commands, docs, and links across too many tools
   * CTA buttons like "Start Free" and "Watch Demo"
   * Add a small trust row below with text like:

     * "Built for developers, students, indie hackers, and startup teams"
     * Small tech tags such as React, AWS, AI, DevOps, Full-Stack

3. **Features** - 6 cards in a grid:

   * Code Snippets
   * AI Prompts
   * Instant Search
   * Commands
   * Files & Docs
   * Collections

   Each card uses its item type accent color and should include:

   * Icon
   * Short description
   * Small example tag or preview snippet

4. **AI Section** - Two columns:

   * Left has "Pro Feature" badge and checklist of AI capabilities
   * AI features can include:

     * Auto-generate tags
     * Summarize notes
     * Suggest related content
     * Convert messy notes into structured collections
     * Find duplicates
     * Natural language search
   * Right shows a code editor mockup with "AI Generated Tags" demo

5. **Pricing** - Free vs Pro comparison:

   * Free: `$0`, 50 items, 3 collections
   * Pro: `$8/mo`, unlimited items, unlimited collections, AI features
   * Pro card highlighted with "Most Popular" badge
   * Add a toggle for yearly billing with `$72/year`
   * Add small text like "Save 25% with annual billing"

6. **CTA** - "Ready to Organize Your Knowledge?" with supporting text and button

7. **Footer** - Logo, product links, resources links, social links, copyright with current year

---

## Typography

Use modern developer-friendly fonts:

* Headings: `Space Grotesk`, `Inter`, or `Sora`
* Body: `Inter`
* Code snippets / tags: `JetBrains Mono` or `Fira Code`

Use large bold hero text and clean spacing throughout.

---

## UI Style

* Rounded corners (`16px` to `24px`)
* Soft shadows and glassmorphism effects
* Subtle borders with low opacity
* Cards should slightly lift on hover
* Buttons should have smooth hover transitions
* Use gradient glows behind important sections
* Dashboard cards should feel premium and organized

---

## Animations

* **Chaos icons**: JavaScript animation using requestAnimationFrame. Icons drift, bounce off walls, repel from mouse cursor.
* **Arrow**: CSS pulse animation
* **Scroll**: Elements fade in when scrolling into view
* **Navbar**: Gets more opaque on scroll
* **Cards**: Slight hover lift and shadow effect
* **Buttons**: Smooth scale and glow on hover
* **Dashboard preview**: Small floating animation or subtle parallax movement

---

## Responsive

* Mobile: Stack the chaos/arrow/dashboard vertically, single column grids
* Arrow rotates 90° on mobile to point down
* Navigation collapses into hamburger menu
* Dashboard preview becomes horizontally scrollable if needed
* Reduce animation intensity slightly on smaller screens for performance
