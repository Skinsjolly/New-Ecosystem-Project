# Aurora — Social Media Platform

A modern, original social media app (distinct from Twitter/Bluesky) that runs **entirely on Firebase** —
no custom backend. Authentication, database, file storage, and analytics are all provided by your
Firebase project (the `vibesky-1bd36` project). The frontend is a Vite + React + TypeScript single-page
app, deployable anywhere static hosting works (Cloudflare Pages, Vercel, Netlify, Firebase Hosting).

## A. Project structure

```
vibesky/
├─ index.html                    # SPA entry
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
├─ tailwind.config.js            # brand palette
├─ postcss.config.js
├─ firestore.rules               # Firestore security rules
├─ firestore.indexes.json        # required composite indexes
├─ storage.rules                 # Storage security rules
├─ .env.example / .env.local     # Firebase config (env overridable)
├─ public/
│  ├─ favicon.svg
│  └─ _redirects                 # Cloudflare SPA fallback (/* /index.html 200)
└─ src/
   ├─ main.tsx                   # React root + Router + AuthProvider
   ├─ App.tsx                    # Route table + protected routes
   ├─ index.css                  # global theme (dark, gradient brand)
   ├─ types/index.ts             # Profile, Post, Comment, Notification types
   ├─ lib/
   │  ├─ firebase.ts             # Firebase init (auth, firestore, storage, analytics)
   │  └─ db.ts                   # data layer: users, posts, likes, reposts,
   │                             #   comments, follows, notifications, search
   ├─ context/AuthContext.tsx    # user + profile state, profile auto-provision
   ├─ components/
   │  ├─ Avatar.tsx              # image or gradient-initials avatar
   │  ├─ Layout.tsx              # header nav + mobile bottom nav + unread badge
   │  ├─ PostCard.tsx            # feed card w/ like/repost/comment
   │  ├─ PostComposer.tsx        # create post + optional image upload
   │  ├─ FollowButton.tsx
   │  ├─ CommentSection.tsx
   │  └─ EditProfileModal.tsx    # name/handle/bio/avatar
   └─ pages/
      ├─ Login.tsx / Signup.tsx  # Firebase email/password auth
      ├─ Feed.tsx                # For You (following) + Global tabs, load more
      ├─ PostDetail.tsx          # single post + comments
      ├─ Profile.tsx             # handle route, stats, posts, edit
      ├─ Notifications.tsx       # likes/comments/reposts/follows
      └─ Search.tsx              # search users + posts
```

### Data model (Firestore collections)

- `users/{uid}` — profile: `handle`, `handleLower`, `name`, `bio`, `avatarUrl`, `bannerUrl`,
  `postCount`, `followerCount`, `followingCount`, `createdAt`
- `users/{uid}/following/{targetUid}` and `users/{uid}/followers/{followerUid}` — follow graph
- `users/{uid}/notifications/{id}` — `type` (`like|comment|repost|follow`), actor info, `postId`, `read`, `createdAt`
- `posts/{id}` — author denormalized (`authorId/handle/name/avatar`), `text`, `imageUrl`,
  `type` (`post|repost`), `originalPostId`, counts, `tokens` (search)
- `posts/{id}/likes/{uid}`, `posts/{id}/reposts/{uid}` — presence docs
- `posts/{id}/comments/{id}` — comment bodies

## B. Setup instructions

Prerequisites: Node.js 18+, a Firebase project, and the Firebase CLI (`npm i -g firebase-tools`).

1. **Install dependencies**

   ```bash
   cd vibesky
   npm install
   ```

2. **Point Firebase at your project.** Copy `.env.example` to `.env.local` and edit if you use a
   different project. Defaults already match the `vibesky-1bd36` project (Firebase web SDK config).

3. **Enable Firebase services** in the Firebase console (Project Settings → your app):
   - **Authentication** → Sign-in method → enable **Email/Password**
   - **Firestore Database** → create in production or test mode (switch to test mode is fastest
     locally; deploy the provided rules before going public)
   - **Storage** → create and enable
   - **Analytics** (optional) — enabled automatically in the browser

4. **Deploy security rules** (important before real users):

   ```bash
   firebase login
   firebase init firestore   # use the existing firestore.rules/indexes files when prompted
   firebase deploy --only firestore:rules,firestore:storage
   ```

   (If storage isn't initialized yet, run `firebase init storage` first.)

5. **Run locally**

   ```bash
   npm run dev        # http://localhost:5173
   ```

   Optional emulators: set `VITE_FIREBASE_EMULATORS=true`, then
   `firebase emulators:start` (add `--only auth,firestore,storage`). The app auto-connects to
   emulators on `localhost:9099/8080/9199`.

6. **Production build**

   ```bash
   npm run build      # outputs to dist/
   ```

## C. Deployment guide — Cloudflare Pages

1. **Push your code to GitHub/GitLab** (the `vibesky/` folder, or the whole repo).

2. **Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git** and pick the repo.

3. **Build configuration**
   - Framework preset: **Vite** (or set manually)
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `vibesky` (if the app lives in a subfolder of your repo)

4. **Environment variables.** In **Settings → Environment variables → Production** add each
   `VITE_FIREBASE_*` value from `.env.local` (the SDK config for the `vibesky-1bd36` project).
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`
   - Leave `VITE_FIREBASE_EMULATORS` unset.

5. **SPA routing.** The `public/_redirects` file (`/* /index.html 200`) is copied into `dist/`
   automatically so client-side routes (`/post/:id`, `/:handle`, …) don't 404 on refresh.
   Optionally add a Pages *Function* (`functions/[[path]].ts` returning `index.html`) if you prefer.

6. **Deploy.** Save → Cloudflare builds and serves your app at
   `https://<project>.pages.dev`. Each git push
   redeploys automatically.

### Database hosting

Firebase Firestore is the database (serverless, globally replicated) — no external DB needed. If you
ever outgrow Firestore, the `lib/db.ts` layer is the single place to swap to a REST/GraphQL backend
(Neon/Postgres or Supabase) behind Cloudflare Workers.

## D. Production checklist

**Performance**
- Realtime listeners are scoped (`limit` + `orderBy`); counts are denormalized on the post doc so
  the feed doesn't do fan-out reads.
- Avatars/images use Firebase Storage URLs + browser lazy loading; keep images under ~1MB.
- Use Cloudflare's CDN caching for static assets (default) and enable edge caching headers if you add
  Pages Functions later.

**Security**
- Deploy `firestore.rules` / `storage.rules` (never run in test mode publicly). Rules restrict writes
  to authenticated owners, keep comment/like/repost creation verified by `request.auth.uid`.
- Email/password auth only — Firebase handles hashing/salting and session tokens automatically.
- Client-side `VITE_FIREBASE_*` values are public by design; **never** put Firebase Admin SDK keys or
  service accounts in the frontend.
- Add Firebase App Check (reCAPTCHA/reCAPTCHA Enterprise) before public launch to block API abuse.

**Common pitfalls**
- Forgetting to enable Email/Password auth → signup fails with `auth/operation-not-allowed`.
- Not deploying rules → write errors like `Missing or insufficient permissions`.
- Missing composite indexes → Firestore returns `FAILED_PRECONDITION` with a console link; click it to
  create the index (also in `firestore.indexes.json`).
- Hardcoded config mismatch → keep `.env` values in sync with the Firebase Console web app settings.
- Missing `_redirects` on Cloudflare → deep links 404 on refresh.
- Not running `npm run build` in the Pages root folder when the app is in a subdirectory.
