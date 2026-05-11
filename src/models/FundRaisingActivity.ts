// FundRaisingActivity.ts
// Create campaign (FR-2-01), Edit existing campaign details (FR-2-02), Mark campaign as completed (FR-2-08)

export class FundRaisingActivity {
  // Entity fields
  fraId:         string
  userId:        string
  title:         string
  description:   string
  targetAmount:  number
  currentAmount: number
  status:        string
  createdBy:     string
  categoryId:    string
  createdAt:     Date
  name:          string

  constructor(data: {
    fraId:         string
    userId:        string
    title:         string
    description:   string
    targetAmount:  number
    currentAmount: number
    status:        string
    createdBy:     string
    categoryId:    string
    createdAt:     Date | string
    name:          string
  }) {
    this.fraId         = data.fraId
    this.userId        = data.userId
    this.title         = data.title
    this.description   = data.description
    this.targetAmount  = data.targetAmount
    this.currentAmount = data.currentAmount
    this.status        = data.status
    this.createdBy     = data.createdBy
    this.categoryId    = data.categoryId
    this.createdAt     = new Date(data.createdAt)
    this.name          = data.name
  }

  // FR-2-01: Create a new FRA
  static async create(
    userId: string,
    payload: {
      title:        string
      description:  string
      targetAmount: number
      categoryId:   string
    },
    accessToken: string
  ): Promise<FundRaisingActivity> {
    const response = await fetch(`${BASE_URL}/fra`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ userId, ...payload }),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || 'Failed to create fundraising activity')
    }

    const data = await response.json()
    return new FundRaisingActivity(data.fra)
  }

  // Read all FRAs for a user
  static async readByUser(
    userId: string,
    accessToken: string
  ): Promise<FundRaisingActivity[]> {
    const response = await fetch(`${BASE_URL}/fra?userId=${userId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || 'Failed to fetch fundraising activities')
    }

    const data = await response.json()
    return (data.fras as any[]).map(f => new FundRaisingActivity(f))
  }

  // Read a single FRA by fraId
  static async readById(
    fraId: string,
    accessToken: string
  ): Promise<FundRaisingActivity> {
    const response = await fetch(`${BASE_URL}/fra/${fraId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || 'Failed to fetch fundraising activity')
    }

    const data = await response.json()
    return new FundRaisingActivity(data.fra)
  }

  // FR-2-02: Update an existing FRA
  static async update(
    toUpdate: Partial<FundRaisingActivity> & { fraId: string },
    accessToken: string
  ): Promise<FundRaisingActivity> {
    const response = await fetch(`${BASE_URL}/fra/${toUpdate.fraId}`, {
      method: 'PUT',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(toUpdate),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || 'Failed to update fundraising activity')
    }

    const data = await response.json()
    return new FundRaisingActivity(data.fra)
  }

  // FR-2-08: Update only the status field (instance method)
  async updateStatus(
    status: string,
    accessToken: string
  ): Promise<void> {
    const response = await fetch(`${BASE_URL}/fra/${this.fraId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || 'Failed to update status')
    }

    // Reflect the new status locally
    this.status = status
  }

  // Delete a FRA
  static async delete(
    userId: string,
    fraId: string,
    hard: boolean,
    accessToken: string
  ): Promise<boolean> {
    const response = await fetch(
      `${BASE_URL}/fra/${fraId}?userId=${userId}&hard=${hard}`,
      {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      }
    )

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || 'Failed to delete fundraising activity')
    }

    return true
  }
}