import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EditableProfileCard } from './_components/editable-profile-card'

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <EditableProfileCard profile={profile!} userEmail={user.email || ''} />

      <Card>
        <CardHeader>
          <CardTitle>Membership Status</CardTitle>
          <CardDescription>Your current team membership status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant={profile?.status === 'active' ? 'default' : 'secondary'}>
              {profile?.status || 'unknown'}
            </Badge>
            <p className="text-sm text-muted-foreground">
              {profile?.status === 'active' ? 'Active team member' : profile?.status === 'alumni' ? 'Alumni member' : 'Inactive member'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
