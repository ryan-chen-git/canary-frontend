import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, UserCheck, Shield } from 'lucide-react'
import type { Profile } from '@/types/database'
import { RefreshButton } from './_components/refresh-button'

export default async function RosterPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch all profiles
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('display_name', { ascending: true })

  if (error) {
    console.error('Error fetching profiles:', error)
  }

  // Group profiles by status and role
  const activeProfiles = profiles?.filter(p => p.status === 'active') || []
  const inactiveProfiles = profiles?.filter(p => p.status !== 'active') || []

  const memberCount = activeProfiles.filter(p => p.role === 'member').length
  const uploaderCount = activeProfiles.filter(p => p.role === 'uploader').length
  const adminCount = activeProfiles.filter(p => p.role === 'admin').length

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Members</h1>
          <p className="text-muted-foreground">View all team members and their roles</p>
        </div>
        <RefreshButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Members</CardTitle>
          <CardDescription>{activeProfiles.length} active team members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {activeProfiles.map((profile) => (
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
                <div className="flex gap-2">
                  <Badge variant={
                    profile.role === 'admin' ? 'default' :
                    profile.role === 'uploader' ? 'secondary' :
                    'outline'
                  }>
                    {profile.role}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {inactiveProfiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Inactive Members</CardTitle>
            <CardDescription>{inactiveProfiles.length} inactive members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {inactiveProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card opacity-60"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{profile.display_name || 'Unknown'}</p>
                    <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                      {profile.subteam && <span>{profile.subteam}</span>}
                      {profile.graduation_year && <span>Class of {profile.graduation_year}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{profile.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
