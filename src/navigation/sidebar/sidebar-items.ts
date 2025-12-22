import {
  FileText,
  Upload,
  Users,
  ShieldCheck,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Main",
    items: [
      {
        title: "Files",
        url: "/logs",
        icon: FileText,
      },
      {
        title: "Upload",
        url: "/upload",
        icon: Upload,
      },
    ],
  },
  {
    id: 2,
    label: "Management",
    items: [
      {
        title: "Members",
        url: "/roster",
        icon: Users,
      },
      {
        title: "Admin",
        url: "/admin",
        icon: ShieldCheck,
      },
    ],
  },
  {
    id: 3,
    label: "Account",
    items: [
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
      },
    ],
  },
];
