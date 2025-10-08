import type { AdminFormField } from './formConfig'
import type { AdminModelKey } from './models'

export type ParsedAdminFormData = {
  ok: true
  data: Record<string, any>
}

export type FailedAdminFormData = {
  ok: false
  errors: string[]
}

export type ParseAdminFormDataResult = ParsedAdminFormData | FailedAdminFormData

function coerceString(value: string, required: boolean) {
  const trimmed = value.trim()
  if (trimmed === '') {
    return required ? { ok: false as const, error: 'This field is required.' } : { ok: true as const, value: null }
  }
  return { ok: true as const, value: trimmed }
}

function coerceInt(value: string, required: boolean) {
  if (value.trim() === '') {
    if (required) {
      return { ok: false as const, error: 'This field is required.' }
    }
    return { ok: true as const, value: null }
  }

  const parsed = Number(value)
  if (!Number.isInteger(parsed)) {
    return { ok: false as const, error: 'Enter a whole number.' }
  }

  return { ok: true as const, value: parsed }
}

function coerceJson(value: string, required: boolean) {
  if (value.trim() === '') {
    if (required) {
      return { ok: false as const, error: 'This field is required.' }
    }
    return { ok: true as const, value: null }
  }

  try {
    const parsed = JSON.parse(value)
    return { ok: true as const, value: parsed }
  } catch (error) {
    if (error instanceof Error) {
      return { ok: false as const, error: `Invalid JSON: ${error.message}` }
    }
    return { ok: false as const, error: 'Invalid JSON value.' }
  }
}

export function parseAdminFormData(
  formData: FormData,
  fields: AdminFormField[],
): ParseAdminFormDataResult {
  const data: Record<string, any> = {}
  const errors: string[] = []

  for (const field of fields) {
    const rawValue = formData.get(field.name)

    if (rawValue === null) {
      if (field.required) {
        errors.push(`${field.label} is required.`)
      }
      continue
    }

    if (typeof rawValue !== 'string') {
      errors.push(`${field.label} has an invalid value.`)
      continue
    }

    let result:
      | { ok: true; value: any }
      | { ok: false; error: string }

    switch (field.type) {
      case 'string':
        result = coerceString(rawValue, Boolean(field.required))
        break
      case 'int':
        result = coerceInt(rawValue, Boolean(field.required))
        break
      case 'json':
        result = coerceJson(rawValue, Boolean(field.required))
        break
      default:
        result = { ok: false, error: 'Unsupported field type.' }
        break
    }

    if (!result.ok) {
      errors.push(`${field.label}: ${result.error}`)
      continue
    }

    data[field.name] = result.value
  }

  if (errors.length > 0) {
    return { ok: false, errors }
  }

  return { ok: true, data }
}

export function describeAdminFormErrors(model: AdminModelKey, errors: string[]): string {
  const prefix = errors.length > 1 ? `${errors.length} validation errors` : 'Validation error'
  return `${prefix} for ${model}: ${errors.join(' ')}`
}
