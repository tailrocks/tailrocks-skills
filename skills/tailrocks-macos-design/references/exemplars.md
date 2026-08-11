# The exemplar corpus

The annotated corpus this skill's process requires, populated. Compiled
2026-08-11 from Apple's own material and named Mac press. Every quote below was
read from the source; sources are listed inline. Re-verify before quoting
externally — Apple has taken pages down (see the design gallery below).

Study **restraint, hierarchy, and structure**. Never copy subject matter,
identity, or a decorative treatment.

## The finding that organizes everything

Apple's own macOS apps split into two camps, and the split maps exactly onto
whether the app is Mac-shaped or iPhone-shaped:

- **Restrained, correct, worth copying:** Finder, Safari, Reminders, Maps.
- **Aggressively transparent, widely criticized:** Music, Photos, Podcasts,
  FaceTime, Home, Journal.

The second group is Apple's iOS-flavored transparency applied to *unpredictable
user content*. Three independent reviews document the same legibility failure in
the same apps. Jason Snell's structural diagnosis is the one to internalize:

> The design was created with specific kinds of apps in mind: iPhone apps full of
> scrolling content libraries… **the Mac is not the iPhone, and most Mac apps are
> not media library browsers.**
> — Six Colors, macOS 26 Tahoe review (source URL unverified)

Every macOS 27 correction Apple shipped — uniform toolbars, edge-to-edge
sidebars, a darkened glass edge, brighter specular highlights, the transparency
slider — targets precisely that failure mode.

**So: copy Apple's Mac-shaped apps. Do not copy Apple's iPhone-shaped apps
running on the Mac.** That single rule prevents most of the damage.

## Reference model by app shape

Pick the Apple app whose *shape* matches yours and study that one.

| Your app is… | Study | Because |
|---|---|---|
| Document or browser shaped | **Safari** | Restrained regular glass, grouped toolbar, sectioned sidebar, content flows under chrome, buttons opaque enough to read |
| A media library | **Apple TV** | Floating sidebar + background extension + full-bleed artwork, done where content is *curated* rather than arbitrary |
| A canvas or editor | **Freeform** | Inline controls float **above** the canvas rather than beside it; canvas stays clean |
| A map or spatial canvas with overlay controls | **Maps** | Overlay opacity done right; on macOS 27 it is Apple's own example of interactive glass and of concentric content |
| A dense grid or schedule | **Calendar** | Apple's named example of a dense UI that must tune the scroll edge effect |
| A files or records browser | **Finder** | The most restrained end of Apple's spectrum — near-zero glassy flourish |
| A pro tool with heavy chrome | **Xcode 27** | Consolidates chrome *into* the toolbar and pushes long-string controls to a bottom bar |

### What Apple says about each, verbatim

**Safari** — Apple used it as the *pre-existing correct model*, before Liquid
Glass even shipped:

> Like in Safari today, controls sit on top of a system material, not directly on
> content. — WWDC25 356 (source URL unverified)

And the toolbar: "The new rounded tab design floats gracefully in the tab bar
while web page content flows underneath the toolbar while you browse."

Note the mid-cycle correction: macOS 26.4 added a **compact tab bar option**.
Even Apple's best-behaved app needed a density escape hatch.

**Apple TV** — the sidebar exemplar Apple itself puts forward:

> In iPadOS and macOS, updated sidebars make apps like Apple TV even more
> immersive. They refract the content behind them — while reflecting content and
> the user's wallpaper from around them. — Apple Newsroom, June 2025

**Freeform** — the canonical canvas answer:

> Freeform's inline editing controls are a great example. They float above the
> content rather than sitting alongside, and they work beautifully with the
> Liquid Glass material. — WWDC25 310 (source URL unverified)

**Maps** — the macOS 27 exemplar, twice:

> There is an effect that can be added to glass. Where the glass subtly bounces
> when clicked… **Maps uses this for a few of their custom controls.** … use this
> effect with controls and buttons, or glass containers of interactive controls.
> **A little goes a long way!** — WWDC26 289 (source URL unverified)

> For example, the local weather view in Maps is concentric with the window.
> — WWDC26 289

Reviewers independently single Maps out for getting overlay opacity right, in
contrast to Music and Photos.

**Calendar** — the density signal:

> For denser UIs with a lot of floating elements, like in the calendar app, tune
> the sharpness of the effect on your content with the `scrollEdgeEffectStyle`
> modifier. — WWDC25 323

Read alongside "Hard is mostly used on macOS" (WWDC25 356): dense, grid-like Mac
apps use the hard scroll edge style.

**App Store** — the background-extension exemplar:

> This App Store poster creates a striking effect when displayed edge-to-edge …
> The content is being mirrored and blurred. — WWDC25 310

**Mail** — Apple's worked example of toolbar grouping: leading-aligned filter,
trailing-aligned search plus compose, separated with flexible spacing. Also the
only published statement resembling minimum-width behavior:

> The system may choose to minimize the search field into a toolbar button, like
> the one shown here in Mail. — WWDC25 323

**Photos** — study it for exactly one thing, the negative case:

> The informational text in the Photos toolbar is a great example [of
> non-interactive items that should avoid the glass material]. — WWDC25 310

Then stop. Its chrome is a counter-example (below).

**System Settings** — Apple's named example of search placed *in the sidebar*
rather than trailing in the toolbar (WWDC26 292).

## Third-party Mac exemplars

Honest framing: **Mac-specific praise for Liquid Glass adoption barely exists.**
The Mac press spent 2025–2026 litigating Apple's own implementation. Two apps
have substantive Mac-specific reviews. Both are praised for the same thing —
**restraint**.

### NetNewsWire 7 — Brent Simmons, with Stuart Breckenridge

Shipped January 2026, open source, requires macOS 26. The clearest case of a
respected Mac-native app doing this well and being recognized for it.

- Michael Tsai: *"from a brief test on Tahoe the Liquid Glass stuff seems to be
  tastefully done."*
- Nick Heer: *"a rather tasteful implementation of Apple's new visual design
  language."*

**What to study:** it is a three-pane reader that adopted the system materials
without abandoning density or its keyboard model. It is not a glass-everywhere
app.

**The adoption *process* is the more valuable lesson.** Simmons staged it: a
maintenance release first (6.2), then a Liquid Glass release that raised the OS
floor (7.0), then backfilled older-OS support (7.0.1). Do not attempt a
redesign and an adoption in one release.

Worth knowing: Simmons is himself a Liquid Glass critic — he has written about
legibility loss and floated shipping a toggle to turn it off. Tasteful adoption
and enthusiasm are not the same thing, and the former is what ships quality.

### Daft Music — Dennis Oberhoff

The only third-party Mac app with a dedicated review of its Liquid Glass design,
and **it wins by rejecting the transparency Apple used**:

> Daft Music's playback controls don't disappear against colorful album art the
> way Apple Music's sometimes do. — MacStories

It uses a **frosted** treatment rather than pronounced transparency so playback
controls stand out against artwork, and the layout is *"boiled down to its
simplest form."* MacStories explicitly frames it as picking the Finder/Safari
treatment over the Music/Photos treatment.

**This is the single most transferable third-party lesson in the corpus:** when
content behind the glass is unpredictable, choose the more opaque treatment.

### Apple's own design gallery — the only Apple-endorsed native-Mac examples

Apple ran a "new design gallery" showcasing third-party adoption. It carried
**eleven iOS entries and two macOS entries**, and the two macOS entries were not
award winners:

> **CardPointers** — "Subtle changes to color and branding in this credit
> card-tracking app make for a big impact. A purple gradient at the top of the
> view anchors the Liquid Glass controls, so people can focus on the data-packed
> interface."

> **Essayist** — "In this minimalist app for writers and academics, controls are
> compact, but float above the canvas to remain in reach at all times. Plus,
> actions are simplified across the app, with an emphasis on minimizing the
> number of tools that are exposed at any given time."

Both descriptions are about **subordinating chrome to a dense content layer** —
the opposite of decorative glass.

**The gallery URL now redirects to Apple's design index; the content survives
only in the Internet Archive.** Treat these two as archival evidence, and
install the apps rather than relying on the blurb.

### Studios that shipped on time and tastefully

Omni Group (day-one Liquid Glass across their suite), Cultured Code (Things
3.22, day one), Agile Tortoise (Drafts — MacStories 2025 App of the Year, with
Mac work specifically on menu bar, multi-windowing, and keyboard shortcuts),
Tapbots (Pastebot 3), Panic. Reviewer detail on their *Mac* glass work is thin;
their value here is as evidence that staged, on-schedule adoption by
native-craft studios is achievable.

Omni's own framing is worth carrying:

> Refreshing all our apps for Liquid Glass is an ambitious effort that will take
> more than just a few months. Unlike any of Apple's previous design overhauls,
> this design applies to all of their platforms at once!

Note the deliberate outlier: **Panic's Blippo+** was a 2026 Apple Design Award
finalist for a completely custom, deliberately anti-Liquid-Glass interface, cited
by Apple for *"incredible attention to its world-building details."* A confident,
coherent custom identity is a legitimate answer. A half-adopted one is not.

## The practitioner postmortem — the best single artifact

Tide Guide's developer gave a first-person Liquid Glass postmortem in Apple's
own "Meet with Apple" showcase session. It is the richest practitioner source
found, and three passages are directly actionable on the Mac.

**The adoption method — quote this at anyone planning a redesign:**

> There's rightfully a lot of attention on the actual glass material part of the
> design, but **the new design system is full of fantastic usability
> improvements**, so much so that many of the changes that I've made to padding
> and hierarchy, I haven't cordoned off to just the latest OS version.
>
> Going through this process, one of the things I realized was that **a redesign
> is certainly not required to adopt the new design. In fact, my process was more
> adopt and then redesign. Many of the best aspects come from just using the
> latest version of system components.**

**Adopt, then redesign.** Not redesign, then adopt.

**The information-architecture move — a menu became a glass popover:**

> I first shipped all of these options in a context menu… You open the menu,
> navigate to a submenu, make your selection and **the whole menu deconstructs
> every time** … Removing the hierarchy and putting everything in one menu I
> didn't think was that big of an improvement. **I find a list like this to be
> very hard to read at first glance.**
>
> **I've ended up using a glass popover instead, using the same components from
> inside the menu.** … you can change fiddle and find the options **without the
> menu dismissing** … and when you're done, everything collapses back into the
> ellipsis menu, **giving a sense of origin to all of these settings.**

That is a hierarchy fix expressed through material, not a styling change. It is
the shape of a good Liquid Glass decision.

**The technique worth stealing — the `identity` variant on data visualization:**

> **I've found the identity variant to be one of the most delightful and one of
> the most flexible. This effect doesn't change the appearance of a view until
> you interact with it.**
>
> I've applied this effect here to the main tidal wave. **On first glance, it's
> not obvious there's anything glassy about it, but as you start sliding it, the
> interactive effect adds a soft, subtle highlight beneath the wave.**

Glass that is invisible at rest and appears only under direct manipulation. This
is how a chart or a scrubber can be tactile without becoming decoration — and it
sidesteps the content-layer prohibition, because at rest there is no material.

**On what actually improved, which was not the glass:**

> The consistent leading alignment and spacing… **Being able to quickly scan the
> leading edge of every row and know action and content based on color and
> iconography helps reduce the cognitive load.**

**On cross-platform intent:**

> I've always strived to have the app feel purpose built for each platform. From
> being super simple and glanceable on Apple Watch to **having more
> informationally dense layouts on iPad and Mac.**

## Apple Design Awards — how to use them, and their limit

The 2026 categories, which are useful as benchmark *dimensions*: Delight and
Fun, Inclusivity, Innovation, Interaction, Social Impact, Visuals and Graphics.
Apple publishes category definitions but **no scoring methodology and nothing
macOS-specific**. Interaction, verbatim: apps that *"deliver intuitive interfaces
and effortless controls that are perfectly tailored to their platform."*

Two 2026 winners carry Liquid Glass citations:

- **Moonlitt** (Interaction) — cited by Apple for *"best-in-class Liquid Glass
  integration."* Ships on Mac. The developer: *"it clicked the first time we
  tried Liquid Glass … It was like the interface was breathing."*
- **Tide Guide** (Visuals and Graphics) — cited for *"Liquid Glass integration,
  aquatic theme, and sky-matching palette."* Ships on Mac.

**The limit, stated plainly: neither citation is about the Mac.** Every piece of
supporting material — winner blurbs, developer Q&As, the showcase, the gallery
labels — is iOS-framed. No Mac-first app won a 2026 award for Mac design, and
Apple's App Store editorial for the winners never uses the phrase "Liquid Glass".

Use the awards for evaluative dimensions and for interaction craft. Do not use
them as a macOS Liquid Glass reference. The gallery's two macOS entries and the
Tide Guide postmortem are worth more for that purpose than the entire winners
list.

Also worth carrying: award-level quality includes VoiceOver, Increased Contrast,
and Differentiate Without Color — one 2026 winner renders its chord diagrams in
black and white *itself* under Increase Contrast rather than inheriting the
system change. A reference that only documents the default light appearance
teaches the wrong lesson.

## Counter-examples

Negative references outperform additional adjectives. These are the documented
ones.

### Apple's own Music and Photos on the Mac

The most-cited bad Liquid Glass Mac apps in 2025–2026 are Apple's.

- **Music** — controls moved to a bottom pill that is *"much more transparent,"*
  making them *"harder to read"* against *"the constantly changing and visually
  busy backdrop."* The controller *"feels cramped and can get partially obscured
  by content sliding behind it."*
- **Photos** — *"Controls in Photos often get lost in your sea of images."* Its
  toolbar *"floats without any backing frame,"* with the acknowledged
  consequence that *"similarly-colored content sliding under a button can make it
  illegible."*
- **Finder** — internally inconsistent: the icon view's toolbar is far more
  transparent than the list view's. Inconsistency inside one app is its own
  defect.
- **iWork and Final Cut Pro opted out of Liquid Glass entirely.** Apple's own pro
  apps declined it.

**The lesson:** transparency over *arbitrary user content* is the failure. The
same treatment over curated content (Apple TV) works.

### Toolbar real estate eaten by chrome

A Mac developer's specific complaint, worth checking your own layout against:

> In Tahoe, not only do stupid big corner radii eat more into your usable area,
> they now allow the inspector sidebars to cut even more into toolbar space. The
> volume and scrub controls are now an extra click away.

Any chrome change that adds a click to a frequent action has failed regardless
of how it looks.

### The accessibility regression

The most rigorous technical critique, from Howard Oakley:

> Tahoe has continued a trend for Light Mode to be bleached-out white, and Dark
> Mode to be a moonless night. **Seeing where controls, views and contents start
> and end is difficult**, and leaves them suspended in the whiteout.

> Those with visual impairment can no longer remove or even reduce these effects,
> as **the Reduce Transparency control in Accessibility settings no longer
> reduces transparency in any useful way.**

**Design implication:** do not rely on the system's accessibility escape hatch to
rescue a low-separation design. If your surfaces are only distinguishable because
of the material, they are not distinguishable.

### Non-native desktop wrappers

The defining 2026 example of the class, per John Gruber: a browser-runtime Mac
app that is *"restrained by the limits of the web and cut off from the breadth of
idiomatically native functionality provided by the Mac's native frameworks."* His
general verdict on the runtime: it *"guarantees that an app feels just as wrong
on all platforms."*

There is a serious counter-argument — Nikita Prokopov's, that the real problem is
*"lack of care"* and *"slop,"* which any stack can produce. Both are worth
holding. Watts Martin's reframe resolves them (see `design-principles.md`):
native toolkit is neither necessary nor sufficient; **platform citizenship** is
the criterion.

One concrete technical datum: in October 2025 that runtime's hidden window-shadow
override collided with Tahoe's rendering pipeline, causing repeated shadow
redraws and GPU burn until vendors patched. Non-native chrome does not merely
look out of step with Liquid Glass — it can fight it.

### The critical consensus, for calibration

The Mac scored **B−** in Six Colors' 2025 Apple report card, down from the prior
year, dragged down by Tahoe despite uniform hardware praise. John Siracusa:
*"Tahoe is the worst user interface update in the history of the Mac."*

Read this as calibration, not as permission. Apple shipped corrections in 26.1
(clear/tinted setting), 26.4 (compact tab bar; a glass backdrop fix), and macOS
27 (uniform toolbars, edge-to-edge sidebars, darkened edge, transparency
slider). The direction is refinement, not retreat — and every correction points
at legibility and density, which is where a Mac app should have been aiming
anyway.

## Using this corpus

For each new screen, name the reference model it is following and say why. Then
check it against the counter-example that most resembles it — a media-heavy
screen against Music, a dense browser against Finder's inconsistency, a canvas
against Freeform.

When you add your own references, use the annotation shape in
[`reference-corpus.md`](reference-corpus.md): user job, what works and why, where
glass appears, where it deliberately does not, what is applicable to your
product, and what must not be copied.
