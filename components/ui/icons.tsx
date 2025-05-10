"use client"

import {
  AlertCircle,
  Building,
  Check,
  ChevronsUpDown,
  Home,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  Settings,
  Trash,
  User,
  UserPlus,
  Users,
  Wrench,
  Calendar,
  FileText,
  Bell,
} from "lucide-react"

export type IconKeys =
  | "logo"
  | "spinner"
  | "user"
  | "building"
  | "chevron"
  | "check"
  | "home"
  | "mail"
  | "plus"
  | "settings"
  | "trash"
  | "logout"
  | "message"
  | "userPlus"
  | "users"
  | "wrench"
  | "calendar"
  | "document"
  | "notification"
  | "warning"
  | "lock"

export const Icons = {
  logo: Building,
  spinner: Loader2,
  user: User,
  building: Building,
  chevron: ChevronsUpDown,
  check: Check,
  home: Home,
  mail: Mail,
  plus: Plus,
  settings: Settings,
  trash: Trash,
  logout: LogOut,
  message: MessageSquare,
  userPlus: UserPlus,
  users: Users,
  wrench: Wrench,
  calendar: Calendar,
  document: FileText,
  notification: Bell,
  warning: AlertCircle,
  lock: Lock,
}