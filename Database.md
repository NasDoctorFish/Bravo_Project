Here is the English version. 

You can organize **only the attributes by Entity** like this.

## 1. AuthSession

| Attribute | Type     | Key    |
| --------- | -------- | ------ |
| sessionId | String   | PK     |
| userId    | String   | FK, PK |
| isAdmin   | Boolean  |        |
| loginAt   | Datetime |        |
| expireAt  | Datetime |        |

---

## 2. UserAccount

| Attribute | Type   | Key |
| --------- | ------ | --- |
| userId    | String | PK  |
| email     | String |     |
| password  | String |     |

---

## 3. UserProfile

| Attribute | Type     | Key    |
| --------- | -------- | ------ |
| userId    | String   | PK, FK |
| name      | String   |        |
| role      | String   |        |
| createdAt | Datetime |        |

---

## 4. FundRaisingActivity

| Attribute     | Type     | Key     |
| ------------- | -------- | ------- |
| fraId         | String   | PK      |
| userId        | String   | PK?, FK |
| title         | String   |         |
| description   | String   |         |
| targetAmount  | float    |         |
| currentAmount | float    |         |
| status        | String   |         |
| createdBy     | String   |         |
| category      | String   |         |
| createdAt     | Datetime |         |
| name          | String   |         |

Note: `userId` appears to be marked as `<<PK, FK>>` in the diagram, but normally it is more natural to keep it as **FK only**. Using only `fraId` as the PK is cleaner.

---

## 5. Donation

| Attribute  | Type     | Key                     |
| ---------- | -------- | ----------------------- |
| donationId | String   | PK                      |
| userId     | String   | FK → UserAccount.userId |
| fraId      | String   | FK                      |
| amount     | float    |                         |
| donatedAt  | Datetime |                         |

---

## 6. Category

| Attribute    | Type   | Key |
| ------------ | ------ | --- |
| categoryId   | String | PK  |
| categoryName | String |     |

---

## 7. ActivityViewLog

| Attribute    | Type     | Key          |
| ------------ | -------- | ------------ |
| activityId   | String   | PK           |
| targetId     | String   | FK           |
| targetName   | String   |              |
| timestamp    | DateTime |              |
| userId       | String   | FK, Nullable |
| source       | String   |              |
| referralData | String   |              |
| eventType    | String   |              |

Based on the side note:

| Attribute  | Meaning                                         |
| ---------- | ----------------------------------------------- |
| targetType | `"FRA"` or `"STORY"`                            |
| targetId   | fraId or storyId                                |
| eventType  | `"VIEW"` or `"CLICK"` or `"SAVE"` or `"DONATE"` |

Note: `targetType` is not included inside the diagram box, but it appears in the side note. In the actual database design, **targetType should also be added as an attribute.**

---

## 8. Favourites

| Attribute   | Type   | Key     |
| ----------- | ------ | ------- |
| favouriteId | String | PK      |
| userId      | String | PK?, FK |
| fraId       | String | PK?, FK |

Usually, you should choose one of the two approaches below.

### Option A: Use favouriteId

| Attribute   | Key |
| ----------- | --- |
| favouriteId | PK  |
| userId      | FK  |
| fraId       | FK  |

### Option B: Use a composite key

| Attribute | Key    |
| --------- | ------ |
| userId    | PK, FK |
| fraId     | PK, FK |

If `favouriteId` exists, there is no need to make `userId` and `fraId` part of the PK.

---

## 9. Story

| Attribute | Type     | Key |
| --------- | -------- | --- |
| storyId   | String   | PK  |
| fraId     | String   | FK  |
| title     | String   |     |
| content   | String   |     |
| createdAt | DateTime |     |
| status    | String   |     |

---

## 10. Report

| Attribute     | Type     | Key     |
| ------------- | -------- | ------- |
| reportId      | String   | PK      |
| targetId      | String   | PK?, FK |
| reportMonth   | String   |         |
| reportSummary | String   |         |
| generatedDate | Datetime |         |

Note: `targetId` also appears to be marked as `<<PK, FK>>` in the diagram, but normally it is more natural to use only `reportId` as the PK and keep `targetId` as an FK.

---

# Overall Attribute Summary

| Entity              | Attributes                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------------ |
| AuthSession         | sessionId, userId, isAdmin, loginAt, expireAt                                                                |
| UserAccount         | userId, email, password                                                                                      |
| UserProfile         | userId, name, role, createdAt                                                                                |
| FundRaisingActivity | fraId, userId, title, description, targetAmount, currentAmount, status, createdBy, category, createdAt, name |
| Donation            | donationId, userId, fraId, amount, donatedAt                                                                 |
| Category            | categoryId, categoryName                                                                                     |
| ActivityViewLog     | activityId, targetId, targetName, timestamp, userId, source, referralData, eventType                         |
| Favourites          | favouriteId, userId, fraId                                                                                   |
| Story               | storyId, fraId, title, content, createdAt, status                                                            |
| Report              | reportId, targetId, reportMonth, reportSummary, generatedDate                                                |
