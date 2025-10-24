# Charcreate

Charcreate is a dark-mode-only React + TypeScript application for building 5e fighter characters with intelligent feature
merging and a transparent audit trail.

## Getting Started

Install dependencies and launch the development server:

```bash
npm install
npm run dev
```

The app persists your progress locally and guides you through three steps:

1. **Foundations** – choose race, background, subclass, ability scores, and class proficiencies.
2. **Features** – resolve feature-driven choices (languages, fighting styles, etc.) and review the resulting toolkit.
3. **Summary** – inspect derived statistics, audit logs, and roll dice with the built-in roller.

## Dice Roller

The roller understands `NdX±K` notation with advantage, disadvantage, and rerolling 1s. The ability score generator uses the
required 4d6 drop-lowest method.

## Data Scope

The MVP includes:

- Races: Human, Aarakocra
- Backgrounds: Acolyte, Soldier
- Class: Fighter (levels 1–20) with the Champion archetype and SRD fighting styles

All data lives in `src/data` and can be extended with additional content. Computation rules follow the precedence order
Subclass → Class → Background → Race as specified.
