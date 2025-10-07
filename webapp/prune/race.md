# Race Table

Stores playable race data, including traits, abilities, and source info.

## Headers & Examples

- `id`: Unique integer identifier. Example: `1`
- `name`: Race name. Example: `Elf`
- `source`: Book/source. Example: `PHB`
- `size`: Size category (JSON). Example: `[ "Medium" ]`
- `speed`: Movement speed (JSON). Example: `{ "walk": 30 }`
- `ability`: Ability score bonuses (JSON). Example: `{ "dex": 2 }`
- `traitTags`: Tags for traits. Example: `[ "Darkvision" ]`
- `languageProficiencies`: Languages known (JSON). Example: `[ "Common", "Elvish" ]`
- `entries`: Descriptive text (JSON). Example: `[ "Elves are a magical people..." ]`
- `otherSources`, `reprintedAs`, `copy`, etc.: Metadata and source info.

---
Races may have many optional fields for traits, resistances, and proficiencies.