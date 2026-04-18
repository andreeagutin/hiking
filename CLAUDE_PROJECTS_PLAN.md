# Learning Plan: Using Claude Projects for Hike'n'Seek

*Goal: use Claude across the full dev cycle — planning → coding → debugging → shipping — without losing context between sessions.*

---

## Step 1 — Set Up Your Claude Project (Do This Once)

### 1.1 Create the Project
Go to **claude.ai → Projects → New Project**. Name it `Hike'n'Seek`.

### 1.2 Paste Your Project Instructions
In the Project Instructions box, paste the full contents of your `CLAUDE.md` file. This is the single most important thing — it means every conversation in this project starts with Claude already knowing:
- your full tech stack and folder structure
- every schema (Hike, POI, Restaurant, User)
- all API routes and auth flows
- known gotchas (the port conflict, the `#` in passwords, etc.)
- your design system and CSS variables
- routing conventions, i18n pattern, component locations

**Keep CLAUDE.md updated.** Every time you add a major feature, update CLAUDE.md and re-paste it into the Project Instructions. Think of it as your "Claude brain" — the more accurate it is, the less you'll need to re-explain.

### 1.3 Upload Key Files to the Project
Upload these files once to the Project (they'll be available in all conversations):
- `src/App.jsx` — routing logic
- `src/index.css` — design tokens + component styles
- `src/i18n.js` — all translation keys
- `server/index.js` — Express entry point
- `ROADMAP.md` — so Claude always knows what's planned vs. built

You don't need to upload everything — just the files Claude needs to make consistent decisions.

---

## Step 2 — Learn the 4 Conversation Types

Different dev cycle phases need different conversation setups. Learn these 4 patterns and you'll get consistent, high-quality output every time.

### Type A: Feature Planning Conversation
**Use when:** You're starting a new roadmap item and want to think through the approach before writing any code.

**How to start:**
```
I want to implement [feature] from ROADMAP.md. 
Before writing any code, let's plan the approach. 

Here's what already exists that's relevant:
[paste 1–2 relevant existing files or excerpts]

Questions I want answered:
1. What files will need to change?
2. Are there any gotchas or conflicts with the existing architecture?
3. What order should I tackle the changes?
```

**Example for Hike'n'Seek:**
```
I want to build the "Tracked Hikes" feature — users can log that they 
completed a hike, with optional date and notes. 

The User model already has: [paste User.js]
The Hike model already has: [paste relevant parts of Hike.js]

Before coding: what's the cleanest way to add this without breaking 
the existing JWT auth flow?
```

---

### Type B: Implementation Conversation
**Use when:** You have a clear plan and want Claude to write the actual code.

**The golden rule: paste the exact file(s) Claude needs to modify.**

Don't say "update the hike form." Say:
```
Here is the current AdminHikeForm.jsx (full file):
[paste file]

Task: Add a "Completed" checkbox + date picker to the Family & Safety 
section. Follow the existing pattern for boolean fields (see the 
`familyFriendly` checkbox). Store as `completedDate: Date | null` in 
the hike schema.

Output: the updated section only (lines 340–420), not the whole file.
```

**Why this works:**
- Claude sees your exact naming conventions, spacing, and patterns
- It won't invent a `useState` pattern you're not using
- Asking for a section (not whole file) avoids token limit issues and is faster to review

---

### Type C: Debugging Conversation
**Use when:** Something's broken and you don't know why.

**Template:**
```
Bug: [what's happening vs. what should happen]

Error message (exact):
[paste error]

Relevant code:
[paste the specific function/component, not the whole file]

What I already tried:
[list 1–3 things]

Environment: [e.g., "dev server, nodemon, MongoDB Atlas connected"]
```

**Example:**
```
Bug: The AI search returns filters correctly but the hike cards don't 
filter — all hikes still show.

No console error. Network tab shows the correct JSON response from 
/api/ai-search.

Relevant code — the filter application in HeroSearch.jsx:
[paste the useEffect/filter logic block]

Already tried: console.logged the filters object — it's correct. 
Checked that setFilters is being called — it is.
```

This structure gets you to the answer in 1–2 exchanges instead of 5–6.

---

### Type D: Refactor / Cleanup Conversation
**Use when:** You want to improve existing code — extract a component, clean up CSS, fix inconsistencies.

**Template:**
```
Refactor task: [what you want to improve and why]

Constraint: [what must NOT change — behavior, API shape, class names used elsewhere]

Here's the current code:
[paste it]
```

---

## Step 3 — The Context Handoff (Solving the "Forgets Context" Problem)

Even with Project Instructions set, sometimes a conversation gets long and Claude loses track. Use this technique:

**At the end of any conversation where you made progress, ask:**
```
Summarize what we just built/decided in 5 bullet points. 
I'll paste this as context at the start of my next conversation.
```

Then start your next conversation with:
```
Continuing from last session. Here's what was done:
- [paste bullet points]

Next task: [what you're doing now]
```

This is your "save state" pattern. Takes 30 seconds and eliminates 80% of re-explaining.

---

## Step 4 — Task Sizing (What to Ask in One Conversation)

**Too big (split it up):**
- "Build the user profile page" — this touches backend routes, frontend components, auth, i18n, CSS
- "Implement notifications" — architecture decision + multiple files + testing

**Just right:**
- "Add the `completedDate` field to the Hike schema and the admin form"
- "Write the `/api/users/me/hikes` endpoint that returns hikes the user has tracked"
- "Create the `TrackedBadge` component that shows on HikeCard when a user has completed that hike"

**Rule of thumb:** One conversation = one file that changes significantly, or one API endpoint + its schema change. If it touches 4+ files, plan first (Type A), then implement in separate focused conversations.

---

## Step 5 — Your Hike'n'Seek Workflow in Practice

Here's how to apply this to your actual roadmap:

### Starting a new roadmap phase
1. Open a **Type A: Planning** conversation
2. Paste the relevant section from ROADMAP.md
3. Ask Claude to break it into individual implementation tasks sized for one conversation each
4. Save that task list — it becomes your queue

### Building a feature
1. Open a new conversation for each task in the queue
2. Start with: "Task: [task name]. [paste relevant existing file(s)]"
3. Implement → test → if something breaks, start a **Type C: Debug** conversation
4. When the task is done, update CLAUDE.md if you added something architecturally significant

### Weekly maintenance
- Every week or two, open a conversation and ask Claude to review your CLAUDE.md against recent changes: "Here are the files I changed this week: [list]. Does CLAUDE.md need updating?"

---

## Quick Reference Card

| Situation | Conversation Type | Must Include |
|-----------|------------------|--------------|
| Starting a new feature | A — Planning | ROADMAP.md excerpt + relevant existing files |
| Writing new code | B — Implementation | The exact file(s) to modify + clear task |
| Something is broken | C — Debug | Error message + specific broken code + what you tried |
| Cleaning up code | D — Refactor | Current code + what must not change |
| Long session, context drifting | — | Ask for 5-bullet summary, start fresh |

---

## What to Do This Week

1. **Today:** Create the Claude Project in claude.ai, paste CLAUDE.md as instructions, upload the 5 key files listed in Step 1.3
2. **First real task:** Pick one small item from your ROADMAP and practice the Type B: Implementation pattern — paste the file, give a precise task, review the output.
3. **After 2–3 tasks:** Notice which part felt slow (too much re-explaining? output didn't match your style?) and we can tune the approach.

The goal isn't to learn prompting theory — it's to build a repeatable habit for *your* specific project. The patterns above are already calibrated to how Hike'n'Seek is structured.
