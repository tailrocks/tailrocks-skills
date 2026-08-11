# Principles and the citizenship tests

Two layers. Apple's principles supply the **axes** a design is judged on. They
are deliberately not scoreable — Apple says so. Platform-citizenship checklists
supply the **pass/fail tests**. A review needs both: the axes alone produce
vibes, the tests alone produce a conformant app with no point of view.

Compiled 2026-08-11 from Apple's Human Interface Guidelines and WWDC sessions,
quoted rather than paraphrased. Apple reintroduced a formal design-principles
page on 8 June 2026.

## Apple's eight principles

Apple's framing:

> The most successful and enduring designs are based on a deep understanding of
> how people think, feel, and interact with the world. … There's no one right way
> to apply these principles. Instead, they're tools to help you weigh competing
> priorities and make key decisions on the path to a great design.

And the definition worth putting at the top of a design brief:

> For us at Apple, design is making something with intention. It's focusing on
> what's most important to people, so you can build something they will truly
> value.

> Every feature you add to your product asks something of the person using it. It
> asks for their time, their attention, and their trust. These are valuable
> things you can't afford to waste. **So choosing what to build is often a matter
> of deciding what not to include.**

### 1. Purpose

> Create value. … At every stage of development, ask what your product is for and
> whether the design serves that purpose.

> Keep focused. Prioritize your app's most important features … and focus on
> making those features truly great.

> Find new ways to solve the problem. Investigate existing solutions, and avoid
> re-creating them.

### 2. Agency

> **Stay out of the way.** People use your product to get things done. Often the
> best way to help them do this is to get them directly to the task or content at
> hand. The best designs are unobtrusive and present when people need them.

> Give people the freedom to explore. Let them move through your interface and
> access features without being locked into specific flows or modes.

> Help people recover from mistakes. … Recovering from the unexpected shouldn't
> cost people their time or work.

> In some cases, interruptions can be helpful. But use interruptions carefully,
> and only when someone is about to make a big mistake.

### 3. Responsibility

> Privacy is a human right.

> Be fully transparent about what your product does and why. … Only collect what
> your product needs to function.

> How could this feature be misused? Who would be harmed by this? And how do I
> prevent it?

> When you build intelligent features, you have to anticipate that a model might
> generate something unexpected or inaccurate.

> Consider removing features entirely, if the risks to people's safety outweigh
> the value.

### 4. Familiarity

The testable form, and the most useful single sentence in the set:

> **Simply put, things that look the same should behave the same.**

> Keep visuals and interactions consistent. Once you establish a behavior or
> appearance for an element, apply it throughout your design.

> Provide clear feedback. … Show when controls are available, indicate when
> content changes, and use system patterns to display alerts and offer choices.

> The trick to metaphors is making sure they aren't too literal or abstract.

> For common actions, there's no need to reinvent the wheel.

### 5. Flexibility

> Design for everyone. … **Treat accessibility as a priority from the start.**

> Preserve a person's context. … Keep content and controls in consistent,
> predictable positions, and use natural animations to ease transitions.

> Consider a variety of input methods.

> Approach every platform with intention. Your software should feel polished and
> at home wherever it runs. **Give each platform you support the same level of
> care.**

### 6. Simplicity

> **Include just what's necessary. Simplicity isn't minimalism.**

> When we say simple, we don't mean minimal. If you bury all your functionality
> inside a single place, that might make your interface look more minimal, but it
> doesn't make it simple.

> Clear interfaces answer people's questions: What do I pay attention to? What
> can I interact with? And how do I interact?

> **In a simple interface, every element earns its place.**

> In some cases, making an interface simpler can mean adding more to it.

### 7. Craft

> Quality sets the tone. Every element of your design shows people how much you
> care. Be deliberate with each decision, and strive for stunning visuals, smooth
> animations, precise wording, and thoughtful audio.

Apple's own defect list — the symptoms of missing craft:

> You tap a button and you just have to wait for it to do something. Scrolling is
> jittery. Icons are misaligned. You rotate your phone, and the layout gets all
> messed up. **It feels fragile.**

> Experiment and iterate. Prototype early, try new approaches, and be willing to
> discard what doesn't work.

> Maintain your craft. Shipping isn't the finish line. … Design is an ongoing
> commitment.

### 8. Delight

> **Don't mistake delight for decoration.** Keep in mind that people are trying to
> accomplish a task, so don't let pursuit of delight for its own sake get in the
> way of your product's core purpose.

> The way to make a design delightful isn't by adding confetti or tacking on
> extra flourishes at the end of your process. … **It's the natural result of
> getting all the design principles right.**

Apple explicitly refuses to make this a formula:

> There's no formula or right way to combine these principles that guarantees
> you'll arrive at the perfect solution. You might even find that leaning into one
> principle feels like you're compromising on another. … Ultimately, it's up to
> you to use your knowledge and intuition to find the best path forward.

## What makes a Mac app a Mac app

Apple's own macOS characterization:

> People rely on the **power, spaciousness, and flexibility** of a Mac as they
> perform in-depth productivity tasks, view media or content, and play games,
> **often using several apps at once.**

> Interactions can last anywhere from a few minutes of performing some quick
> tasks to **several hours of deep concentration.** People frequently have
> multiple apps open at the same time, and they expect smooth transitions between
> active and inactive states.

Viewing distance is roughly one to three feet, input is *"any combination"* of
keyboard, pointing device, game controls, and voice.

**Apple's six macOS best practices — this is the closest thing Apple ships to a
Mac quality checklist:**

1. > Leverage large displays to present **more content in fewer nested levels**
   > and with less need for modality, while maintaining a comfortable information
   > density that doesn't make people strain to view the content they want.
2. > Let people **resize, hide, show, and move your windows** to fit their work
   > style and device configuration, and support full-screen mode.
3. > Use the **menu bar** to give people easy access to **all** the commands they
   > need to do things in your app.
4. > Help people take advantage of **high-precision input** modes to perform
   > pixel-perfect selections and edits.
5. > Handle **keyboard shortcuts** to help people accelerate actions and use
   > keyboard-only work styles.
6. > Support **personalization**, letting people customize toolbars, configure
   > windows to display the views they use most, and choose the colors and fonts
   > they want to see.

**The inversion versus iPhone is exact.** iPhone's first best practice is to
*"limit the number of onscreen controls."* The Mac's is *more content in fewer
nested levels.* An interface that hides functionality behind progressive
disclosure is doing the right thing on iPhone and the wrong thing on a Mac.

Apple states the split in one line:

> When someone pulls out their iPhone, they want quick, touch-based interactions.
> **On Mac, they expect deep workflows, and precise pointer controls.** Every
> device deserves a solution that takes advantage of what makes it unique.

And on layout:

> On iPhone, you're zoomed in to a narrow, vertical layout. On Mac, everything
> unfolds into a wide, expansive canvas.

Accessibility carries a Mac-specific shape too:

> Mac apps are primarily designed for keyboard and mouse interactions with
> **denser user interfaces and powerful multitasking.** … any interaction that
> requires hovering the pointer or performing a trackpad gesture may not be
> accessible to everyone.

### The three window states

Most cross-platform apps fail this, and it is a hard requirement:

> A macOS window can have one of three states: **Main** — the frontmost window
> that people view. **Key** — also called the active window, the key window
> accepts people's input. **Inactive** — a window that's not in the foreground.

> Make sure custom windows use the system-defined appearances. People rely on the
> visual differences between windows to help them identify the foreground window
> and know which window will accept their input. When you use system-provided
> components, a window's background and button appearances update automatically …
> **if you use custom implementations, you need to do this work yourself.**

> Inactive windows don't use materials … which makes them appear subdued and seem
> visually farther away.

> Avoid putting critical information or actions in a bottom bar, because people
> often relocate a window in a way that hides its bottom edge.

### The menu bar

> Mac users … rely on it to help them learn what an app does and find the commands
> they need. To help your app or game feel at home in macOS, it's essential to
> provide a consistent menu bar experience.

Required order: app name, File, Edit, Format, View, app-specific menus, Window,
Help.

> Always show the same set of menu items. Keeping menu items visible helps people
> learn what actions your app supports, even if they're unavailable in the
> current context. **If a menu bar item isn't actionable, disable the action
> instead of hiding it from the menu.**

Restated as testable rules: populate each menu with **every** action that relates
to its name; order by **frequency of use, not alphabetically**; never hide menus
or items by context; menu items stay in the same place even when inactive.

> In general, don't repurpose standard keyboard shortcuts for custom actions.

## The orientation test

Apple's own critique, walked out loud — the fastest way to judge a screen:

> When I look at an app, I want to find clarity … That starts with knowing
> **where I am.** … The next question is: **What can I do?** I shouldn't have to
> guess — actions should be clear and easy to understand. And finally, I ask:
> **Where can I go from here?**

And the failure it diagnoses:

> At first glance, this app looks pretty good. And sometimes, that can be
> misleading because I'd assume it works just as well. … The result? The screen
> didn't guide me — I had to work to piece it together.

> When the structure isn't crystal clear, people feel it: as hesitation,
> confusion, sometimes even giving up.

Also: *"tabs are for navigation, not for taking action"*, and each extra tab
*"means one more decision for people to make."*

## The citizenship tests

Apple supplies axes. These practitioners supply pass/fail tests, and they test
things Apple documents but never aggregates.

### The origin, and its actual scope

The term "Mac-assed Mac app" was coined by Collin Donnell and first defined by
Brent Simmons:

> It's a phrase I stole from my friend Collin Donnell to describe Mac apps that
> are **unapologetically Mac apps**. They're platform-specific and they're not
> trying to wow us with all their custom not-Mac-like UI (which often isn't very
> accessible).

That two-clause test is the whole original definition. Anyone presenting a longer
"Simmons checklist" invented it.

### Gruber's three marks

> **Customization** that allows you, the user, to shape the tool into something
> personal, that fits your needs and idiosyncrasies. **Familiarity** — the je ne
> sais quoi of doing things, large and small, the Macintosh way — that makes new
> … Mac apps easy to get started with and intuitive to explore. And, well, just
> being **a beautiful work of art unto itself.**

### Watts Martin's rubric — the best citable one

It reframes the question away from toolkit, which is the key insight:

> So it's possible that the right question isn't "is this app using a native UI
> toolkit," it's **"is this app a good Mac citizen."** In other words, does it
> embrace long-standing Mac conventions?

1. > The standard menus (Application Name, File, Edit, View, Window, Help) should
   > be present, in that order, with the expected submenu items.
2. > Settings should come up when you select Settings… or hit ⌘,. Settings should
   > appear in a window, not a tab.
3. > Everything in the Services menu should work as expected, including when it's
   > invoked from the context menu.
4. > Any text field should work the way it does everywhere else in the system. It
   > should respect the subset of Emacs key bindings that all Cocoa text fields
   > do … text replacements you've defined system-wide should work, smart quotes
   > should be made smart if you have that turned on globally.
5. > The general "fit and finish" needs to be Mac-like. Icons and symbols …
   > shouldn't look like they came from Windows, GNOME, Mac OS 8, or Mars … The
   > UI font should be San Francisco.

**The result of applying it is the important part.** Canonical native apps score
well — and so does at least one browser-runtime app, while *"being 100% native is
no guarantee."* Native toolkit is **neither necessary nor sufficient**;
citizenship is the criterion. That resolves the whole native-versus-wrapper
argument into something testable.

### Paulo Andrade's behavioral list — the post-Liquid-Glass version

> It describes apps that are not only native, but that also **adopt the system's
> controls and conventions and integrate impeccably with the operating system's
> features.**

> It uses native controls and looks beautiful while doing so. It leans heavily on
> the menu bar, includes plenty of keyboard shortcuts, supports multiple windows,
> has tooltips and hover states, and adopts system technologies such as Password
> AutoFill, AppleScript, Safari app extensions, and sudden termination.

The single best small test in the corpus, because almost nothing passes it —
including one of Apple's own apps:

> In a proper Mac-assed app, opening a context menu should enable a **focus ring
> around the item the menu applies to, even when that item isn't selected.**

Other behaviors on his audit: inactive-window appearance, de-emphasized selection
when a view loses focus, drag and drop, arrow keys in search fields, toolbar item
placement.

### Icons

The post-Liquid-Glass icon rule, from Louie Mantia:

> If you treat the squircle shape as a **container**, you can only put an icon
> inside of it, but if you treat this shape as a **canvas**, then the icon is the
> squircle.

> A great app icon combines its own identity with the identity of the platform. …
> The objective here is not just to make an icon — it's to make an icon that
> **looks like it belongs on this platform.**

Three failure modes: a square icon masked to the squircle; a pre-Tahoe icon
auto-scaled onto neutral gray; an icon voluntarily scaled onto a custom-colored
squircle.

The older craft criteria still hold: legible at small sizes, similar visual
weight to system icons, a unique silhouette is a bonus, and it must work on any
background including white, black, and photos.

## Naming is an evaluable axis

Three tests, from Apple's own UX writing guidance:

> **Belongs** — this first one is about fit.
> **Expectations** — the second is about clarity and trust. When someone reads a
> name, they're already predicting what they'll find.
> **Works everywhere** — a name that travels, holding up across languages,
> markets, and the platforms and contexts where your app lives.

> Naming is as fundamental to the experience of your app as the layout,
> interactions, and visual scheme.

Compressed: remove fillers, avoid repetition, lead with the why, keep a word list
for consistency.

Branding, related:

> In the context of iOS, people don't need to be reminded which app they're
> using. … Aim to incorporate branding in refined and unobtrusive ways that don't
> distract people from your experience. It can be expressive, bold, or elegant,
> **but should always be functional.**

## Inclusion as a design axis

Four operational steps from Apple's inclusive-design guidance: support multiple
senses; provide customization; adopt the accessibility API; **track inclusion
debt**. The framing:

> Disability is just as much about the environment as it is about the body.

> This is how an app adapts to people rather than expecting people to adapt to an
> app.

## Apple's position on agents doing design work

This is Apple's own boundary, stated by a prototyper on the Apple Design Team,
and it is the correct policy for this skill family. Quoted rather than
summarized because it is the line an agent is most likely to cross:

> **Do not delegate critical thinking to these tools.** Ultimately, your task is
> to use your judgment to craft what you believe is the best possible experience
> for people who use your app.

> Think of coding agents as **collaborators** in your prototyping process to help
> you discover what the best experience is. **Remember, you always have final
> say.**

> The big theme is not to think about agents as designers, but as collaborators
> to help you arrive at the best possible experience for your app. … **The key
> piece of the puzzle is your judgment.**

The anchoring failure mode Apple names — this is exactly what a vague prompt
produces:

> You might be tempted to ask, "create a UI for managing a book club that meets
> regularly." … the prompt is vague and it brings a few problems. **The agent
> generated an arbitrary layout.** … it also took a guess at the app features
> because it wasn't clearly defined in the prompt … making it easy to get stuck
> or **anchored on a flawed starting point.**

> By the time we've gotten the interface to display the features we do want, it
> could present feature creep, looking clunky and inelegant.

> When it comes to your app and what problems you want it to solve, **you likely
> have a better idea where to start than the agent does.**

Explicitly reserved for the human:

> **Stop and think through edge cases yourself.** For example, in my app, how
> does the detail area look if no meeting has been scheduled yet?

> Nothing beats real-world use in getting feedback from people who actually use
> and try your app.

What Apple *does* recommend delegating — and this maps onto Stage 3 of this
skill:

> Ask for multiple options. Early on is your best opportunity to evaluate and
> explore multiple and divergent directions. … **go wide, remix, repeat.**

> One of the greatest powers of coding agents in Xcode is their tireless ability
> to produce new and interesting concepts.

Also: express the intended mood in the prompt yourself; have the agent fill the
interface with realistic content so unbounded elements fail visibly; and have it
build a **tuning panel** rather than tuning the values itself —
*"make a tuning panel, shorten the feedback loop, and get to what feels optimal
for your app."*

And the reason all of this matters more now, in Apple's words:

> **Because it's never been easier to produce an app, designing with intention is
> critical to standing out.**
