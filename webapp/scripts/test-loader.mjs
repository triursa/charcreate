import path from 'path'
import { pathToFileURL } from 'url'

const baseDir = path.join(process.cwd(), '.test-build/src')

export async function resolve(specifier, context, defaultResolve) {
  if (specifier.startsWith('@/')) {
    const relative = specifier.slice(2)
    const candidatePath = path.join(baseDir, `${relative}.js`)
    return {
      url: pathToFileURL(candidatePath).href,
      shortCircuit: true
    }
  }

  if ((specifier.startsWith('./') || specifier.startsWith('../')) && !specifier.endsWith('.js')) {
    const parentUrl = context.parentURL ?? pathToFileURL(baseDir).href
    const parentPath = path.dirname(new URL(parentUrl).pathname)
    const candidatePath = path.resolve(parentPath, `${specifier}.js`)
    return {
      url: pathToFileURL(candidatePath).href,
      shortCircuit: true
    }
  }

  return defaultResolve(specifier, context, defaultResolve)
}
