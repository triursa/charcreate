import type { AdminModelKey } from './models'

type AdminFieldType = 'string' | 'int' | 'json'

export type AdminFormField = {
  name: string
  label: string
  type: AdminFieldType
  required?: boolean
  placeholder?: string
  helpText?: string
}

export type AdminModelFormConfig = {
  fields: AdminFormField[]
}

const JSON_HELP_TEXT = 'Provide valid JSON. Leave blank to store null.'

export const ADMIN_FORM_CONFIG: Record<AdminModelKey, AdminModelFormConfig> = {
  spell: {
    fields: [
      { name: 'name', label: 'Name', type: 'string', required: true },
      { name: 'level', label: 'Level', type: 'int', required: true },
      { name: 'school', label: 'School', type: 'string' },
      { name: 'time', label: 'Casting Time', type: 'json', helpText: JSON_HELP_TEXT },
      { name: 'range', label: 'Range', type: 'json', helpText: JSON_HELP_TEXT },
      { name: 'components', label: 'Components', type: 'json', helpText: JSON_HELP_TEXT },
      { name: 'duration', label: 'Duration', type: 'json', helpText: JSON_HELP_TEXT },
      { name: 'entries', label: 'Entries', type: 'json', helpText: JSON_HELP_TEXT },
      { name: 'areaTags', label: 'Area Tags', type: 'json', helpText: JSON_HELP_TEXT },
      { name: 'miscTags', label: 'Misc Tags', type: 'json', helpText: JSON_HELP_TEXT },
      { name: 'damageInflict', label: 'Damage Inflict', type: 'json', helpText: JSON_HELP_TEXT },
      { name: 'damageResist', label: 'Damage Resist', type: 'json', helpText: JSON_HELP_TEXT },
      { name: 'damageImmune', label: 'Damage Immune', type: 'json', helpText: JSON_HELP_TEXT },
      { name: 'damageVulnerable', label: 'Damage Vulnerable', type: 'json', helpText: JSON_HELP_TEXT },
      { name: 'savingThrow', label: 'Saving Throw', type: 'json', helpText: JSON_HELP_TEXT },
    ],
  },
  race: {
    fields: [
      { name: 'name', label: 'Name', type: 'string', required: true },
      { name: 'source', label: 'Source', type: 'string' },
      { name: 'size', label: 'Size', type: 'json', helpText: JSON_HELP_TEXT },
      { name: 'speed', label: 'Speed', type: 'json', helpText: JSON_HELP_TEXT },
      { name: 'ability', label: 'Ability', type: 'json', helpText: JSON_HELP_TEXT },
      { name: 'traitTags', label: 'Trait Tags', type: 'json', helpText: JSON_HELP_TEXT },
      { name: 'languageProficiencies', label: 'Language Proficiencies', type: 'json', helpText: JSON_HELP_TEXT },
      { name: 'entries', label: 'Entries', type: 'json', helpText: JSON_HELP_TEXT },
    ],
  },
  item: {
    fields: [
      { name: 'name', label: 'Name', type: 'string', required: true },
      { name: 'type', label: 'Type', type: 'string' },
      { name: 'entries', label: 'Entries', type: 'json', helpText: JSON_HELP_TEXT },
      { name: 'rarity', label: 'Rarity', type: 'string' },
      { name: 'value', label: 'Value (gp)', type: 'int' },
      { name: 'weight', label: 'Weight (lb)', type: 'int' },
    ],
  },
  background: {
    fields: [
      { name: 'name', label: 'Name', type: 'string', required: true },
      { name: 'source', label: 'Source', type: 'string' },
      { name: 'entries', label: 'Entries', type: 'json', helpText: JSON_HELP_TEXT },
      { name: 'skillProficiencies', label: 'Skill Proficiencies', type: 'json', helpText: JSON_HELP_TEXT },
      { name: 'toolProficiencies', label: 'Tool Proficiencies', type: 'json', helpText: JSON_HELP_TEXT },
      { name: 'languages', label: 'Languages', type: 'json', helpText: JSON_HELP_TEXT },
      { name: 'feature', label: 'Feature', type: 'json', helpText: JSON_HELP_TEXT },
    ],
  },
  feat: {
    fields: [
      { name: 'name', label: 'Name', type: 'string', required: true },
      { name: 'entries', label: 'Entries', type: 'json', helpText: JSON_HELP_TEXT },
      { name: 'prerequisite', label: 'Prerequisite', type: 'json', helpText: JSON_HELP_TEXT },
    ],
  },
  class: {
    fields: [
      { name: 'name', label: 'Name', type: 'string', required: true },
      { name: 'primaryAbility', label: 'Primary Ability', type: 'json', helpText: JSON_HELP_TEXT },
      { name: 'hitDice', label: 'Hit Dice', type: 'string' },
      { name: 'proficiencies', label: 'Proficiencies', type: 'json', helpText: JSON_HELP_TEXT },
      { name: 'classFeatures', label: 'Class Features', type: 'json', helpText: JSON_HELP_TEXT },
      { name: 'subclassFeatures', label: 'Subclass Features', type: 'json', helpText: JSON_HELP_TEXT },
      { name: 'spellcasting', label: 'Spellcasting', type: 'json', helpText: JSON_HELP_TEXT },
    ],
  },
}

export function getAdminFormConfig(model: AdminModelKey) {
  return ADMIN_FORM_CONFIG[model]
}
