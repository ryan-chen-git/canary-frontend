'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { User, Mail, Calendar, Shield, Edit2, X, Check, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import type { Profile } from '@/types/database'

const SUBTEAMS = [
  'Electrical',
  'Suspension',
  'Software',
  'Firmware',
  'Drivetrain',
  'Aerodynamics',
  'Chassis',
  'Business',
  'Operations',
] as const

const currentYear = new Date().getFullYear()
const GRADUATION_YEARS = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i)

interface EditableProfileCardProps {
  profile: Profile
  userEmail: string
}

export function EditableProfileCard({ profile, userEmail }: EditableProfileCardProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(profile.display_name || '')
  const [subteam, setSubteam] = useState(profile.subteam || 'none')
  const [graduationYear, setGraduationYear] = useState(profile.graduation_year?.toString() || 'none')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim() || null,
          subteam: subteam === 'none' ? null : subteam.trim() || null,
          graduation_year: graduationYear === 'none' ? null : graduationYear ? parseInt(graduationYear, 10) : null,
        })
        .eq('id', profile.id)

      if (updateError) throw updateError

      setIsEditing(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setDisplayName(profile.display_name || '')
    setSubteam(profile.subteam || 'none')
    setGraduationYear(profile.graduation_year?.toString() || 'none')
    setError(null)
    setIsEditing(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </div>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display Name */}
        <div className="flex items-start gap-3">
          <User className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium">Display Name</p>
            {isEditing ? (
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                disabled={saving}
                className="mt-1"
              />
            ) : (
              <p className="text-sm text-muted-foreground">{profile.display_name || 'Not set'}</p>
            )}
          </div>
        </div>

        {/* Email (read-only) */}
        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium">Email</p>
            <p className="text-sm text-muted-foreground">{userEmail}</p>
          </div>
        </div>

        {/* Role (read-only) */}
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium">Role</p>
            <div className="mt-1">
              <Badge variant={
                profile.role === 'admin' ? 'default' :
                profile.role === 'uploader' ? 'secondary' :
                'outline'
              }>
                {profile.role || 'member'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Subteam */}
        {(isEditing || profile.subteam) && (
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Subteam</p>
              {isEditing ? (
                <Select
                  value={subteam}
                  onValueChange={setSubteam}
                  disabled={saving}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a subteam" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {SUBTEAMS.map((team) => (
                      <SelectItem key={team} value={team}>
                        {team}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground">{profile.subteam}</p>
              )}
            </div>
          </div>
        )}

        {/* Graduation Year */}
        {(isEditing || profile.graduation_year) && (
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Graduation Year</p>
              {isEditing ? (
                <Select
                  value={graduationYear}
                  onValueChange={setGraduationYear}
                  disabled={saving}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select graduation year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {GRADUATION_YEARS.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground">{profile.graduation_year}</p>
              )}
            </div>
          </div>
        )}

        {/* Member Since (read-only) */}
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium">Member Since</p>
            <p className="text-sm text-muted-foreground">
              {profile.created_at ? formatDistanceToNow(new Date(profile.created_at), { addSuffix: true }) : 'Unknown'}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Save/Cancel Buttons */}
        {isEditing && (
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} disabled={saving} size="sm">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Save
                </>
              )}
            </Button>
            <Button onClick={handleCancel} disabled={saving} variant="outline" size="sm">
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

