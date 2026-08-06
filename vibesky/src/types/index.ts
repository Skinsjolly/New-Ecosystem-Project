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
  usernameSet: boolean
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
  reactions: Record<string, number>
}

export type Comment = {
  id: string
  postId: string
  authorId: string
  authorHandle: string
  authorName: string
  authorAvatar: string
  text: string
  parentId: string
  createdAt: number
}

export type Sky = {
  id: string
  authorId: string
  authorHandle: string
  authorName: string
  authorAvatar: string
  text: string
  imageUrl: string
  createdAt: number
  expiresAt: number
}

export type Conversation = {
  id: string
  otherUid: string
  otherName: string
  otherHandle: string
  otherAvatar: string
  lastMessage: string
  lastMessageAt: number
  unread: number
}

export type Message = {
  id: string
  senderId: string
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
