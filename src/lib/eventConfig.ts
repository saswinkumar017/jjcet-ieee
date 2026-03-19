import { EventCategory } from "@/types";
import { 
  Trophy, Mic, GraduationCap, CalendarDays, FileText, User, 
  Clock3, Package, Users, Sparkles 
} from "lucide-react";

export interface FieldConfig {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "url" | "date";
  category: EventCategory | "all";
  icon: React.ElementType;
  placeholder?: string;
  rows?: number;
  defaultEnabled?: boolean;
}

export const eventFields: FieldConfig[] = [
  // Competition fields
  { 
    key: "teamSize", 
    label: "Team Size", 
    type: "text", 
    category: "competition",
    icon: Users,
    placeholder: "2-4 members",
    defaultEnabled: true
  },
  { 
    key: "prizes", 
    label: "Prizes", 
    type: "textarea", 
    category: "competition",
    icon: Trophy,
    placeholder: "1st Prize: ₹10000, 2nd Prize: ₹5000...",
    rows: 3,
    defaultEnabled: true
  },
  { 
    key: "rules", 
    label: "Rules & Regulations", 
    type: "url", 
    category: "competition",
    icon: FileText,
    placeholder: "https://docs.example.com/rules",
    defaultEnabled: true
  },
  // Guest lecture fields
  { 
    key: "guestName", 
    label: "Chief Guest Name", 
    type: "text", 
    category: "guest_lecture",
    icon: User,
    placeholder: "Dr. John Doe",
    defaultEnabled: true
  },
  { 
    key: "guestDesignation", 
    label: "Guest Designation", 
    type: "text", 
    category: "guest_lecture",
    icon: User,
    placeholder: "Senior Engineer, Google",
    defaultEnabled: true
  },
  // Workshop fields
  { 
    key: "trainerName", 
    label: "Trainer Name", 
    type: "text", 
    category: "workshop",
    icon: User,
    placeholder: "Expert Trainer",
    defaultEnabled: true
  },
  { 
    key: "duration", 
    label: "Duration (hours)", 
    type: "number", 
    category: "workshop",
    icon: Clock3,
    placeholder: "4",
    defaultEnabled: true
  },
  { 
    key: "prerequisites", 
    label: "Prerequisites", 
    type: "textarea", 
    category: "workshop",
    icon: FileText,
    placeholder: "Basic knowledge of...",
    rows: 2,
    defaultEnabled: true
  },
  { 
    key: "materials", 
    label: "Materials Required", 
    type: "textarea", 
    category: "workshop",
    icon: Package,
    placeholder: "Laptop, notepad, etc.",
    rows: 2,
    defaultEnabled: true
  },
];

export const getFieldsByCategory = (category: EventCategory): FieldConfig[] => {
  return eventFields.filter(f => f.category === category || f.category === "all");
};

export const getDefaultFieldsForCategory = (category: EventCategory): string[] => {
  return eventFields
    .filter(f => f.category === category && f.defaultEnabled)
    .map(f => f.key);
};

export const getFieldConfig = (key: string): FieldConfig | undefined => {
  return eventFields.find(f => f.key === key);
};

export const categoryOptions = [
  { value: "competition", label: "Competition", icon: Trophy, color: "text-yellow-600", bg: "bg-yellow-100" },
  { value: "guest_lecture", label: "Guest Lecture", icon: Mic, color: "text-blue-600", bg: "bg-blue-100" },
  { value: "workshop", label: "Workshop", icon: GraduationCap, color: "text-green-600", bg: "bg-green-100" },
  { value: "other", label: "Other", icon: CalendarDays, color: "text-gray-600", bg: "bg-gray-100" },
];

export const getCategoryInfo = (category: string) => {
  const info = categoryOptions.find(c => c.value === category);
  return info || { value: "other", label: "Event", icon: CalendarDays, color: "text-gray-600", bg: "bg-gray-100" };
};

export const fieldIcons: Record<string, React.ElementType> = {
  prizes: Trophy,
  rules: FileText,
  teamSize: Users,
  guestName: User,
  guestDesignation: User,
  topic: FileText,
  trainerName: User,
  prerequisites: FileText,
  duration: Clock3,
  materials: Package,
};

export const getFieldIcon = (key: string) => fieldIcons[key] || Sparkles;
