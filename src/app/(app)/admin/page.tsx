import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Shield, Users, Database, Activity, HardDrive } from 'lucide-react'
import type { Profile } from '@/types/database'
import { formatBytes } from '@/lib/utils'

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/files')
  }

  // Fetch all statistics in one call
  const { data: stats } = await supabase.rpc('get_admin_stats')
  
  const totalUsers = stats?.total_users || 0
  const totalGroups = stats?.total_groups || 0
  const totalFiles = stats?.total_files || 0
  const totalStorage = stats?.total_storage || 0
  const recentUsers = stats?.recent_users || []

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">System overview and management</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="py-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 py-0 pb-2">
            <div className="text-2xl font-bold">{totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>

        <Card className="py-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-2">
            <CardTitle className="text-sm font-medium">Collections</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 py-0 pb-2">
            <div className="text-2xl font-bold">{totalGroups || 0}</div>
            <p className="text-xs text-muted-foreground">Total collections</p>
          </CardContent>
        </Card>

        <Card className="py-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-2">
            <CardTitle className="text-sm font-medium">Files</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 py-0 pb-2">
            <div className="text-2xl font-bold">{totalFiles || 0}</div>
            <p className="text-xs text-muted-foreground">Files stored</p>
          </CardContent>
        </Card>

        <Card className="py-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-2">
            <CardTitle className="text-sm font-medium">Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 py-0 pb-2">
            <div className="text-2xl font-bold">{formatBytes(totalStorage)}</div>
            <p className="text-xs text-muted-foreground">Total used</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Actions</CardTitle>
          <CardDescription>Management tools</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            User role management and advanced features coming soon.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" disabled>
              <Shield className="h-4 w-4" />
              Manage Roles
            </Button>
            <Button variant="outline" disabled>
              <Users className="h-4 w-4" />
              Bulk Actions
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
          <CardDescription>Latest user registrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentUsers?.map((user: Profile) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{user.display_name || 'Unknown'}</p>
                  <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                    {user.subteam && <span>{user.subteam}</span>}
                    {user.graduation_year && <span>Class of {user.graduation_year}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant={
                    user.role === 'admin' ? 'default' :
                    user.role === 'uploader' ? 'secondary' :
                    'outline'
                  }>
                    {user.role}
                  </Badge>
                  <Badge variant="outline">{user.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
