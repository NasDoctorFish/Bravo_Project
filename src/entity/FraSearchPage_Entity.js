//  ENTITY

export class FundRaisingActivity {
  /**
   * @param {Object} data
   */
  constructor(data = {}) {
    this.fraId         = data.fraId         ?? data.id ?? String(Date.now() + Math.random())
    this.userId        = data.userId        ?? ''   // PK2, FK — owner

    
    this.title         = data.title         ?? ''
    this.name          = data.name          ?? data.title ?? ''   // alias kept from diagram
    this.description   = data.description   ?? ''
    this.targetAmount  = Number(data.targetAmount  ?? data.goal          ?? 0)
    this.currentAmount = Number(data.currentAmount ?? data.raised        ?? 0)
    this.status        = data.status        ?? 'pending'  // 'active' | 'completed' | 'pending'
    this.createdBy     = data.createdBy     ?? data.organizer ?? ''
    this.categoryId    = data.categoryId    ?? data.category  ?? ''
    this.createdAt     = data.createdAt     ? new Date(data.createdAt) : new Date()

    this.image         = data.image         ?? ''
  }

  static validate(data) {
    if (!data.title || !String(data.title).trim()) {
      throw new Error('Campaign title is required.')
    }
    if (String(data.title).trim().length > 120) {
      throw new Error('Title must be 120 characters or fewer.')
    }
    if (!data.description || !String(data.description).trim()) {
      throw new Error('Campaign description is required.')
    }
    if (!data.targetAmount || Number(data.targetAmount) <= 0) {
      throw new Error('Target amount must be greater than zero.')
    }
    if (!data.userId) {
      throw new Error('A valid user (userId) is required to own this campaign.')
    }
    if (!data.categoryId && !data.category) {
      throw new Error('Category is required.')
    }
  }

  /**
   * @param {string} userId
   * @param {Object} fields - title, description, targetAmount, categoryId, etc.
   * @returns {FundRaisingActivity}
   */
  static create(userId, fields = {}) {
    FundRaisingActivity.validate({ ...fields, userId })
    return new FundRaisingActivity({
      ...fields,
      userId,
      status:        'pending',
      currentAmount: 0,
      createdAt:     new Date(),
    })
  }

  /**
   * @param {string} userId
   * @param {FundRaisingActivity[]} store - in-memory data source
   * @returns {FundRaisingActivity[]}
   */
  static readByUser(userId, store = []) {
    if (!userId) throw new Error('userId is required.')
    return store.filter(fra => fra.userId === userId)
  }

  /**
   * @param {string} fraId
   * @param {FundRaisingActivity[]} store
   * @returns {FundRaisingActivity|null}
   */
  static readById(fraId, store = []) {
    if (!fraId) throw new Error('fraId is required.')
    return store.find(fra => fra.fraId === fraId) ?? null
  }

  /**
   * @param {FundRaisingActivity} toUpdate - existing instance
   * @param {Object} changes - partial field updates
   * @returns {FundRaisingActivity}
   */
  static update(toUpdate, changes = {}) {
    if (!(toUpdate instanceof FundRaisingActivity)) {
      throw new Error('toUpdate must be a FundRaisingActivity instance.')
    }
    const merged = { ...toUpdate, ...changes }
    FundRaisingActivity.validate(merged)
    return new FundRaisingActivity(merged)
  }

  /**
   * @param {string} userId
   * @param {string} fraId
   * @param {boolean} hard - true = remove from store, false = mark inactive
   * @param {FundRaisingActivity[]} store
   * @returns {boolean}
   */
  static delete(userId, fraId, hard = false, store = []) {
    const index = store.findIndex(
      fra => fra.fraId === fraId && fra.userId === userId
    )
    if (index === -1) return false

    if (hard) {
      store.splice(index, 1)
    } else {
      store[index].status = 'deleted'   // soft delete
    }
    return true
  }

  /**
   * @param {string} kw - search keyword
   * @param {FundRaisingActivity[]} store
   * @returns {FundRaisingActivity[]}
   */
  static searchByKeyword(kw, store = []) {
    if (!kw || !kw.trim()) return [...store]
    const lower = kw.trim().toLowerCase()
    return store.filter(fra =>
      fra.title.toLowerCase().includes(lower)       ||
      fra.description.toLowerCase().includes(lower) ||
      fra.createdBy.toLowerCase().includes(lower)   ||
      fra.categoryId.toLowerCase().includes(lower)
    )
  }

  /** Percentage of target reached (0–100) */
  get progressPercent() {
    if (!this.targetAmount) return 0
    return Math.min(Math.round((this.currentAmount / this.targetAmount) * 100), 100)
  }

  /** True when the campaign has passed its target */
  get isFullyFunded() {
    return this.currentAmount >= this.targetAmount
  }

  /** True when campaign is running and not yet fully funded */
  get isOpen() {
    return this.status === 'active' && !this.isFullyFunded
  }

  toJSON() {
    return {
      fraId:         this.fraId,
      userId:        this.userId,
      title:         this.title,
      name:          this.name,
      description:   this.description,
      targetAmount:  this.targetAmount,
      currentAmount: this.currentAmount,
      status:        this.status,
      createdBy:     this.createdBy,
      categoryId:    this.categoryId,
      createdAt:     this.createdAt.toISOString(),
      image:         this.image,
    }
  }
}