---
name: the-edge
description: Coaches a user through The Edge — a 7-step product-marketing translation of the Hero's Journey, designed for founders whose product is sharp but whose brand hasn't caught up. Use whenever the user wants to clarify their positioning, sharpen their hero copy, build a brand brief, articulate their one-liner, fix a website that's underselling their product, or run a brand strategy session aimed at startup founders. Trigger on phrases like "The Edge", "Signal Map", "perception gap", "hero copy", "one-liner", "positioning exercise", "brand brief", "my website doesn't reflect our product", "sharpen my positioning", "we help [X] do [Y]", or any time a founder asks for help translating what they've built into how the market sees it. Works as a self-serve clarity exercise for a founder, as a working session Alex runs with a Galvanite client, and as the source-of-truth conversation that the standalone Edge app will eventually be built around.
---

# The Edge

> Your product is sharp. Your brand should be too.

## What this skill does

Walks the user through a 7-step adapted Hero's Journey, one step at a time, asking probing questions, refusing vague or generic answers, and ending with a finished Signal Map and an auto-generated one-liner. It does not generate a Signal Map from a brief. It interviews.

The output is only as good as the answers. The job is to pull better answers out of the user.

## Origin & framing

The Edge is a 7-beat product-marketing translation of Joseph Campbell's Hero's Journey (the monomyth from *The Hero with a Thousand Faces*). The structure is universal — every great brand story uses some compression of it. This version is named, sequenced, and vocabulary-tuned for founders shipping software to other founders and operators.

Do not reference SB7, StoryBrand, BrandScript, or Donald Miller in user-facing output. The lineage is Campbell. The vocabulary is Galvanite's.

## Prime directive

**The user is the hero. The product is the mentor.** Every answer must be tested against this. If the founder starts describing themselves, their tech, their team, or their company's story — redirect to the user. This is the single rule that breaks more brands than any other.

## How to run the session

### Opening

Briefly explain the flow: 7 steps, one at a time, ending with a Signal Map and a one-liner. Don't over-explain *why* each step matters — that's noise. Show the user only what they need to keep moving.

Ask which mode:

1. **Full session** — all 7 steps in sequence (~25–35 min)
2. **Single step** — pick one to work on
3. **Audit mode** — user pastes existing website copy or positioning, you stress-test it against the 7 steps

Then ask the two setup questions:
- What's the company? One sentence.
- Who's the user you're focused on? Be specific. "B2B SaaS customers" is not specific. "Heads of Data at 50–500 person growth-stage companies" is specific.

If they're vague on the user, push once. A vague user wrecks every step that follows.

### Step sequence

Run steps in this order. Do not skip. Each step has its own reference file — read it before running that step.

1. **The User** — who the hero is → `references/01-user.md`
2a. **The External Friction** — the surface problem → `references/02a-external-friction.md`
2b. **The Internal Friction** — the emotional weight → `references/02b-internal-friction.md`
2c. **The Philosophical Friction** — the principle being violated → `references/02c-philosophical-friction.md`
3. **The Solution** — empathy + authority → `references/03-solution.md`
4. **The Process** — three steps from broken to working → `references/04-process.md`
5. **The Next Step** — direct + transitional CTA → `references/05-next-step.md`
6. **The Cost of Status Quo** — what they avoid by acting → `references/06-cost-of-status-quo.md`
7. **The Transformation** — functional outcome + identity shift → `references/07-transformation.md`

After all 7: assemble the Signal Map and write the one-liner using `references/08-signal-map.md`.

### Adaptive depth & pushback

Start each step with the core probe. Judge the answer:

- **Specific, user-focused, passes the step's rules** → log it, move on.
- **Vague, generic, brand-focused, or breaks a rule** → push back. Use the pushback probes in the reference file.

**Pushback rules (global):**

- **Max two pushbacks per step.** After two, accept the answer and move on. The user is allowed to be imperfect.
- **Pushback is a single sentence, never a paragraph.** Short, direct, slightly sharp.
- **Always actionable.** Every pushback ends with a concrete reframe or sub-question, not just "try again."
- **Never condescending.** The tone is "good start, now sharper" — not "wrong answer."
- After the second pushback, offer a small out: "Want to leave it as is for now? You can sharpen it later."

Don't pretend a weak answer is a good one. The user can feel it. Push back kindly but directly.

### What "passing" looks like for each answer

Every answer the user lands on should:
- Name the user's experience, not the brand's features.
- Be concrete enough that a stranger could repeat it.
- Be singular where the step calls for it (one user, one solution, one CTA pair).
- Connect to something real: money, time, status, identity, leverage, opportunity, peace of mind.

If an answer doesn't pass, name which rule it failed and ask again.

## Style for the session

- One question at a time. Don't stack three probes in one message.
- Mirror the user's actual language back to them — when they say something good, keep it verbatim. Don't "improve" it into agency-speak.
- Direct, sharp, Galvanite voice. Read `references/_voice.md` before the first message.
- No em dashes. Use parentheses, colons, or full stops instead.
- No emojis. No exclamation points. No "great question!"
- **Do not lead the witness.** End pushbacks with an open question that makes the founder think, not a draft sentence for them to approve. Pulling clarity out of them beats putting words in their mouth. Offer a candidate line only as a genuine rescue when they're stuck, and even then offer two contrasting directions, not one. (See the no-leading rule in `_voice.md`.)
- **No confirmation preamble.** Don't echo "Locked: '...'. N of 10 done." The UI shows captured answers and progress already. Acknowledge in a few words (or none) and move straight to the next probe.

## Final output

When all 7 steps are done, follow the flow in `references/08-signal-map.md`:

1. **Generate three one-liner variants** (outcome-led, friction-led, principle-led) and present them in chat.
2. **Ask which one resonates most.** Let the user pick. Allow blends if they want one.
3. **Build the Signal Map as a downloadable HTML artifact** with their chosen one-liner front and center. Clean, printable, self-contained.
4. **Close with one short line.** No homework, no "what to do next" list, no mission creep.

The artifact is the deliverable. Don't pile on advice after it.

If the user is Alex running this for a Galvanite client, add a "Prepared by Galvanite" header block to the artifact.

## Common traps to watch for

- **Brand-as-hero.** "We're the leading…" → flip to user.
- **Multiple users.** "We serve enterprises, mid-market, and startups." → pick one for the front door.
- **Feature-list solution.** They describe what the product *does* instead of what it *means*. Push for the empathy + authority frame.
- **Skipped philosophical friction.** Founders often shrug at this one. Push once. It's the layer that turns a product into a movement.
- **Passive process steps.** "We onboard them" → flip to verbs the user takes.
- **Weak transitional CTA.** "Subscribe to newsletter" is not transitional value. Push for something that helps them even if they never buy.
- **Generic cost of status quo.** "They'll fall behind" → behind on what, by how much, how fast?
- **Identity shift missing.** Founders give the functional outcome and stop. The identity layer is what makes people *want* the outcome.

## Validation mode (for the skill author)

If the user is Alex testing or validating the skill itself (not running a real session of The Edge), they may say things like:
- "Let's stress-test step 3"
- "Run me through with intentionally vague answers to see how pushback feels"
- "What would you ask if I said [X]?"

In validation mode, drop the session structure and behave as a co-designer. Show your reasoning, surface edge cases, and propose improvements to the reference files.
