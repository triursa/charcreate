import assert from 'node:assert/strict'
import { renderToStaticMarkup } from 'react-dom/server'
const sampleEntries = [
  'A line of text with {@damage 2d6}.',
  {
    name: 'At Higher Levels',
    entries: [
      'The damage increases by {@damage 1d6} for each slot level above 1st.',
      {
        type: 'list',
        items: [
          'One creature of your choice',
          {
            entries: ['The target makes a saving throw.']
          }
        ]
      }
    ]
  },
  {
    type: 'table',
    caption: 'Damage by Level',
    colLabels: ['Level', 'Damage'],
    rows: [
      ['1st', '{@damage 2d6}'],
      ['5th', '{@damage 4d6}']
    ]
  }
]

const { renderSpellEntries } = await import('../app/data/ClientTable.js')

const markup = renderToStaticMarkup(<div>{renderSpellEntries(sampleEntries)}</div>)

assert(markup.includes('<b>2d6</b>'))
assert(markup.includes('<b>1d6</b>'))
assert(markup.includes('<table'))
assert(markup.includes('Damage by Level'))

console.log('Spell entry smoke test passed.')
