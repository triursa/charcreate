export const ADMIN_MODELS = [
  { key: 'spell', label: 'Spells', singularLabel: 'Spell', prismaModel: 'Spell' },
  { key: 'race', label: 'Races', singularLabel: 'Race', prismaModel: 'Race' },
  { key: 'item', label: 'Items', singularLabel: 'Item', prismaModel: 'Item' },
  { key: 'background', label: 'Backgrounds', singularLabel: 'Background', prismaModel: 'Background' },
  { key: 'feat', label: 'Feats', singularLabel: 'Feat', prismaModel: 'Feat' },
  { key: 'class', label: 'Classes', singularLabel: 'Class', prismaModel: 'Class' },
] as const

export type AdminModelMeta = (typeof ADMIN_MODELS)[number]
export type AdminModelKey = AdminModelMeta['key']

export const DEFAULT_ADMIN_MODEL: AdminModelMeta = ADMIN_MODELS[0]

const ADMIN_MODEL_LOOKUP = new Map<string, AdminModelMeta>(
  ADMIN_MODELS.map(option => [option.key, option] as const),
)

export type ParseAdminModelResult =
  | { ok: true; model: AdminModelKey; meta: AdminModelMeta }
  | { ok: false; error: string; fallback: AdminModelKey; meta: AdminModelMeta }

export function isAdminModelKey(value: string | null | undefined): value is AdminModelKey {
  if (!value) return false
  const normalized = value.trim().toLowerCase()
  return ADMIN_MODEL_LOOKUP.has(normalized)
}

export function getAdminModelMeta(model: AdminModelKey): AdminModelMeta {
  return ADMIN_MODEL_LOOKUP.get(model) ?? DEFAULT_ADMIN_MODEL
}

export function parseAdminModelParam(value: string | null | undefined): ParseAdminModelResult {
  const fallbackMeta = DEFAULT_ADMIN_MODEL

  if (!value) {
    return {
      ok: false,
      error: 'Missing model parameter.',
      fallback: fallbackMeta.key,
      meta: fallbackMeta,
    }
  }

  const normalized = value.trim().toLowerCase()
  const match = ADMIN_MODEL_LOOKUP.get(normalized)

  if (!match) {
    return {
      ok: false,
      error: `Unsupported model "${value}".`,
      fallback: fallbackMeta.key,
      meta: fallbackMeta,
    }
  }

  return { ok: true, model: match.key, meta: match }
}

export function normalizeAdminModel(value: string | null | undefined): AdminModelKey {
  const result = parseAdminModelParam(value)
  return result.ok ? result.model : result.fallback
}
