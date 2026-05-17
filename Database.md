# Database.md

## 1. Database Overview

This database is for the **FundRise / Fundraising Platform** project.  
The main flow is:

```text
useraccount
→ userprofile
→ role-based entities such as donor, doneeprofile, fundraisingactivity
→ donation, favourites, story, activityviewlog, report
```

The database currently uses integer primary keys with range checks such as:

```sql
CHECK (id >= 1 AND id <= 999)
```

Many tables also use foreign keys connected back to `useraccount(userid)`.

---

## 2. Main Tables

| Table | Purpose |
|---|---|
| `useraccount` | Stores login/account-level information such as email and password. |
| `userprofile` | Stores user display information such as name and role. |
| `authsession` | Stores login session information. |
| `donor` | Stores donor-specific profile and donation statistics. |
| `doneeprofile` | Stores donee-specific profile information. |
| `doneeregistration` | Stores donee registration/review workflow. |
| `category` | Stores fundraising categories. |
| `fundraisingactivity` | Stores fundraising campaigns/activities. |
| `donation` | Stores donation transactions. |
| `favourites` | Stores saved/favourite fundraising activities. |
| `story` | Stores stories/posts related to fundraising activities. |
| `activityviewlog` | Stores user activity logs such as views, clicks, saves, and donations. |
| `report` | Stores generated platform or activity reports. |

---

## 3. Core User Tables

### 3.1 `useraccount`

| Column | Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `userid` | integer | No | null | Primary key |
| `email` | text | No | null | Unique |
| `password` | text | No | null | Account password |

Constraints:

```text
PRIMARY KEY (userid)
UNIQUE (email)
CHECK (userid >= 1 AND userid <= 999)
```

Important issue found:

```text
duplicate key value violates unique constraint "useraccount_pkey"
Key (userid)=(6) already exists.
```

This means the auto-generated `userid` sequence was behind the actual maximum `userid` already stored in the table.

---

### 3.2 `userprofile`

| Column | Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `userid` | integer | No | null | Primary key and foreign key to `useraccount(userid)` |
| `name` | text | No | null | User name |
| `role` | text | No | null | User role |
| `createdat` | timestamptz | No | `now()` | Created time |

Constraints:

```text
PRIMARY KEY (userid)
FOREIGN KEY (userid) REFERENCES useraccount(userid)
CHECK (role IN ('PM', 'DO', 'DR', 'UA'))
```

Important note:

Current frontend signup role values may be:

```text
fundraiser
donee
```

But the database currently only accepts:

```text
PM, DO, DR, UA
```

So the frontend role values must be mapped before insert.

Example:

```ts
const roleMap: Record<string, string> = {
  fundraiser: 'DR',
  donee: 'DO'
}

const dbRole = roleMap[role]
```

---

## 4. Fundraising Tables

### 4.1 `category`

| Column | Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `categoryid` | integer | No | null | Primary key |
| `categoryname` | text | No | null | Unique |
| `categorydescription` | text | Yes | null | Category description |
| `createdat` | timestamptz | No | `now()` | Created time |

Constraints:

```text
PRIMARY KEY (categoryid)
UNIQUE (categoryname)
CHECK (categoryid >= 1 AND categoryid <= 999)
```

---

### 4.2 `fundraisingactivity`

| Column | Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `fraid` | integer | No | null | Primary key |
| `userid` | integer | Yes | null | FK to `useraccount(userid)` |
| `title` | text | Yes | null | Fundraising title |
| `description` | text | Yes | null | Fundraising description |
| `targetamount` | numeric | Yes | null | Target donation amount |
| `currentamount` | numeric | Yes | null | Current raised amount |
| `status` | text | No | `DRAFT` | Campaign status |
| `createdby` | text | Yes | null | Creator |
| `categoryid` | integer | Yes | null | FK to `category(categoryid)` |
| `createdat` | timestamptz | No | `now()` | Created time |

Constraints:

```text
PRIMARY KEY (fraid)
FOREIGN KEY (userid) REFERENCES useraccount(userid)
FOREIGN KEY (categoryid) REFERENCES category(categoryid)
CHECK (fraid >= 1 AND fraid <= 999)
CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'PAUSED', 'COMPLETED', 'REJECTED', 'CANCELLED'))
```

---

### 4.3 `story`

| Column | Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `storyid` | integer | No | null | Primary key |
| `fraid` | integer | No | null | FK to `fundraisingactivity(fraid)` |
| `title` | text | Yes | null | Story title |
| `content` | text | Yes | null | Story content |
| `createdat` | timestamptz | No | `now()` | Created time |
| `status` | text | No | `DRAFT` | Story status |

Constraints:

```text
PRIMARY KEY (storyid)
FOREIGN KEY (fraid) REFERENCES fundraisingactivity(fraid)
CHECK (storyid >= 1 AND storyid <= 999)
CHECK (status IN ('DRAFT', 'POSTED', 'CANCELED'))
```

---

## 5. Donation and Favourite Tables

### 5.1 `donation`

| Column | Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `donationid` | integer | No | null | Primary key |
| `userid` | integer | Yes | null | FK to `useraccount(userid)` |
| `fraid` | integer | Yes | null | FK to `fundraisingactivity(fraid)` |
| `amount` | numeric | Yes | null | Donation amount |
| `donatedat` | timestamptz | No | null | Donation time |

Constraints:

```text
PRIMARY KEY (donationid)
FOREIGN KEY (userid) REFERENCES useraccount(userid)
FOREIGN KEY (fraid) REFERENCES fundraisingactivity(fraid)
CHECK (donationid >= 1 AND donationid <= 999)
```

---

### 5.2 `favourites`

| Column | Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `favouriteid` | integer | No | null | Primary key |
| `userid` | integer | No | null | FK to `useraccount(userid)` |
| `fraid` | integer | No | null | FK to `fundraisingactivity(fraid)` |

Constraints:

```text
PRIMARY KEY (favouriteid)
FOREIGN KEY (userid) REFERENCES useraccount(userid)
FOREIGN KEY (fraid) REFERENCES fundraisingactivity(fraid)
CHECK (favouriteid >= 1 AND favouriteid <= 999)
```

---

## 6. Donor and Donee Tables

### 6.1 `donor`

| Column | Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `donorid` | integer | No | null | Primary key |
| `userid` | integer | No | null | Unique FK to `useraccount(userid)` |
| `donortype` | text | No | `INDIVIDUAL` | Donor type |
| `preferreddonationmethod` | text | Yes | null | Preferred payment method |
| `totaldonationamount` | numeric | No | `0` | Total donation amount |
| `donationcount` | integer | No | `0` | Number of donations |
| `status` | text | No | `ACTIVE` | Donor status |
| `created_at` | timestamptz | No | `now()` | Created time |
| `updated_at` | timestamptz | No | `now()` | Updated time |

Constraints:

```text
PRIMARY KEY (donorid)
UNIQUE (userid)
FOREIGN KEY (userid) REFERENCES useraccount(userid)
CHECK (donorid >= 1 AND donorid <= 999)
CHECK (donationcount >= 0)
CHECK (donortype IN ('INDIVIDUAL', 'ORGANISATION'))
CHECK (preferreddonationmethod IN ('CARD', 'BANK_TRANSFER', 'PAYPAL'))
CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED'))
```

---

### 6.2 `doneeprofile`

| Column | Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `doneeid` | integer | No | null | Primary key |
| `userid` | integer | No | Unique FK to `useraccount(userid)` |
| `bio` | text | Yes | null | Donee bio |
| `bankaccount` | text | Yes | null | Bank account |
| `totalreceived` | double precision | No | `0` | Total received amount |
| `created_at` | timestamptz | No | `now()` | Created time |

Constraints:

```text
PRIMARY KEY (doneeid)
UNIQUE (userid)
FOREIGN KEY (userid) REFERENCES useraccount(userid)
CHECK (doneeid >= 1 AND doneeid <= 999)
```

---

### 6.3 `doneeregistration`

| Column | Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `donee_reg_id` | integer | No | null | Primary key |
| `userid` | integer | No | FK to `useraccount(userid)` |
| `bio` | text | Yes | null | Registration bio |
| `bankaccount` | text | Yes | null | Bank account |
| `status` | text | No | `PENDING` | Review status |
| `submittedat` | timestamptz | No | `now()` | Submission time |
| `reviewedby` | text | Yes | null | Reviewer role |
| `reviewedat` | timestamptz | Yes | null | Review time |
| `notes` | text | Yes | null | Review notes |

Constraints:

```text
PRIMARY KEY (donee_reg_id)
FOREIGN KEY (userid) REFERENCES useraccount(userid)
CHECK (donee_reg_id >= 1 AND donee_reg_id <= 999)
CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
CHECK (reviewedby IN ('PM', 'UA'))
CHECK (reviewedat IS NULL OR submittedat <= reviewedat)
```

---

## 7. Activity and Report Tables

### 7.1 `activityviewlog`

| Column | Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `activityid` | integer | No | null | Primary key |
| `targetid` | integer | No | null | Target object ID |
| `targetname` | text | No | null | Target type name |
| `timestamp` | timestamptz | No | `now()` | Event time |
| `userid` | integer | Yes | null | FK to `useraccount(userid)` |
| `source` | text | Yes | null | Traffic source |
| `referraldata` | text | Yes | null | Referral data |
| `eventtype` | text | Yes | null | Event type |

Constraints:

```text
PRIMARY KEY (activityid)
FOREIGN KEY (userid) REFERENCES useraccount(userid)
CHECK (activityid >= 1 AND activityid <= 999)
CHECK (targetname IN ('fraId', 'donationId', 'userId', 'storyId'))
CHECK (eventtype IN ('VIEW', 'CLICK', 'SAVE', 'DONATE'))
```

---

### 7.2 `report`

| Column | Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `reportid` | integer | No | null | Primary key |
| `targetid` | text | No | null | Target ID |
| `targettype` | text | No | null | Report target type |
| `periodtype` | text | No | null | Report period |
| `startdate` | date | No | null | Report start date |
| `enddate` | date | No | null | Report end date |
| `reportsummary` | text | Yes | null | Report summary |
| `reportcontent` | text | Yes | null | Report content |
| `created_at` | timestamptz | No | `now()` | Created time |
| `chartdata` | jsonb | Yes | null | Chart data |

Constraints:

```text
PRIMARY KEY (reportid)
CHECK (reportid >= 1 AND reportid <= 999)
CHECK (startdate <= enddate)
CHECK (periodtype IN ('DAILY', 'MONTHLY', 'YEARLY', 'CUSTOM'))
CHECK (targettype IN ('fra', 'story', 'donation', 'platform'))
```

---

## 8. Auth Session Table

### `authsession`

| Column | Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `sessionid` | integer | No | null | Primary key |
| `userid` | integer | Yes | null | FK to `useraccount(userid)` |
| `isadmin` | boolean | Yes | `false` | Admin session flag |
| `loginat` | timestamptz | Yes | `now()` | Login time |
| `expireat` | timestamptz | No | null | Expiry time |

Constraints:

```text
PRIMARY KEY (sessionid)
FOREIGN KEY (userid) REFERENCES useraccount(userid)
CHECK (sessionid >= 1 AND sessionid <= 999)
```

---

## 9. Common Database Error: Auto Generated ID Conflict

### Error

```text
duplicate key value violates unique constraint "useraccount_pkey"
Key (userid)=(6) already exists.
```

### Cause

Even when `userid` is auto generated, PostgreSQL uses an internal sequence.  
If sample data was inserted manually with fixed `userid` values, the table may contain IDs up to 100, while the sequence still tries to generate an old value such as 6.

### Check Current Maximum ID

```sql
select max(userid)
from useraccount;
```

### Reset Sequence Automatically

```sql
select setval(
  pg_get_serial_sequence('useraccount', 'userid'),
  coalesce((select max(userid) from useraccount), 0) + 1,
  false
);
```

### Example

If:

```text
max(userid) = 100
```

Then this query sets the next generated ID to 101:

```sql
select setval(
  pg_get_serial_sequence('useraccount', 'userid'),
  101,
  false
);
```

Important:

```text
setval(..., 101, false) → next generated value is 101
setval(..., 101, true)  → next generated value is usually 102
```

---

## 10. Signup Insert Flow

The current signup flow should be:

```text
1. Validate form input
2. Check password confirmation
3. Insert email and password into useraccount
4. Get the generated userid
5. Insert name and role into userprofile with the same userid
6. Redirect to login page
```

Example TypeScript controller:

```ts
export async function create(
  name: string,
  role: string,
  password: string,
  email: string
): Promise<number> {
  if (
    !name?.trim() ||
    !role?.trim() ||
    !password?.trim() ||
    !email?.trim()
  ) {
    throw new Error('Incorrect format data: All required fields must be filled.')
  }

  const cleanEmail = email.trim()
  const cleanPassword = password.trim()
  const cleanName = name.trim()

  const roleMap: Record<string, string> = {
    fundraiser: 'DR',
    donee: 'DO',
    PM: 'PM',
    UA: 'UA',
    DO: 'DO',
    DR: 'DR'
  }

  const cleanRole = roleMap[role.trim()]

  if (!cleanRole) {
    throw new Error('Invalid role selected.')
  }

  const { data: existingUser, error: checkError } = await supabase
    .from('useraccount')
    .select('userid')
    .eq('email', cleanEmail)
    .maybeSingle()

  if (checkError) {
    throw checkError
  }

  if (existingUser) {
    throw new Error('This email is already registered.')
  }

  const { data: accountData, error: accountError } = await supabase
    .from('useraccount')
    .insert([
      {
        email: cleanEmail,
        password: cleanPassword
      }
    ])
    .select('userid')
    .single()

  if (accountError) {
    throw accountError
  }

  if (!accountData?.userid) {
    throw new Error('User account was created, but userid was not returned.')
  }

  const newId = accountData.userid

  const { error: profileError } = await supabase
    .from('userprofile')
    .insert([
      {
        userid: newId,
        name: cleanName,
        role: cleanRole
      }
    ])

  if (profileError) {
    throw profileError
  }

  return newId
}
```

---

## 11. Current Issues to Watch

### 11.1 Role value mismatch

Frontend role values:

```text
fundraiser, donee
```

Database allowed role values:

```text
PM, DO, DR, UA
```

So mapping is required before inserting into `userprofile`.

---

### 11.2 Email duplicate

`useraccount.email` is unique.  
If the same email is inserted twice, the database will reject it.

Check:

```sql
select *
from useraccount
where email = 'test@example.com';
```

Delete test user:

```sql
delete from userprofile
where userid in (
  select userid from useraccount
  where email = 'test@example.com'
);

delete from useraccount
where email = 'test@example.com';
```

---

### 11.3 Primary key sequence mismatch

If `userid` is auto generated but still duplicates an existing ID, reset the sequence.

```sql
select setval(
  pg_get_serial_sequence('useraccount', 'userid'),
  coalesce((select max(userid) from useraccount), 0) + 1,
  false
);
```

---

## 12. Recommended Improvements

### 12.1 Do not store raw passwords

Currently, `useraccount.password` stores plain text passwords.  
For a real application, use Supabase Auth or password hashing.  
For coursework prototype, document this as a simplified implementation.

### 12.2 Use consistent naming

Current database uses names like:

```text
userid, createdat, donatedat
```

This is usable, but snake_case is usually cleaner:

```text
user_id, created_at, donated_at
```

For now, keep current names to avoid breaking existing code.

### 12.3 Add RLS policies before production

If the Supabase anon key is exposed to the frontend, Row Level Security should be enabled before production use.

### 12.4 Keep frontend and database role values consistent

Either change frontend values to:

```text
DO, DR
```

or keep frontend labels and map them in the controller:

```text
donee → DO
fundraiser → DR
```

---

## 13. Useful SQL Commands

### View all user accounts

```sql
select *
from useraccount
order by userid;
```

### View all profiles

```sql
select *
from userprofile
order by userid;
```

### Check highest user ID

```sql
select max(userid)
from useraccount;
```

### Reset useraccount sequence

```sql
select setval(
  pg_get_serial_sequence('useraccount', 'userid'),
  coalesce((select max(userid) from useraccount), 0) + 1,
  false
);
```

### Check duplicate email

```sql
select *
from useraccount
where email = 'test@example.com';
```

### Delete test user safely

```sql
delete from userprofile
where userid in (
  select userid from useraccount
  where email = 'test@example.com'
);

delete from useraccount
where email = 'test@example.com';
```
