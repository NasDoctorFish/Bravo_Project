import express from 'express'
import type { Request, Response } from 'express'
import cors from 'cors' // Installed cors


/*
Run: npm run dev
Raw Command: node --loader ts-node/esm server.ts"

Install ts-node: npm install -D ts-node

*/

const app = express()
app.use(cors())

app.get('/api/hello', (req: Request, res: Response) => {
    res.json({ message: 'Hello from backend' })
})

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000')
})