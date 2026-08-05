import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromReq } from '@/lib/auth'

const SAMPLE_EMAILS = [
  {
    id: '1', from: 'Smart Thinker', fromEmail: 'noreply@smartthinker.com', to: 'me',
    subject: 'Welcome to Smart Thinker Mail!',
    body: 'Thank you for joining Smart Thinker Mail. Your new email client is ready to use.\n\nYou can:\n- Link your Gmail or Outlook accounts\n- Send and receive emails\n- Organize with folders and labels\n- Compose rich text emails\n\nBest regards,\nThe Smart Thinker Team',
    date: new Date().toISOString(), read: false, starred: true, folder: 'inbox', labels: ['welcome'],
  },
  {
    id: '2', from: 'Google Cloud', fromEmail: 'cloud@google.com', to: 'me',
    subject: 'Your Gemini API Key is Ready',
    body: 'Your Gemini 2.5 Flash-Lite API key has been activated.\n\nYou can now use it in your Smart Thinker search engine for AI-powered overviews.',
    date: new Date(Date.now() - 86400000).toISOString(), read: true, starred: false, folder: 'inbox', labels: ['api'],
  },
  {
    id: '3', from: 'GitHub', fromEmail: 'notifications@github.com', to: 'me',
    subject: '[SmartThinker] New commit pushed',
    body: 'A new commit was pushed to your repository.\n\nCommit: "Initial project setup"\nAuthor: You\nBranch: main',
    date: new Date(Date.now() - 172800000).toISOString(), read: true, starred: false, folder: 'inbox', labels: ['github'],
  },
  {
    id: '4', from: 'Vercel', fromEmail: 'notifications@vercel.com', to: 'me',
    subject: 'Deployment successful: smart-thinker-mail',
    body: 'Your deployment was successful.\n\nBuild time: 32s\nRegion: iad1',
    date: new Date(Date.now() - 259200000).toISOString(), read: true, starred: false, folder: 'inbox', labels: ['deploy'],
  },
  {
    id: '5', from: 'Newsletter', fromEmail: 'weekly@techdigest.io', to: 'me',
    subject: 'This Week in Tech: AI Breakthroughs',
    body: 'Top stories this week:\n\n1. GPT-5 announced\n2. New framework gains 10k stars\n3. Browser wars heat up',
    date: new Date(Date.now() - 345600000).toISOString(), read: false, starred: true, folder: 'inbox', labels: ['newsletter'],
  },
  {
    id: '6', from: 'You', fromEmail: 'me@smartthinker.com', to: 'team@smartthinker.com',
    subject: 'Project Update: Mail App Redesign',
    body: 'Team,\n\nHere\'s the latest on the mail app redesign:\n- Gmail-like 3-panel layout\n- Account linking via Google OAuth\n- Compose window with rich text\n\nTarget launch: next week.',
    date: new Date(Date.now() - 432000000).toISOString(), read: true, starred: false, folder: 'sent', labels: [],
  },
  {
    id: '7', from: 'You', fromEmail: 'me@smartthinker.com', to: 'friend@email.com',
    subject: 'Draft: Meeting notes from Tuesday',
    body: 'Meeting notes:\n- Discussed Q1 roadmap\n- Reviewed user feedback\n- Prioritized mail app features',
    date: new Date(Date.now() - 518400000).toISOString(), read: true, starred: false, folder: 'drafts', labels: ['notes'],
  },
  {
    id: '8', from: 'Spam Sender', fromEmail: 'promo@spamoffers.com', to: 'me',
    subject: 'You won a FREE vacation!',
    body: 'Congratulations! You have been selected for a free tropical vacation!',
    date: new Date(Date.now() - 604800000).toISOString(), read: true, starred: false, folder: 'spam', labels: [],
  },
  {
    id: '9', from: 'Old Service', fromEmail: 'old@deprecated-service.com', to: 'me',
    subject: 'Account deletion notice',
    body: 'Your account will be deleted in 30 days. Please export your data.',
    date: new Date(Date.now() - 691200000).toISOString(), read: true, starred: false, folder: 'trash', labels: [],
  },
]

async function fetchGmailEmails(accessToken: string, maxResults: number = 20) {
  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!listRes.ok) return null
  const listData = await listRes.json()
  if (!listData.messages) return []

  const emails = []
  for (const msg of listData.messages.slice(0, 20)) {
    try {
      const detailRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Subject&metadataHeaders=Date`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      if (!detailRes.ok) continue
      const detail = await detailRes.json()

      const headers: Record<string, string> = {}
      detail.payload?.headers?.forEach((h: any) => { headers[h.name] = h.value })

      const body = detail.snippet || ''
      const labels = detail.labelIds || []
      const isInbox = labels.includes('INBOX')
      const isSent = labels.includes('SENT')
      const isDraft = labels.includes('DRAFT')
      const isSpam = labels.includes('SPAM')
      const isTrash = labels.includes('TRASH')

      let folder = 'inbox'
      if (isSent) folder = 'sent'
      else if (isDraft) folder = 'drafts'
      else if (isSpam) folder = 'spam'
      else if (isTrash) folder = 'trash'

      emails.push({
        id: msg.id,
        from: headers['From']?.replace(/<[^>]+>/, '').trim() || headers['From'] || 'Unknown',
        fromEmail: (headers['From']?.match(/<([^>]+)>/) || [,''])[1] || headers['From'] || '',
        to: headers['To'] || '',
        subject: headers['Subject'] || '(no subject)',
        body,
        date: headers['Date'] || new Date().toISOString(),
        read: !labels.includes('UNREAD'),
        starred: labels.includes('STARRED'),
        folder,
        labels: labels.filter((l: string) => !['INBOX','UNREAD','STARRED','IMPORTANT','CATEGORY_PRIMARY','SENT','DRAFTS','SPAM','TRASH'].includes(l)),
      })
    } catch {
      continue
    }
  }
  return emails
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromReq(req)
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const folder = searchParams.get('folder')

    const googleAccount = await prisma.emailAccount.findFirst({
      where: { userId: user.id, provider: 'google' },
    })

    let emails: any[] = []

    if (googleAccount?.accessToken) {
      try {
        const gmailEmails = await fetchGmailEmails(googleAccount.accessToken)
        if (gmailEmails) {
          emails = gmailEmails
        }
      } catch {
        // fallback to sample
      }
    }

    if (emails.length === 0) {
      emails = SAMPLE_EMAILS
    }

    if (folder) {
      emails = emails.filter((e) => folder === 'starred' ? e.starred : e.folder === folder)
    }

    return NextResponse.json({ emails })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}