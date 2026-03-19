export type UserRole = "student" | "admin" | "user";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone: string;
  memberType: string;
  branch: string;
  year: string;
  ieeeMemberId?: string;
  createdAt: Date;
  emailVerified: boolean;
}

export type EventCategory = "competition" | "guest_lecture" | "workshop" | "other";

export interface EventField {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "url" | "date";
  value: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  venue: string;
  imageUrl: string;
  category: EventCategory;
  createdBy: string;
  createdAt: Date;
  registeredUsers: string[];
  // Dynamic event fields
  fields?: EventField[];
  // Registration settings
  showRegister: boolean;
  registerLink: string;
  showDeadline: boolean;
  registrationDeadline?: Date;
  // Gallery album link
  galleryFolderId?: string;
  galleryFolderName?: string;
}

export interface News {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  category: "announcement" | "achievement" | "event";
  createdBy: string;
  createdAt: Date;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  photoUrl: string;
  email: string;
  linkedin?: string;
  order: number;
  memberType?: "faculty" | "student";
  description?: string;
}

export interface GalleryImage {
  id: string;
  imageUrl: string;
  caption: string;
  eventId?: string;
  uploadedAt: Date;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: "high" | "normal";
  createdAt: Date;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "announcement" | "event" | "news" | "gallery";
  referenceId: number;
  referenceUrl: string;
  isRead: boolean;
  createdAt: Date;
  readBy?: string[];
  deletedBy?: string[];
}

export interface DriveImage {
  id: string;
  name: string;
  thumbnailLink: string;
  webContentLink: string;
  webViewLink: string;
  description?: string;
}

export interface DriveFolder {
  id: string;
  name: string;
  thumbnailLink?: string;
}
