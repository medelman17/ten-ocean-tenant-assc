"use client"

import {
  AlertCircle,
  Building,
  Check,
  ChevronsUpDown,
  Construction,
  Facebook,
  Github,
  Home,
  Instagram,
  Link,
  Loader2,
  Linkedin,
  Lock,
  LogOut,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Search,
  Settings,
  Trash,
  Twitter,
  User,
  UserPlus,
  UserX,
  Users,
  Wrench,
  Calendar,
  FileText,
  Bell,
  X,
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
  | "phone"
  | "plus"
  | "search"
  | "settings"
  | "trash"
  | "logout"
  | "message"
  | "userPlus"
  | "userX"
  | "users"
  | "wrench"
  | "calendar"
  | "document"
  | "notification"
  | "warning"
  | "lock"
  | "x"
  | "linkedin"
  | "twitter"
  | "instagram"
  | "facebook"
  | "github"
  | "link"
  | "construction"

export const Icons = {
  logo: Building,
  spinner: Loader2,
  user: User,
  building: Building,
  chevron: ChevronsUpDown,
  check: Check,
  home: Home,
  mail: Mail,
  phone: Phone,
  plus: Plus,
  search: Search,
  settings: Settings,
  trash: Trash,
  logout: LogOut,
  message: MessageSquare,
  userPlus: UserPlus,
  userX: UserX,
  users: Users,
  wrench: Wrench,
  calendar: Calendar,
  document: FileText,
  notification: Bell,
  warning: AlertCircle,
  lock: Lock,
  x: X,
  linkedin: Linkedin,
  twitter: Twitter,
  instagram: Instagram,
  facebook: Facebook,
  github: Github,
  link: Link,
  construction: Construction,
}
