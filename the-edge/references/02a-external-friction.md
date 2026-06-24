# Step 2a: The External Friction

**Principle:** Name the specific, visible thing that's going wrong. The surface problem the user could describe to a colleague at lunch.

## The rules

1. **Concrete, not abstract.** "Inefficiency" is wrong. "Pipeline runs take 4 hours and break twice a week" is right.
2. **Framed from the user's side, not the product's side.** "They don't have our dashboard" is wrong. "They can't see which prompts are regressing in production" is right.
3. **Observable.** Something you could point to. Logs, time, money, missed work, broken thing.
4. **One main external friction.** Not a list.

## Opening probe

> What's literally going wrong in their world right now? The surface problem.

## Pushback probes (yes-and pattern)

If the answer is abstract ("inefficiency," "lack of visibility," "poor experience," "complexity"):
> "[Their word]" is the right instinct. Let's make it concrete. What's the actual thing happening on a Tuesday afternoon that makes them open a browser tab and start looking for a fix?

If the answer is framed around the product ("they don't have X," "they're missing Y"):
> That's how the product sees it. From their side: what's the actual problem they'd describe to a colleague over lunch?

If the answer is a list of three problems:
> All three are real. Let's pick the loudest one. Which problem do they hit first, most often, or most painfully?

If the answer is a feeling rather than a fact ("they're stressed"):
> The feeling's coming in step 2b. For now: what's the *thing* that's broken? The fact, not the feeling.

If the answer is too general ("they're trying to grow"):
> That's the goal. Now the obstacle. What's standing between them and growth?

## What passing looks like

A single sentence naming a concrete, observable problem in the user's world.

Examples of the *shape* (do not show these to the user):
- "Their LLM evals are ad-hoc spreadsheets, so regressions ship to production before anyone notices."
- "Their dbt project takes 4+ hours per run and breaks more often as the team scales."
- "Their website looks like it was built before their product was good, and prospects bounce before they see what's underneath."

When the answer passes, mirror it back, confirm, and move to Step 2b.
