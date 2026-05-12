//  ENTITY

export class Donation {
  /**
   * @param {Object} data - raw donation data
   */
  constructor(data = {}) {
    // --- Identity (PK / FK from diagram) ---
    this.donationId  = data.donationId  ?? String(Date.now() + Math.random())
    this.userId      = data.userId      ?? ''    // FK → UserAccount.userId
    this.fraId       = data.fraId       ?? ''    // FK → FundRaisingActivity.fraId

    // --- Core fields ---
    this.amount      = Number(data.amount ?? 0)
    this.donatedAt   = data.donatedAt ? new Date(data.donatedAt) : new Date()

    // --- Optional display fields (carried from boundary data) ---
    this.donorName   = data.donorName   ?? 'Anonymous'
    this.message     = data.message     ?? ''
    this.isAnonymous = data.isAnonymous ?? false
  }

  /**
   * @param {Object} data
   */
  static validate(data) {
    if (!data.fraId || !String(data.fraId).trim()) {
      throw new Error('A campaign (fraId) must be linked to this donation.')
    }
    if (!data.userId || !String(data.userId).trim()) {
      throw new Error('A donor (userId) must be identified for this donation.')
    }
    if (!data.amount || Number(data.amount) <= 0) {
      throw new Error('Donation amount must be greater than zero.')
    }
    if (Number(data.amount) > 1_000_000) {
      throw new Error('Donation amount cannot exceed $1,000,000 per transaction.')
    }
  }

  static create(donation, store = []) {
    Donation.validate(donation)
    const newDonation = new Donation({
      ...donation,
      donationId: String(Date.now() + Math.random()),
      donatedAt:  new Date(),
    })
    store.push(newDonation)
    return newDonation
  }

  static read(donationId, store = []) {
    if (!donationId) throw new Error('donationId is required.')
    return store.find(d => d.donationId === donationId) ?? null
  }

  static readByFra(fraId, store = []) {
    if (!fraId) throw new Error('fraId is required.')
    return store
      .filter(d => d.fraId === fraId)
      .sort((a, b) => b.donatedAt - a.donatedAt)
  }

  static update(existing, changes = {}, store = []) {
    if (!(existing instanceof Donation)) {
      throw new Error('existing must be a Donation instance.')
    }
    const merged = { ...existing, ...changes }
    Donation.validate(merged)

    const index = store.findIndex(d => d.donationId === existing.donationId)
    if (index === -1) throw new Error('Donation not found in store.')

    const updated = new Donation(merged)
    store[index] = updated
    return updated
  }

  static delete(donationId, hard = false, store = []) {
    const index = store.findIndex(d => d.donationId === donationId)
    if (index === -1) return false

    if (hard) {
      store.splice(index, 1)
    } else {
      store[index].status = 'cancelled'   // soft delete
    }
    return true
  }

  //  Getter

  get displayName() {
    return this.isAnonymous ? 'Anonymous' : this.donorName
  }

  get avatarInitial() {
    return this.displayName[0]?.toUpperCase() ?? '?'
  }

  get timeAgo() {
    const diffMs  = Date.now() - this.donatedAt.getTime()
    const diffMin = Math.floor(diffMs / 60_000)
    if (diffMin < 1)   return 'Just now'
    if (diffMin < 60)  return `${diffMin} min${diffMin > 1 ? 's' : ''} ago`
    const diffHr = Math.floor(diffMin / 60)
    if (diffHr < 24)   return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`
    const diffDay = Math.floor(diffHr / 24)
    if (diffDay === 1) return 'Yesterday'
    return `${diffDay} days ago`
  }

  toJSON() {
    return {
      donationId:  this.donationId,
      userId:      this.userId,
      fraId:       this.fraId,
      amount:      this.amount,
      donatedAt:   this.donatedAt.toISOString(),
      donorName:   this.donorName,
      message:     this.message,
      isAnonymous: this.isAnonymous,
    }
  }
}