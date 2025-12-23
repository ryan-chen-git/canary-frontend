import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, UserCheck, Shield } from 'lucide-react'
import type { Profile } from '@/types/database'
import { RefreshButton } from './_components/refresh-button'
import { EmailCopyButton } from './_components/email-copy-button'

export default async function RosterPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch all profiles directly from the table
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, display_name, subteam, role, graduation_year, status')
    .order('display_name', { ascending: true })

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError)
  }

  // Fetch all emails using RPC
  const { data: emails, error: emailsError } = await supabase.rpc('get_all_emails')

  if (emailsError) {
    console.error('Error fetching emails:', emailsError)
  }

  // Create a map of user ID to email
  const emailMap = new Map(emails?.map(e => [e.id, e.email]) || [])

  // Merge profiles with emails
  const profilesWithEmail = (profiles || []).map((profile) => ({
    ...profile,
    email: emailMap.get(profile.id) || null
  }))

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Members</h1>
          <p className="text-muted-foreground">View all team members and their roles</p>
        </div>
        <RefreshButton />
      </div>

      <div className="space-y-2">
        {profilesWithEmail?.map((profile) => (
          <div
            key={profile.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card"
          >
            <div className="flex-1">
              <p className="text-sm font-medium">{profile.display_name || 'Unknown'}</p>
              <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                {profile.subteam && <span>{profile.subteam}</span>}
                {profile.graduation_year && <span>Class of {profile.graduation_year}</span>}
              </div>
            </div>
            <div className="flex-1 text-center">
              {profile.email ? (
                <EmailCopyButton email={profile.email} />
              ) : (
                <p className="text-sm text-muted-foreground">No email</p>
              )}
            </div>
            <div className="flex gap-2">
              <Badge variant={
                profile.role === 'admin' ? 'default' :
                profile.role === 'uploader' ? 'secondary' :
                'outline'
              }>
                {profile.role}
              </Badge>
              {profile.status !== 'active' && (
                <Badge variant="outline">{profile.status}</Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
