import fs from 'fs/promises'
import path from 'path'

const baseDir = path.resolve('.test-build')
const aliasDir = path.join(baseDir, 'node_modules', '@')
const srcDir = path.join(baseDir, 'src')

async function ensureAlias() {
  try {
    await fs.mkdir(path.dirname(aliasDir), { recursive: true })
    const stats = await fs.lstat(aliasDir)
    if (stats.isSymbolicLink() || stats.isDirectory()) {
      await fs.rm(aliasDir, { recursive: true, force: true })
    }
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined
    if (code !== 'ENOENT') {
      throw error
    }
  }

  try {
    await fs.symlink(srcDir, aliasDir, 'dir')
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined
    if (code !== 'EEXIST') {
      throw error
    }
  }
}

await ensureAlias()
