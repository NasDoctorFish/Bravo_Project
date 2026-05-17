//  ENTITY — Favourites

const STORAGE_KEY = 'fundrise-favourites'

export class Favourites {
  /**
   * @param {Object} data
   */
  constructor(data = {}) {
    // --- Identity (PK / FK) ---
    this.favouriteId = data.favouriteId ?? String(Date.now() + Math.random())
    this.userId      = data.userId      ?? ''   // FK → UserAccount.userId
    this.fraId       = data.fraId       ?? ''   // FK → FundRaisingActivity.fraId

    this.savedAt     = data.savedAt ? new Date(data.savedAt) : new Date()
  }

  /**
   * @param {Object} data
   */
  static validate(data) {
    if (!data.userId || !String(data.userId).trim()) {
      throw new Error('A valid userId is required to save a favourite.')
    }
    if (!data.fraId || !String(data.fraId).trim()) {
      throw new Error('A valid fraId (campaign) is required to save a favourite.')
    }
  }

  static create(userId, fraId, store = []) {
    Favourites.validate({ userId, fraId })

    const record = new Favourites({ userId, fraId })
    store.push(record)
    Favourites._persist(store)
    return record.favouriteId
  }

  static delete(userId, fraId, store = []) {
    Favourites.validate({ userId, fraId })

    const before = store.length
    const index  = store.findIndex(f => f.userId === userId && f.fraId === fraId)
    if (index === -1) return false

    store.splice(index, 1)
    Favourites._persist(store)
    return store.length < before
  }

  static readByUser(userId, store = []) {
    if (!userId) throw new Error('userId is required.')
    return store
      .filter(f => f.userId === userId)
      .sort((a, b) => b.savedAt - a.savedAt)
  }

  static exists(userId, fraId, store = []) {
    return store.some(f => f.userId === userId && f.fraId === fraId)
  }

  static loadFromStorage() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      return Array.isArray(raw)
        ? raw.map(d => new Favourites(d))
        : []
    } catch {
      return []
    }
  }

  static _persist(store = []) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store.map(f => f.toJSON())))
    } catch {
      // Storage unavailable — fail silently
    }
  }

  toJSON() {
    return {
      favouriteId: this.favouriteId,
      userId:      this.userId,
      fraId:       this.fraId,
    }
  }
}