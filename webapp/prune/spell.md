# Spell Table

This table stores all spell data from D&D 5e sources. Each spell record contains metadata, mechanics, and descriptive text.

## Headers & Examples

- `id`: Unique integer identifier. Example: `1`
- `name`: Spell name. Example: `Fireball`
- `level`: Spell level (0-9). Example: `3`
- `school`: Magic school. Example: `Evocation`
- `time`: Casting time (JSON). Example: `[ { "number": 1, "unit": "action" } ]`
- `range`: Spell range (JSON). Example: `{ "type": "point", "distance": { "type": "feet", "amount": 150 } }`
- `components`: Required components (JSON). Example: `{ "v": true, "s": true, "m": "bat guano and sulfur" }`
- `duration`: Duration (JSON). Example: `[ { "type": "instant" } ]`
- `entries`: Spell description (JSON array). Example: `[ "A bright streak flashes..." ]`
- `areaTags`, `miscTags`: Tags for area/effects. Example: `[ "AOE" ]`
- `damageInflict`, `damageResist`, `damageImmune`, `damageVulnerable`: Damage types. Example: `[ "fire" ]`
- `savingThrow`: Saving throw required. Example: `[ "dexterity" ]`

---
Spells are highly variable; most fields are JSON to support flexible mechanics and text.