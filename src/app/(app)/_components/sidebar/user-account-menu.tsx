'use client'

import { LogOut, Settings, User as UserIcon } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { logout } from '@/app/actions/auth'


function getInitials(nameOrEmail: string) {
  if (!nameOrEmail) return '';
  const parts = nameOrEmail.trim().split(/\s+/);
  if (parts.length === 1) {
    // Single word (likely email or username)
    return nameOrEmail.substring(0, 2).toUpperCase();
  }
  // Use first letter of first and last word
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function UserAccountMenu({ user }: { user: User & { display_name?: string | null } }) {
  const handleLogout = async () => {
    await logout();
  };

  // Prefer display_name if available, fallback to email
  // Note: user.display_name is not standard on Supabase User, but we can pass it in layout
  const displayName = (user as any).display_name || user.email || '';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">CANary User</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <UserIcon className="mr-2 h-4 w-4" />
          Account
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
