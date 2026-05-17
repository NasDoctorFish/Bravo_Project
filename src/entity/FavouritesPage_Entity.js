//  ENTITY — Favourites

const STORAGE_KEY = 'fundrise-favourites'

export class Favourites {
  /**
   * @param {Object} data
   */
  constructor(data = {}) {
    // --- Identity (PK / FK) ---
    this.favouriteId = data.favouriteId ?? String(Date.now() + Math.random())
    this.userid      = data.userid      ?? ''   // FK → UserAccount.userid
    this.fraid       = data.fraid       ?? ''   // FK → FundRaisingActivity.fraid

    this.savedAt     = data.savedAt ? new Date(data.savedAt) : new Date()
  }

  /**
   * @param {Object} data
   */
  static validate(data) {
    if (!data.userid || !String(data.userid).trim()) {
      throw new Error('A valid userid is required to save a favourite.')
    }
    if (!data.fraid || !String(data.fraid).trim()) {
      throw new Error('A valid fraid (campaign) is required to save a favourite.')
    }
  }

  static create(userid, fraid, store = []) {
    Favourites.validate({ userid, fraid })

    const record = new Favourites({ userid, fraid })
    store.push(record)
    Favourites._persist(store)
    return record.favouriteId
  }

  static delete(userid, fraid, store = []) {
    Favourites.validate({ userid, fraid })

    const before = store.length
    const index  = store.findIndex(f => f.userid === userid && f.fraid === fraid)
    if (index === -1) return false

    store.splice(index, 1)
    Favourites._persist(store)
    return store.length < before
  }

  static readByUser(userid, store = []) {
    if (!userid) throw new Error('userid is required.')
    return store
      .filter(f => f.userid === userid)
      .sort((a, b) => b.savedAt - a.savedAt)
  }

  static exists(userid, fraid, store = []) {
    return store.some(f => f.userid === userid && f.fraid === fraid)
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
      userid:      this.userid,
      fraid:       this.fraid,
      savedAt:     this.savedAt.toISOString(),
    }
  }
}