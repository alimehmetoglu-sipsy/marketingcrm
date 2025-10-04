import {
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  Users,
  FileText,
  CheckCircle,
  Clock,
  Bell,
  Zap,
  Activity as ActivityIcon,
  type LucideIcon
} from "lucide-react"

const iconMap: Record<string, LucideIcon> = {
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  Users,
  FileText,
  CheckCircle,
  Clock,
  Bell,
  Zap,
}

interface ActivityIconProps {
  iconName: string | null
  color?: string | null
  className?: string
}

export const getActivityIcon = ({ iconName, color, className = "h-5 w-5" }: ActivityIconProps) => {
  if (!iconName) {
    return <ActivityIcon className={className} style={{ color: color || undefined }} />
  }

  const Icon = iconMap[iconName] || ActivityIcon
  return <Icon className={className} style={{ color: color || undefined }} />
}

export const getActivityColor = (color: string | null): string => {
  return color || "#6b7280" // default gray-500
}

export const getActivityBgColor = (color: string | null): string => {
  if (!color) return "rgb(243 244 246)" // gray-100

  // Convert hex to RGB and add 20% opacity
  const hex = color.replace("#", "")
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  return `rgba(${r}, ${g}, ${b}, 0.15)`
}

export const getActivityIconComponent = (iconName: string | null): LucideIcon => {
  if (!iconName) return ActivityIcon
  return iconMap[iconName] || ActivityIcon
}
