# Project Summary


## Overarching Idea
Charcreate is a module that will allow users to create their own TTRPG characters intelligently. The way that Charcreate will differ from other charactermancers and character creators is the intelligence of creating characters with speed. For example, a Tiefling has Darkvision, but a Twilight Cleric may have an enhanced darkvision due to their class. Instead of having two features showing on the character sheet, the Charcreate will be able to tell that two different features are effecting the darkvision value and instead combine them into an enhanced version of the darkvision and notate the interaction that caused them to combine.

Each character should have an audit trail that allows people to understand the interactions that gives them their core stats.

## MVP
In the past, we're trying to do too much all at once. I'd like to have two working Backgrounds, two working races, and the fighter class built out with dice roller mechanics to build out a character.

## Content
Content for the MVP should be transposed and used from the content provided in the repository. 

## UI/UX
This should be a sleek webapp with dark mode ONLY (no switchers).

---

## Gaps Filled and Proposed Details

The sections below propose concrete structure for the MVP and highlight decisions that need confirmation.

### Goals and Non-Goals (MVP)

- Goals
  - Create a character end-to-end using: 2 races, 2 backgrounds, Fighter class.
  - Apply features intelligently (merge/replace/stack) with a visible audit trail per stat/effect.
  - Include a deterministic dice roller with basic expressions used during creation (e.g., hit points, starting gold, ability score rolls if used).
  - Ship as a dark-mode-only, responsive web app.
- Non-Goals
  - No account system or cloud sync (unless explicitly added).
  - No full rulebook import; limit to selected content for MVP.
  - No multi-system support beyond 5e for MVP.

### MVP Scope — Concrete List

- Races (choose 2): e.g., Human, Dwarf, Elf, Halfling (SRD options)
- Backgrounds (choose 2): e.g., Acolyte, Soldier (SRD)
  - Note: Folder shows `system_5e/5e_background/alcoyte_5e` (possible typo: "acolyte").
- Class: Fighter (SRD subset) with features necessary to build a level 1–5 character for MVP demo.
- Dice Roller: NdX+K, advantage/disadvantage helpers, and simple reroll rules where applicable.
- Output: A single Character Summary view with audit trail per computed field.

### Data Model (Draft)

- Character
  - id, name, level, abilities, proficiencies, inventory, notes
  - raceId, backgroundId, classId, subclassId (optional), featuresApplied: FeatureRef[]
  - stats: computed values (AC, HP, speed, senses, skill bonuses, saves, etc.)
  - auditTrail: Record<string, AuditEntry[]> keyed by stat/effect id
- Feature (generic)
  - id, source (race/background/class/feat), level gating, tags (e.g., sense:darkvision)
  - effects: Effect[] (see below)
- Effect (normalized)
  - target: string (e.g., "senses.darkvision", "hp.max", "proficiency.skills.perception")
  - op: "set" | "add" | "max" | "min" | "replace-tag" | "merge"
  - value: number | string | EffectPayload
  - condition?: Condition (e.g., level>=2, wearingArmor)
- AuditEntry
  - sourceId, description, delta/before/after, rationale (rule used), timestamp

### Rules Engine (Minimal Viable Design)

1. Gather all effects from chosen race/background/class (+level features).
2. Sort by precedence: explicit overrides > class features > background > race (assumption; confirm).
3. Apply operations by target path and op semantics:
   - set: replaces prior value (unless a higher-precedence set exists)
   - add: numeric addition (stacking)
   - max/min: boundary constraints
   - replace-tag/merge: targeted combine for structured values like senses

The engine outputs both final values and a per-target audit trail showing all attempts, winners/losers, and reasons.

### Dice Roller (MVP Contract)

- Input: string expression like `2d6+3`, options: `{ advantage?: boolean, disadvantage?: boolean }`
- Output: `{ total: number, rolls: number[], modifiers: number[], detail: string }`
- Required support
  - NdX (+/− K)
  - Advantage/Disadvantage (keep highest/lowest one d20)
  - Simple rerolls per rule text when present (e.g., reroll 1s once) — optional stretch

### UI/UX Notes (MVP)

- Pages/Sections
  - Start: Choose Race, Background, Class (Fighter), Level (1–5 for demo)
  - Feature Review: Present detected/merged features and conflicts with explanations
  - Character Summary: Final stats with expandable audit logs per stat
- Style: Dark mode only, accessible contrast, keyboard navigable
- Components: Stepper, searchable selects, AuditTrail accordion, DiceRoll modal

### Tech Stack (Proposed; needs confirmation)

- Frontend: React + Vite (or Next.js if routing/SSR desired)
- Language: TypeScript
- State: Redux Toolkit or Zustand (small footprint) for wizard state
- Styling: Tailwind CSS or CSS Modules + a minimal design system
- Testing: Vitest/Jest + React Testing Library
- Packaging: Single-page app for MVP (no backend required)

### Persistence & Auth

- MVP: Local persistence (LocalStorage) for in-progress character
- No auth/accounts for MVP

### Acceptance Criteria (MVP)

- [ ] Create a Fighter character from start to finish using one of the 2 races and 2 backgrounds
- [ ] Correct, merged darkvision (or similar overlapping effect) demonstrated with audit trail
- [ ] HP and starting gold calculated via dice roller with visible roll detail
- [ ] All content shown is SRD or original; no proprietary text
- [ ] App loads fast (<2s on mid-range laptop), responsive on mobile/desktop

### Open Questions for You

1. Content scope/licensing
   - Which exact two races and two backgrounds do you want in MVP? Human and Aarakocra.
   - Can we exclude non-SRD options (e.g., TCE/PHB-exclusive text) from MVP to avoid licensing issues?
   Do not exclude non-SRD options if they are listed in the repo. Assume I am following licensing agreement.
2. Fighter scope
   - What level range should MVP support for Fighter? Is 1–5 sufficient? 1-20
   - Do we need any Fighting Style options beyond SRD-permitted ones for MVP? Fighting Styles are in repo under 5e_fighting_style
3. Rules precedence
   - What precedence order should we enforce when features conflict (race vs background vs class vs subclass)? Subclass, Class, Background, Race
   - Should subclass features be part of MVP, or deferred? Champion is listed in 5e_subclasses in repo.
4. Dice roller
   - Do we need ability score generation methods (e.g., 4d6 drop lowest) in MVP, or will scores be input? 4d6 drop lowest in MVP
   - Do we need reroll mechanics like "reroll 1s" on a per-feature basis in MVP? Yes.
5. Tech choices
   - Preference between React+Vite vs Next.js? Any constraints on TypeScript, Tailwind, or state libs? No constraints.
6. UI details
   - Any brand guidelines, fonts, or specific component libraries you prefer? No.
   - Is mobile a first-class target for MVP? No.
7. Persistence
   - Is LocalStorage persistence enough for MVP, or do you want a lightweight backend later? LocalStorage persistence is enough for MVP.