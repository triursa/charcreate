# Background Table

Stores character backgrounds, including proficiencies, features, and flavor text.

## Headers & Examples

- `id`: Unique integer identifier. Example: `1`
- `name`: Background name. Example: `Acolyte`
- `entries`: Description/flavor (JSON). Example: `[ "You have spent your life in service..." ]`
- `skillProficiencies`: Skills granted (JSON). Example: `[ "Insight", "Religion" ]`
- `toolProficiencies`: Tools granted (JSON). Example: `[ "Calligrapher's Supplies" ]`
- `languages`: Languages granted (JSON). Example: `[ "Elvish" ]`
- `feature`: Special feature (JSON). Example: `{ "Shelter of the Faithful" }`

---
Backgrounds provide roleplay hooks and mechanical bonuses.