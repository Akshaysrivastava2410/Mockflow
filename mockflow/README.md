# MockFlow

Instant mock APIs. Node + Express + MongoDB + Tailwind (CDN).

## Run
1. Install Node 18+ and MongoDB (local) or use a MongoDB Atlas URI
2. `npm install`
3. `cp .env.example .env` (Windows: `copy .env.example .env`) and set MONGO_URI
4. `npm run dev`
5. Open http://localhost:3000

## Use
Create an API in the dashboard, then call it:
`curl http://localhost:3000/mock/users`

Route params work: create `users/:id`, then call `/mock/users/42`.
