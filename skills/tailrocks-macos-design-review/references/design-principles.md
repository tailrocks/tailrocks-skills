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
nested levels.* Keep primary content visible; reserve progressive disclosure for
advanced or rare controls.

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

## The inversion: a system default is not automatically slop

Design guidance written for the web treats an untouched default as evidence that
nobody made a decision. Ported to macOS unexamined, that rule actively damages
the work — because on this platform many defaults **are** the considered choice.

These are decisions, not omissions:

SF Pro for app chrome · SF Mono for code, hashes, addresses, and aligned
technical data · SF Symbols for standard concepts · the accent colour the person
chose · native toolbar, sidebar, inspector, table, form, menu, popover, and sheet
behavior · standard keyboard shortcuts · conventional File / Edit / View / Window
/ Help menus · system active and inactive window appearance · system focus rings
and selection · standard Open, Save, Export, Share, and permission panels ·
system-owned Liquid Glass.

They are shared platform vocabulary. Apple's Familiarity principle is explicit
that established behavior lets people transfer knowledge they already have, and
that things which look alike must behave alike. Replacing that vocabulary to
avoid looking generic spends the user's learning budget to buy the designer's
novelty.

**Identity belongs somewhere else.** A Mac app differentiates through: how it
represents domain content; the vocabulary of its commands and data; a
distinctive but functional visualization; its information-density strategy; a
direct-manipulation model specific to the work; the tone of its empty and error
states; a restrained semantic accent; domain-specific symbols; its app icon;
editorial voice; one or two tuned transitions; and how completely it preserves
and restores a workspace.

It does not differentiate through a custom title bar, replaced standard
controls, exotic typography inside an inspector, or brand tint on every glass
surface.

This produces a second, subtler failure mode worth naming, because a capable
model falls into it while trying to avoid the first: **overcorrected output.**
Exotic fonts in operational UI, forced asymmetry, custom window chrome,
animation on every state, a signature detail on every screen, standard controls
rejected for looking ordinary. Generic output and overcorrected output are both
failures to decide — one defaults to the statistical centre, the other defaults
to visible effort.

A restrained, familiar, compact, highly native interface is frequently the
correct answer, and the skill should say so rather than treating restraint as
timidity.

## Familiarity or differentiation

Resolve every candidate departure from the standard with this test, in order:

1. **Is the concept standard on the Mac?** Use the standard pattern.
2. **Is the concept domain-specific?** Design a domain-specific representation.
3. **Is a standard pattern nearly right but insufficient?** Extend it while
   preserving its behavior.
4. **Is the change only visual novelty?** Remove it.

Most proposals that reach step 4 arrived there because nobody asked steps 1
through 3.

## The restraint test

Before adding any visible element — a container, border, icon, animation,
material, or divider — answer:

- What task or hierarchy does it clarify?
- What state does it communicate?
- What would be lost if it were removed?
- Is the system already communicating this?
- Is this one of the few places where expressive attention is genuinely worth
  spending?

If the answer is *nothing*, remove it. Apple's own Simplicity principle is the
same instrument pointed at the whole screen: **in a simple interface, every
element earns its place.**

## The citizenship tests

Judge platform fit by observable behavior, never by toolkit branding alone.
Native implementation is neither sufficient nor a substitute for these checks:

1. Standard application, File, Edit, View, Window, and Help menus exist in the
   expected order with conventional items.
2. Settings opens from the standard command and keyboard shortcut in a proper
   settings window.
3. Services and context-menu integration work where the selected content permits.
4. Text fields retain system editing behavior, substitutions, selection,
   accessibility, and keyboard conventions.
5. Icons, symbols, typography, spacing, and window behavior belong to the current
   platform rather than importing another platform's chrome.
6. Menu bar commands, keyboard shortcuts, multiple windows, tooltips, hover,
   drag-and-drop, inactive-window state, and focus rings behave coherently.
7. System capabilities are integrated through narrow platform mechanisms rather
   than imitated in custom UI.

The key criterion is citizenship: familiarity, customization where it serves the
work, accessibility, and deliberate craft. A custom toolkit can imitate pixels
and still fail every behavioral test; a standard component can still be arranged
badly. Test the result.

### Icons

Treat the platform icon shape as the composition canvas, not as a container
holding a smaller legacy icon. Failure modes: a square icon merely masked to the
shape, an old icon auto-scaled onto neutral gray, or a second custom-colored
shape nested inside the system shape. Preserve product identity while matching
platform visual weight. Verify small-size legibility and every supported
background.

## Naming is an evaluable axis

Test a name on fit, expectation, and portability across languages, markets, and
contexts. Remove filler, avoid repetition, lead with the user's reason, and keep
a controlled vocabulary. Branding earns space only when functional; the window
does not need to repeatedly announce which product is open.

## Inclusion as a design axis

Support multiple senses, provide relevant customization, adopt the accessibility
API, and track inclusion debt. Design the environment to adapt to people rather
than assuming one body, input, language, or perception.

## Human judgment and agent exploration

The person retains the critical design decisions, edge-case judgment, and final
say. An agent explores structurally different options, fills them with realistic
fixtures, exposes tunable values through a tuning panel, and shortens the
feedback loop. A vague request produces arbitrary layout, guessed features,
anchoring, and feature creep; the experience brief exists to prevent that.

Use broad exploration early, then narrow through explicit selection and
independent review. Never let the same agent generate, review, and bless its own
answer. Real-world use remains the final source of product feedback.
