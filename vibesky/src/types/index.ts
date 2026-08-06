export type Profile = {
  uid: string
  handle: string
  name: string
  bio: string
  avatarUrl: string
  bannerUrl: string
  postCount: number
  followerCount: number
  followingCount: number
  createdAt: number
}

export type Post = {
  id: string
  authorId: string
  authorHandle: string
  authorName: string
  authorAvatar: string
  text: string
  imageUrl: string
  type: 'post' | 'repost'
  originalPostId: string
  createdAt: number
  likeCount: number
  repostCount: number
  commentCount: number
}

export type Comment = {
  id: string
  postId: string
  authorId: string
  authorHandle: string
  authorName: string
  authorAvatar: string
  text: string
  createdAt: number
}

export type NotificationItem = {
  id: string
  type: 'like' | 'comment' | 'follow' | 'repost'
  actorId: string
  actorName: string
  actorAvatar: string
  text: string
  postId: string
  read: boolean
  createdAt: number
}

export type AuthorPublic = {
  authorId: string
  authorHandle: string
  authorName: string
  authorAvatar: string
}
