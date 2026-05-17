//  ENTITY

export class FundRaisingActivity {
  /**
   * @param {Object} data
   */
  constructor(data = {}) {
    this.fraid         = data.fraid         ?? data.id ?? String(Date.now() + Math.random())
    this.userid        = data.userid        ?? ''   // PK2, FK — owner

    
    this.title         = data.title         ?? ''
    this.name          = data.name          ?? data.title ?? ''   // alias kept from diagram
    this.description   = data.description   ?? ''
    this.target_amount  = Number(data.target_amount  ?? data.goal          ?? 0)
    this.current_amount = Number(data.current_amount ?? data.raised        ?? 0)
    this.status        = data.status        ?? 'pending'  // 'active' | 'completed' | 'pending'
    this.createdby     = data.createdby     ?? data.organizer ?? ''
    this.categoryid    = data.categoryid    ?? data.category  ?? ''
    this.createdat     = data.createdat     ? new Date(data.createdat) : new Date()

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
    if (!data.target_amount || Number(data.target_amount) <= 0) {
      throw new Error('Target amount must be greater than zero.')
    }
    if (!data.userid) {
      throw new Error('A valid user (userid) is required to own this campaign.')
    }
    if (!data.categoryid && !data.category) {
      throw new Error('Category is required.')
    }
  }

  /**
   * @param {string} userid
   * @param {Object} fields - title, description, target_amount, categoryid, etc.
   * @returns {FundRaisingActivity}
   */
  static create(userid, fields = {}) {
    FundRaisingActivity.validate({ ...fields, userid })
    return new FundRaisingActivity({
      ...fields,
      userid,
      status:        'pending',
      current_amount: 0,
      createdat:     new Date(),
    })
  }

  /**
   * @param {string} userid
   * @param {FundRaisingActivity[]} store - in-memory data source
   * @returns {FundRaisingActivity[]}
   */
  static readByUser(userid, store = []) {
    if (!userid) throw new Error('userid is required.')
    return store.filter(fra => fra.userid === userid)
  }

  /**
   * @param {string} fraid
   * @param {FundRaisingActivity[]} store
   * @returns {FundRaisingActivity|null}
   */
  static readById(fraid, store = []) {
    if (!fraid) throw new Error('fraid is required.')
    return store.find(fra => fra.fraid === fraid) ?? null
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
   * @param {string} userid
   * @param {string} fraid
   * @param {boolean} hard - true = remove from store, false = mark inactive
   * @param {FundRaisingActivity[]} store
   * @returns {boolean}
   */
  static delete(userid, fraid, hard = false, store = []) {
    const index = store.findIndex(
      fra => fra.fraid === fraid && fra.userid === userid
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
      fra.createdby.toLowerCase().includes(lower)   ||
      fra.categoryid.toLowerCase().includes(lower)
    )
  }

  /** Percentage of target reached (0–100) */
  get progressPercent() {
    if (!this.target_amount) return 0
    return Math.min(Math.round((this.current_amount / this.target_amount) * 100), 100)
  }

  /** True when the campaign has passed its target */
  get isFullyFunded() {
    return this.current_amount >= this.target_amount
  }

  /** True when campaign is running and not yet fully funded */
  get isOpen() {
    return this.status === 'active' && !this.isFullyFunded
  }

  toJSON() {
    return {
      fraid:         this.fraid,
      userid:        this.userid,
      title:         this.title,
      name:          this.name,
      description:   this.description,
      target_amount:  this.target_amount,
      current_amount: this.current_amount,
      status:        this.status,
      createdby:     this.createdby,
      categoryid:    this.categoryid,
      createdat:     this.createdat.toISOString(),
      image:         this.image,
    }
  }
}