type CacheEntry = { value: any; expiresAt: number }

const cache = new Map<string, CacheEntry>()

export function cacheGet(key: string) {
  const e = cache.get(key)
  if (!e) return null
  if (Date.now() > e.expiresAt) {
    cache.delete(key)
    return null
  }
  return e.value
}

export function cacheSet(key: string, value: any, ttlMs = 1000 * 60) {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs })
}

export function enforceSizeLimit(variants: any[], max = 500) {
  if (!Array.isArray(variants)) return { ok: false, error: 'Variants must be an array' }
  if (variants.length > max) return { ok: false, error: `Too many variants (max ${max})` }
  return { ok: true }
}

export function withTimeout<T>(p: Promise<T>, ms = 2000): Promise<T> {
  let timeout: NodeJS.Timeout
  const t = new Promise<T>((_resolve, reject) => {
    timeout = setTimeout(() => reject(new Error('timeout')), ms)
  })
  return Promise.race([p, t]).then((res) => {
    clearTimeout(timeout)
    return res as T
  })
}
