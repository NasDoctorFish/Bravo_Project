````md
# Supabase Setup Guide for Vue + Vite + TypeScript

## 1. Install Supabase Client

```bash
npm install @supabase/supabase-js
````

## 2. Create `.env.local`

Create this file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_or_anon_key
```

Example project structure:

```txt
Project_Bravo/
├─ .env.local
├─ package.json
└─ src/
```

## 3. Create Supabase Client File

Create:

```txt
src/lib/supabaseClient.ts
```

```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabasePublicKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string

if (!supabaseUrl || !supabasePublicKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabasePublicKey)
```

## 4. Use Supabase in Vue / TypeScript

```ts
import { supabase } from '../lib/supabaseClient'

const { data, error } = await supabase
  .from('Category')
  .select('*')

if (error) {
  console.error(error)
} else {
  console.log(data)
}
```

## 5. Insert Data Example

```ts
const { data, error } = await supabase
  .from('Category')
  .insert([
    {
      title: 'Food',
      description: 'Food related category'
    }
  ])
  .select()
```

## 6. Restart Dev Server

After editing `.env.local`, restart Vite:

```bash
Ctrl + C
npm run dev
```

## Important Notes

* Use `VITE_` prefix for Vue + Vite environment variables.
* Do not use `NEXT_PUBLIC_`; that is for Next.js.
* Never expose `service_role` key in frontend code.
* Use only anon key or publishable key in Vue.

```
```
