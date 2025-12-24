'use client'

import Link from 'next/link'
import { Command } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import type { User } from '@supabase/supabase-js'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { APP_CONFIG } from '@/config/app-config'
import { sidebarItems } from '@/navigation/sidebar/sidebar-items'
import { usePreferencesStore } from '@/stores/preferences/preferences-provider'

import { NavMain } from './nav-main'
import { NavUser } from './nav-user'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: User | null
  displayName?: string | null
}

export function AppSidebar({ user, displayName, ...props }: AppSidebarProps) {
  const { sidebarVariant, sidebarCollapsible, isSynced } = usePreferencesStore(
    useShallow((s) => ({
      sidebarVariant: s.sidebarVariant,
      sidebarCollapsible: s.sidebarCollapsible,
      isSynced: s.isSynced,
    }))
  )

  const variant = isSynced ? sidebarVariant : props.variant
  const collapsible = isSynced ? sidebarCollapsible : props.collapsible

  return (
    <Sidebar {...props} variant={variant} collapsible={collapsible}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link prefetch={false} href="/files">
                <Command />
                <span className="font-semibold text-base">{APP_CONFIG.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: displayName || user?.email || 'User',
            email: user?.email || 'dev@example.com',
            avatar: '',
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
