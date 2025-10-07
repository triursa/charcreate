# Class Table

Stores all character classes, including features, spellcasting, and progression.

## Headers & Examples

- `id`: Unique integer identifier. Example: `1`
- `name`: Class name. Example: `Wizard`
- `primaryAbility`: Main ability (JSON). Example: `[ "Intelligence" ]`
- `hitDice`: Hit dice. Example: `d6`
- `proficiencies`: Proficiencies (JSON). Example: `[ "Daggers", "Quarterstaff" ]`
- `classFeatures`: Features (JSON). Example: `[ "Arcane Recovery" ]`
- `subclassFeatures`: Subclass features (JSON). Example: `[ "School of Evocation" ]`
- `spellcasting`: Spellcasting info (JSON). Example: `{ "cantrips": 3, "spellsKnown": 6 }`

---
Classes define core character progression and abilities.