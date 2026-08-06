import {
  doc, getDoc, setDoc, updateDoc, addDoc, serverTimestamp,
  collection, query, where, orderBy, limit, onSnapshot,
  getDocs, increment, runTransaction
} from 'firebase/firestore'
import { db } from './firebase'
import type { Profile, Post, Comment, NotificationItem, AuthorPublic } from '../types'

const usersCol = collection(db, 'users')
const postsCol = collection(db, 'posts')

function authorOf(uid: string, profile?: Profile | null): AuthorPublic {
  return {
    authorId: uid,
    authorHandle: profile?.handle ?? 'anonymous',
    authorName: profile?.name ?? 'Anonymous',
    authorAvatar: profile?.avatarUrl ?? ''
  }
}

function mapPost(d: any): Post | null {
  if (!d) return null
  const data = d.data?.() ?? d
  return {
    id: d.id ?? data.id,
    authorId: data.authorId,
    authorHandle: data.authorHandle,
    authorName: data.authorName,
    authorAvatar: data.authorAvatar,
    text: data.text ?? '',
    imageUrl: data.imageUrl ?? '',
    type: data.type ?? 'post',
    originalPostId: data.originalPostId ?? '',
    createdAt: data.createdAt?.seconds ? data.createdAt.seconds * 1000 : Date.now(),
    likeCount: data.likeCount ?? 0,
    repostCount: data.repostCount ?? 0,
    commentCount: data.commentCount ?? 0
  }
}

function mapProfile(d: any): Profile {
  const data = d.data()
  return {
    uid: d.id,
    handle: data.handle,
    name: data.name,
    bio: data.bio ?? '',
    avatarUrl: data.avatarUrl ?? '',
    bannerUrl: data.bannerUrl ?? '',
    postCount: data.postCount ?? 0,
    followerCount: data.followerCount ?? 0,
    followingCount: data.followingCount ?? 0,
    createdAt: data.createdAt?.seconds ? data.createdAt.seconds * 1000 : Date.now()
  }
}

/* ---------------- Users ---------------- */

export function subscribeUser(uid: string, cb: (p: Profile | null) => void) {
  return onSnapshot(doc(usersCol, uid), (s) => cb(s.exists() ? mapProfile(s) : null))
}

export async function getUser(uid: string): Promise<Profile | null> {
  const s = await getDoc(doc(usersCol, uid))
  return s.exists() ? mapProfile(s) : null
}

export async function getUserByHandle(handle: string): Promise<Profile | null> {
  const q = query(usersCol, where('handleLower', '==', handle.toLowerCase()), limit(1))
  const snap = await getDocs(q)
  if (snap.empty) return null
  return mapProfile(snap.docs[0])
}

export async function handleExists(handle: string): Promise<boolean> {
  return (await getUserByHandle(handle)) !== null
}

export async function createProfile(uid: string, handle: string, displayName: string) {
  await setDoc(doc(usersCol, uid), {
    handle: handle.toLowerCase(),
    handleLower: handle.toLowerCase(),
    name: displayName,
    bio: '',
    avatarUrl: '',
    bannerUrl: '',
    postCount: 0,
    followerCount: 0,
    followingCount: 0,
    createdAt: serverTimestamp()
  })
}

export async function updateUserProfile(uid: string, patch: Partial<Profile>) {
  const clean: Record<string, unknown> = { ...patch }
  // username (handle) is permanent and cannot be changed
  delete clean.handle
  delete clean.handleLower
  delete clean.uid
  delete clean.createdAt
  await updateDoc(doc(usersCol, uid), clean)
}

export function searchUsers(term: string, cb: (users: Profile[]) => void): () => void {
  const q = term
    ? query(usersCol, where('handleLower', '>=', term.toLowerCase()), where('handleLower', '<=', term.toLowerCase() + '\uf8ff'), limit(20))
    : query(usersCol, orderBy('followerCount', 'desc'), limit(20))
  return onSnapshot(q, (snap) => cb(snap.docs.map(mapProfile)))
}

/* ---------------- Posts ---------------- */

export async function createPost(uid: string, text: string, imageUrl: string, type: 'post' | 'repost' = 'post', originalPostId = '') {
  const me = await getUser(uid)
  const author = authorOf(uid, me)
  const ref = await addDoc(postsCol, {
    ...author,
    text,
    imageUrl,
    type,
    originalPostId,
    createdAt: serverTimestamp(),
    likeCount: 0,
    repostCount: 0,
    commentCount: 0,
    tokens: tokenize(text)
  })
  await runTransaction(db, async (t) => {
    const uRef = doc(usersCol, uid)
    const snap = await t.get(uRef)
    if (snap.exists()) {
      t.update(uRef, { postCount: increment(1) })
    }
  })
  return ref.id
}

export function subscribeFeed(authorIds: string[], cb: (posts: Post[]) => void): () => void {
  const ids = authorIds.slice(0, 30)
  if (ids.length === 0) {
    const q = query(postsCol, orderBy('createdAt', 'desc'), limit(60))
    return onSnapshot(q, (snap) => cb(snap.docs.map(mapPost).filter(Boolean) as Post[]))
  }
  const chunks: string[][] = []
  for (let i = 0; i < ids.length; i += 10) chunks.push(ids.slice(i, i + 10))
  const unsubs = chunks.map((chunk) =>
    onSnapshot(
      query(postsCol, where('authorId', 'in', chunk), orderBy('createdAt', 'desc'), limit(40)),
      (snap) => cb(snap.docs.map(mapPost).filter(Boolean) as Post[])
    )
  )
  return () => unsubs.forEach((u) => u())
}

export function subscribeGlobalFeed(cb: (posts: Post[]) => void): () => void {
  const q = query(postsCol, where('type', '==', 'post'), orderBy('createdAt', 'desc'), limit(60))
  return onSnapshot(q, (snap) => cb(snap.docs.map(mapPost).filter(Boolean) as Post[]))
}

export async function loadOlderPosts(authorIds: string[], beforeTs: number): Promise<Post[]> {
  const ids = authorIds.slice(0, 30)
  if (ids.length === 0) {
    const q = query(postsCol, where('createdAt', '<', new Date(beforeTs)), orderBy('createdAt', 'desc'), limit(20))
    const snap = await getDocs(q)
    return snap.docs.map(mapPost).filter(Boolean) as Post[]
  }
  const chunks: string[][] = []
  for (let i = 0; i < ids.length; i += 10) chunks.push(ids.slice(i, i + 10))
  const results = await Promise.all(
    chunks.map(async (chunk) => {
      const q = query(postsCol, where('authorId', 'in', chunk), where('createdAt', '<', new Date(beforeTs)), orderBy('createdAt', 'desc'), limit(20))
      const snap = await getDocs(q)
      return snap.docs.map(mapPost).filter(Boolean) as Post[]
    })
  )
  return results.flat().sort((a, b) => b.createdAt - a.createdAt)
}

export function subscribeUserPosts(uid: string, cb: (posts: Post[]) => void): () => void {
  const q = query(postsCol, where('authorId', '==', uid), orderBy('createdAt', 'desc'), limit(100))
  return onSnapshot(q, (snap) => cb(snap.docs.map(mapPost).filter(Boolean) as Post[]))
}

export function subscribePost(postId: string, cb: (p: Post | null) => void): () => void {
  return onSnapshot(doc(postsCol, postId), (s) => cb(s.exists() ? mapPost(s) : null))
}

export async function searchPosts(term: string): Promise<Post[]> {
  const q = query(postsCol, where('tokens', 'array-contains', term.toLowerCase()), orderBy('createdAt', 'desc'), limit(40))
  const snap = await getDocs(q)
  return snap.docs.map(mapPost).filter(Boolean) as Post[]
}

/* ---------------- Likes / Reposts / Comments ---------------- */

export async function toggleLike(postId: string, uid: string) {
  const likeRef = doc(postsCol, postId, 'likes', uid)
  const postRef = doc(postsCol, postId)
  await runTransaction(db, async (t) => {
    const like = await t.get(likeRef)
    if (like.exists()) {
      t.delete(likeRef)
      t.update(postRef, { likeCount: increment(-1) })
    } else {
      t.set(likeRef, { uid, createdAt: serverTimestamp() })
      t.update(postRef, { likeCount: increment(1) })
    }
  })
}

export function subscribeLiked(postId: string, uid: string, cb: (liked: boolean) => void): () => void {
  return onSnapshot(doc(postsCol, postId, 'likes', uid), (s) => cb(s.exists()))
}

export async function toggleRepost(postId: string, uid: string, profile: Profile) {
  const post = await getDoc(doc(postsCol, postId))
  if (!post.exists()) return
  const repostRef = doc(postsCol, postId, 'reposts', uid)
  const postRef = doc(postsCol, postId)
  const mine = await getDoc(repostRef)
  await runTransaction(db, async (t) => {
    if (mine.exists()) {
      t.delete(repostRef)
      t.update(postRef, { repostCount: increment(-1) })
    } else {
      t.set(repostRef, { uid, createdAt: serverTimestamp() })
      t.update(postRef, { repostCount: increment(1) })
      const author = authorOf(uid, profile)
      const body = post.data() as Post
      t.set(doc(postsCol, crypto.randomUUID()), {
        ...author,
        text: body.text,
        imageUrl: body.imageUrl ?? '',
        type: 'repost',
        originalPostId: postId,
        createdAt: serverTimestamp(),
        likeCount: 0,
        repostCount: 0,
        commentCount: 0,
        tokens: []
      })
    }
  })
}

export function subscribeReposted(postId: string, uid: string, cb: (reposted: boolean) => void): () => void {
  return onSnapshot(doc(postsCol, postId, 'reposts', uid), (s) => cb(s.exists()))
}

export async function addComment(postId: string, uid: string, text: string) {
  const me = await getUser(uid)
  const author = authorOf(uid, me)
  const postRef = doc(postsCol, postId)
  const cRef = collection(postRef, 'comments')
  await addDoc(cRef, { ...author, text, createdAt: serverTimestamp() })
  await updateDoc(postRef, { commentCount: increment(1) })
}

export function subscribeComments(postId: string, cb: (comments: Comment[]) => void): () => void {
  const q = query(collection(postsCol, postId, 'comments'), orderBy('createdAt', 'asc'), limit(200))
  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        postId,
        authorId: data.authorId,
        authorHandle: data.authorHandle,
        authorName: data.authorName,
        authorAvatar: data.authorAvatar,
        text: data.text,
        createdAt: data.createdAt?.seconds ? data.createdAt.seconds * 1000 : Date.now()
      }
    }))
  )
}

/* ---------------- Follows ---------------- */

export function subscribeFollowingIds(uid: string, cb: (ids: string[]) => void): () => void {
  return onSnapshot(collection(usersCol, uid, 'following'), (snap) => cb(snap.docs.map((d) => d.id)))
}

export async function toggleFollow(targetUid: string, meUid: string) {
  const myRef = doc(usersCol, meUid)
  const targetRef = doc(usersCol, targetUid)
  const relRef = doc(collection(usersCol, meUid, 'following'), targetUid)
  const otherRef = doc(collection(usersCol, targetUid, 'followers'), meUid)
  let followed = false
  await runTransaction(db, async (t) => {
    const rel = await t.get(relRef)
    if (rel.exists()) {
      t.delete(relRef)
      t.delete(otherRef)
      t.update(myRef, { followingCount: increment(-1) })
      t.update(targetRef, { followerCount: increment(-1) })
    } else {
      t.set(relRef, { uid: targetUid, createdAt: serverTimestamp() })
      t.set(otherRef, { uid: meUid, createdAt: serverTimestamp() })
      t.update(myRef, { followingCount: increment(1) })
      t.update(targetRef, { followerCount: increment(1) })
      followed = true
    }
  })
  if (followed) {
    const me = await getUser(meUid)
    await notify(targetUid, {
      type: 'follow',
      actorId: meUid,
      actorName: me?.name ?? 'Someone',
      actorAvatar: me?.avatarUrl ?? '',
      text: 'started following you',
      postId: ''
    })
  }
}

export function subscribeIsFollowing(meUid: string, targetUid: string, cb: (f: boolean) => void): () => void {
  return onSnapshot(doc(collection(usersCol, meUid, 'following'), targetUid), (s) => cb(s.exists()))
}

/* ---------------- Notifications ---------------- */

export function subscribeNotifications(uid: string, cb: (items: NotificationItem[]) => void): () => void {
  const q = query(collection(usersCol, uid, 'notifications'), orderBy('createdAt', 'desc'), limit(50))
  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        type: data.type,
        actorId: data.actorId,
        actorName: data.actorName,
        actorAvatar: data.actorAvatar,
        text: data.text,
        postId: data.postId ?? '',
        read: data.read ?? false,
        createdAt: data.createdAt?.seconds ? data.createdAt.seconds * 1000 : Date.now()
      }
    }))
  )
}

export async function notify(targetUid: string, item: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) {
  if (!targetUid) return
  await addDoc(collection(usersCol, targetUid, 'notifications'), {
    ...item,
    read: false,
    createdAt: serverTimestamp()
  })
}

export async function markNotificationsRead(uid: string) {
  const q = query(collection(usersCol, uid, 'notifications'), where('read', '==', false), limit(50))
  const snap = await getDocs(q)
  await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { read: true })))
}

/* ---------------- Upload ---------------- */

export function uploadImage(file: File, uid: string): Promise<string> {
  return import('firebase/storage').then(async ({ ref, uploadBytes, getDownloadURL }) => {
    const { storage } = await import('./firebase')
    const path = `avatars/${uid}/${Date.now()}-${file.name}`
    const snap = await uploadBytes(ref(storage, path), file)
    return getDownloadURL(snap.ref)
  })
}

/* ---------------- utils ---------------- */

export function tokenize(text: string): string[] {
  return Array.from(new Set(text.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 2))).slice(0, 20)
}

export function timeAgo(ts: number): string {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000))
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d`
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export async function triggerNotificationForPost(authorId: string, viewerId: string, viewerProfile: Profile | null, type: 'like' | 'comment' | 'repost', postId: string, text: string) {
  if (authorId === viewerId) return
  const label = type === 'like' ? 'liked' : type === 'comment' ? 'commented on' : 'reposted'
  await notify(authorId, {
    type,
    actorId: viewerId,
    actorName: viewerProfile?.name ?? 'Someone',
    actorAvatar: viewerProfile?.avatarUrl ?? '',
    text: `${label} your post: "${text.slice(0, 60)}"`,
    postId
  })
}
