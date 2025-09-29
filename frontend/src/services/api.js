// Placeholder API service (mock). Swap with real fetch/axios later.
export const api = {
  list: async (key) => {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  },
  create: async (key, item) => {
    const list = await api.list(key)
    const nextId = list.length ? Math.max(...list.map(x => x.id || 0)) + 1 : 1
    const rec = { id: nextId, ...item, createdAt: new Date().toISOString() }
    localStorage.setItem(key, JSON.stringify([rec, ...list]))
    return rec
  },
  update: async (key, id, patch) => {
    const list = await api.list(key)
    const idx = list.findIndex(x => x.id === id)
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...patch, updatedAt: new Date().toISOString() }
      localStorage.setItem(key, JSON.stringify(list))
      return list[idx]
    }
    throw new Error('Not found')
  },
  remove: async (key, id) => {
    const list = await api.list(key)
    const filtered = list.filter(x => x.id !== id)
    localStorage.setItem(key, JSON.stringify(filtered))
    return true
  }
}
