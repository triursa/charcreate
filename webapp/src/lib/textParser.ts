/**
 * Parse and render D&D 5e text entries with cross-references
 */

// Map of reference types to their display formats
const referencePatterns = {
  spell: /\{@spell ([^}|]+)(\|[^}]+)?\}/g,
  item: /\{@item ([^}|]+)(\|[^}]+)?\}/g,
  creature: /\{@creature ([^}|]+)(\|[^}]+)?\}/g,
  class: /\{@class ([^}|]+)(\|[^}]+)?\}/g,
  race: /\{@race ([^}|]+)(\|[^}]+)?\}/g,
  background: /\{@background ([^}|]+)(\|[^}]+)?\}/g,
  feat: /\{@feat ([^}|]+)(\|[^}]+)?\}/g,
  condition: /\{@condition ([^}|]+)(\|[^}]+)?\}/g,
  disease: /\{@disease ([^}|]+)(\|[^}]+)?\}/g,
  damage: /\{@damage ([^}]+)\}/g,
  dice: /\{@dice ([^}]+)\}/g,
  hit: /\{@hit ([^}]+)\}/g,
  dc: /\{@dc ([^}]+)\}/g,
  scaledice: /\{@scaledice ([^}|]+)(\|[^}]+)?\}/g,
  book: /\{@book ([^}|]+)(\|[^}]+)?\}/g,
  adventure: /\{@adventure ([^}|]+)(\|[^}]+)?\}/g,
  filter: /\{@filter ([^}|]+)(\|[^}]+)?\}/g,
  skill: /\{@skill ([^}]+)\}/g,
  sense: /\{@sense ([^}]+)\}/g,
  action: /\{@action ([^}]+)\}/g,
  table: /\{@table ([^}|]+)(\|[^}]+)?\}/g
}

export interface ParsedText {
  type: 'text' | 'link'
  content: string
  linkType?: string
  linkTarget?: string
  linkSource?: string
}

/**
 * Parse a text string and extract cross-references
 */
export function parseTextWithReferences(text: string): ParsedText[] {
  if (!text || typeof text !== 'string') {
    return [{ type: 'text', content: '' }]
  }

  const result: ParsedText[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  // Create a combined regex pattern for all reference types
  const allPatterns = Object.entries(referencePatterns)
  const combinedPattern = new RegExp(
    allPatterns.map(([type, pattern]) => 
      `(${pattern.source})`
    ).join('|'),
    'g'
  )

  while ((match = combinedPattern.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      const beforeText = text.substring(lastIndex, match.index)
      if (beforeText) {
        result.push({ type: 'text', content: beforeText })
      }
    }

    // Determine which pattern matched
    const matchedText = match[0]
    let linkType = ''
    let linkTarget = ''
    let linkSource = ''

    for (const [type, pattern] of allPatterns) {
      const typeMatch = matchedText.match(pattern)
      if (typeMatch) {
        linkType = type
        const parts = typeMatch[1].split('|')
        linkTarget = parts[0]
        linkSource = parts[1] || parts[0]
        break
      }
    }

    // Handle special cases for formatting
    if (linkType === 'damage' || linkType === 'dice' || linkType === 'hit') {
      result.push({ 
        type: 'text', 
        content: linkTarget 
      })
    } else if (linkType === 'dc') {
      result.push({ 
        type: 'text', 
        content: `DC ${linkTarget}` 
      })
    } else {
      result.push({
        type: 'link',
        content: linkTarget,
        linkType,
        linkTarget,
        linkSource
      })
    }

    lastIndex = combinedPattern.lastIndex
  }

  // Add remaining text
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex)
    if (remainingText) {
      result.push({ type: 'text', content: remainingText })
    }
  }

  return result.length > 0 ? result : [{ type: 'text', content: text }]
}

/**
 * Convert entries array to readable text
 */
export function formatEntries(entries: any[]): string {
  if (!Array.isArray(entries)) {
    return typeof entries === 'string' ? entries : ''
  }

  return entries.map(entry => {
    if (typeof entry === 'string') {
      return entry
    } else if (entry && typeof entry === 'object') {
      if (entry.type === 'entries' && entry.entries) {
        return formatEntries(entry.entries)
      } else if (entry.type === 'list' && entry.items) {
        return entry.items.map((item: any) => `• ${formatEntries([item])}`).join('\n')
      } else if (entry.type === 'table' && entry.rows) {
        return `[Table: ${entry.caption || 'Data Table'}]`
      }
      return entry.name || entry.text || ''
    }
    return ''
  }).filter(text => text.length > 0).join('\n\n')
}

/**
 * Extract plain text from complex entry structures
 */
export function extractPlainText(content: any): string {
  if (typeof content === 'string') {
    // Remove all reference tags and return plain text
    return content.replace(/\{@[^}]+\}/g, (match) => {
      // Extract the display text from references
      const parts = match.slice(2, -1).split(' ')
      if (parts.length > 1) {
        const target = parts.slice(1).join(' ')
        return target.split('|')[0]
      }
      return match
    })
  } else if (Array.isArray(content)) {
    return content.map(extractPlainText).join(' ')
  } else if (content && typeof content === 'object') {
    if (content.entries) {
      return extractPlainText(content.entries)
    } else if (content.items) {
      return extractPlainText(content.items)
    } else if (content.text) {
      return extractPlainText(content.text)
    }
  }
  return ''
}

/**
 * Format ability scores for display
 */
export function formatAbilityScore(score: number): string {
  const modifier = Math.floor((score - 10) / 2)
  const sign = modifier >= 0 ? '+' : ''
  return `${score} (${sign}${modifier})`
}

/**
 * Format spell level for display
 */
export function formatSpellLevel(level: number): string {
  if (level === 0) return 'Cantrip'
  if (level === 1) return '1st level'
  if (level === 2) return '2nd level'
  if (level === 3) return '3rd level'
  return `${level}th level`
}

/**
 * Convert school abbreviation to full name
 */
export function getSchoolName(abbreviation: string): string {
  const schools: Record<string, string> = {
    'A': 'Abjuration',
    'C': 'Conjuration',
    'D': 'Divination',
    'E': 'Enchantment',
    'V': 'Evocation',
    'I': 'Illusion',
    'N': 'Necromancy',
    'T': 'Transmutation'
  }
  return schools[abbreviation] || abbreviation
}

/**
 * Format duration for display
 */
export function formatDuration(duration: any[]): string {
  if (!Array.isArray(duration) || duration.length === 0) {
    return 'Unknown'
  }

  return duration.map(d => {
    if (d.type === 'instant') return 'Instantaneous'
    if (d.type === 'permanent') return 'Permanent'
    if (d.type === 'timed' && d.duration) {
      const amount = d.duration.amount || 1
      const unit = d.duration.type || 'round'
      return amount === 1 ? `1 ${unit}` : `${amount} ${unit}s`
    }
    return d.type || 'Unknown'
  }).join(', ')
}

/**
 * Format range for display
 */
export function formatRange(range: any): string {
  if (!range) return 'Unknown'
  
  if (range.type === 'point') {
    if (range.distance?.type === 'self') return 'Self'
    if (range.distance?.type === 'touch') return 'Touch'
    if (range.distance?.type === 'sight') return 'Sight'
    if (range.distance?.amount) {
      return `${range.distance.amount} ${range.distance.type || 'feet'}`
    }
  }
  
  return range.type || 'Unknown'
}