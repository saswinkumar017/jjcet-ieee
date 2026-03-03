import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

import { Event, News, TeamMember, GalleryImage, Announcement, Notification } from '@/types';

// Simple mapping functions
function mapEventFromFirestore(data: any): Event {
  return {
    id: data.id || '',
    title: data.title || '',
    description: data.description || '',
    date: data.date ? new Date(data.date) : new Date(),
    time: data.time || '',
    venue: data.venue || '',
    imageUrl: data.imageUrl || data.image_url || '',
    category: data.category || 'other',
    createdBy: data.createdBy || '',
    createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
    registeredUsers: data.registeredUsers || [],
    registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline) : undefined,
    teamMinSize: data.teamMinSize,
    teamMaxSize: data.teamMaxSize,
    prizes: data.prizes,
    rulesLink: data.rulesLink,
    guestName: data.guestName,
    guestDesignation: data.guestDesignation,
    topic: data.topic,
    trainerName: data.trainerName,
    prerequisites: data.prerequisites,
    duration: data.duration,
    materials: data.materials,
  };
}

function mapNewsFromFirestore(data: any): News {
  return {
    id: data.id || '',
    title: data.title || '',
    content: data.content || '',
    imageUrl: data.imageUrl || data.image_url || '',
    category: data.category || 'announcement',
    createdBy: data.createdBy || '',
    createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
  };
}

function mapMemberFromFirestore(data: any): TeamMember {
  return {
    id: data.id || '',
    name: data.name || '',
    role: data.role || '',
    photoUrl: data.photoUrl || data.photo_url || '',
    email: data.email || '',
    linkedin: data.linkedin || '',
    order: data.order || 0,
  };
}

function mapAnnouncementFromFirestore(data: any): Announcement {
  return {
    id: data.id || '',
    title: data.title || '',
    content: data.content || '',
    priority: data.priority || 'normal',
    createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
  };
}

function mapNotificationFromFirestore(data: any): Notification {
  return {
    id: data.id || '',
    title: data.title || '',
    message: data.message || '',
    type: data.type || 'announcement',
    referenceId: data.referenceId || 0,
    referenceUrl: data.referenceUrl || '',
    isRead: data.isRead || false,
    createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
  };
}

function mapGalleryFromFirestore(data: any): GalleryImage {
  return {
    id: data.id || '',
    imageUrl: data.imageUrl || data.image_url || '',
    caption: data.caption || '',
    eventId: data.eventId,
    uploadedAt: data.uploadedAt ? new Date(data.uploadedAt) : new Date(),
  };
}

async function createNotificationGlobally(data: { title: string; message: string; type: string; referenceId?: number; referenceUrl?: string }) {
  try {
    await addDoc(collection(db, 'notifications'), {
      ...data,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error('Notification error:', e);
  }
}

export const eventsService = {
  async getAll(): Promise<Event[]> {
    const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => mapEventFromFirestore({ id: d.id, ...d.data() }));
  },

  async getUpcoming(): Promise<Event[]> {
    const today = new Date().toISOString().split('T')[0];
    const q = query(collection(db, 'events'), where('date', '>=', today), orderBy('date', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => mapEventFromFirestore({ id: d.id, ...d.data() }));
  },

  async getById(id: string): Promise<Event | null> {
    const snap = await getDoc(doc(db, 'events', id));
    if (!snap.exists()) return null;
    return mapEventFromFirestore({ id: snap.id, ...snap.data() });
  },

  async create(eventData: Omit<Event, 'id' | 'createdAt' | 'registeredUsers' | 'createdBy'>): Promise<string> {
    try {
      console.log('Creating event in Firestore:', eventData.title);
      const cleanData = Object.fromEntries(
        Object.entries(eventData).filter(([_, v]) => v !== undefined && v !== null && v !== '')
      );
      const docRef = await addDoc(collection(db, 'events'), {
        ...cleanData,
        date: eventData.date instanceof Date ? eventData.date.toISOString().split('T')[0] : eventData.date,
        registeredUsers: [],
        createdAt: new Date().toISOString(),
      });
      console.log('Event created with ID:', docRef.id);
      await createNotificationGlobally({
        title: 'New Event Added',
        message: `${eventData.title} - ${new Date(eventData.date).toLocaleDateString()}`,
        type: 'event',
      });
      return docRef.id;
    } catch (error) {
      console.error('Firestore create error:', error);
      throw error;
    }
  },

  async createWithFile(eventData: Omit<Event, 'id' | 'createdAt' | 'registeredUsers' | 'createdBy'>, file: File): Promise<string> {
    try {
      console.log('Uploading to Google Drive:', file.name);
      const driveFile = await driveService.upload(file, 'events', eventData.title);
      console.log('Drive upload complete:', driveFile.url);
      return this.create({ ...eventData, imageUrl: driveFile.url });
    } catch (error) {
      console.error('Drive upload error:', error);
      throw error;
    }
  },

  async update(id: string, data: Partial<Event>): Promise<void> {
    // Filter out undefined/null/empty values
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    await updateDoc(doc(db, 'events', id), cleanData as any);
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'events', id));
  },

  async registerUser(eventId: string, userId: string): Promise<void> {
    const snap = await getDoc(doc(db, 'events', eventId));
    if (!snap.exists()) throw new Error('Event not found');
    const event = snap.data();
    const users = event.registeredUsers || [];
    if (!users.includes(userId)) {
      users.push(userId);
      await updateDoc(doc(db, 'events', eventId), { registeredUsers: users });
    }
  },

  async unregisterUser(eventId: string, userId: string): Promise<void> {
    const snap = await getDoc(doc(db, 'events', eventId));
    if (!snap.exists()) throw new Error('Event not found');
    const event = snap.data();
    const users = (event.registeredUsers || []).filter((id: string) => id !== userId);
    await updateDoc(doc(db, 'events', eventId), { registeredUsers: users });
  },
};

export const newsService = {
  async getAll(): Promise<News[]> {
    const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => mapNewsFromFirestore({ id: d.id, ...d.data() }));
  },

  async getByCategory(category: string): Promise<News[]> {
    const q = query(collection(db, 'news'), where('category', '==', category), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => mapNewsFromFirestore({ id: d.id, ...d.data() }));
  },

  async getById(id: string): Promise<News | null> {
    const snap = await getDoc(doc(db, 'news', id));
    if (!snap.exists()) return null;
    return mapNewsFromFirestore({ id: snap.id, ...snap.data() });
  },

  async create(newsData: Omit<News, 'id' | 'createdAt' | 'createdBy'>): Promise<string> {
    const cleanData = Object.fromEntries(
      Object.entries(newsData).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    const docRef = await addDoc(collection(db, 'news'), {
      ...cleanData,
      createdAt: new Date().toISOString(),
    });
    await createNotificationGlobally({ title: 'News Update', message: newsData.title, type: 'news' });
    return docRef.id;
  },

  async createWithFile(newsData: Omit<News, 'id' | 'createdAt' | 'createdBy'>, file: File): Promise<string> {
    // Upload to Firebase Storage
    const fileName = `news/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${file.name.split('.').pop()}`;
    const storageRef = ref(storage, fileName);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return this.create({ ...newsData, imageUrl: url });
  },

  async update(id: string, data: Partial<News>): Promise<void> {
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    await updateDoc(doc(db, 'news', id), cleanData as any);
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'news', id));
  },
};

export const membersService = {
  async getAll(): Promise<TeamMember[]> {
    const q = query(collection(db, 'team_members'), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => mapMemberFromFirestore({ id: d.id, ...d.data() }));
  },

  async create(memberData: Omit<TeamMember, 'id'>): Promise<string> {
    const cleanData = Object.fromEntries(
      Object.entries(memberData).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    const docRef = await addDoc(collection(db, 'team_members'), cleanData);
    return docRef.id;
  },

  async createWithFile(memberData: Omit<TeamMember, 'id'>, file: File): Promise<string> {
    try {
      console.log('Uploading to Google Drive:', file.name);
      const driveFile = await driveService.upload(file, 'members', memberData.name);
      console.log('Drive upload complete:', driveFile.url);
      return this.create({ ...memberData, photoUrl: driveFile.url });
    } catch (error) {
      console.error('Drive upload error:', error);
      throw error;
    }
  },

  async update(id: string, data: Partial<TeamMember>): Promise<void> {
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    await updateDoc(doc(db, 'team_members', id), cleanData as any);
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'team_members', id));
  }
};


export const announcementsService = {
  async getAll(): Promise<Announcement[]> {
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => mapAnnouncementFromFirestore({ id: d.id, ...d.data() }));
  },

  async getById(id: string): Promise<Announcement | null> {
    const snap = await getDoc(doc(db, 'announcements', id));
    if (!snap.exists()) return null;
    return mapAnnouncementFromFirestore({ id: snap.id, ...snap.data() });
  },

  async create(data: Omit<Announcement, 'id' | 'createdAt'>): Promise<string> {
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    const docRef = await addDoc(collection(db, 'announcements'), { ...cleanData, createdAt: new Date().toISOString() });
    return docRef.id;
  },

  async update(id: string, data: Partial<Announcement>): Promise<void> {
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    await updateDoc(doc(db, 'announcements', id), cleanData as any);
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'announcements', id));
  },
};

export const galleryService = {
  async getAll(): Promise<GalleryImage[]> {
    const q = query(collection(db, 'gallery'), orderBy('uploadedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => mapGalleryFromFirestore({ id: d.id, ...d.data() }));
  },

  async add(imageData: Omit<GalleryImage, 'id' | 'uploadedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'gallery'), { ...imageData, uploadedAt: new Date().toISOString() });
    await createNotificationGlobally({ title: 'New Gallery Update', message: imageData.caption || 'New photos', type: 'gallery' });
    return docRef.id;
  },

  async upload(file: File, caption: string): Promise<string> {
    // Upload to Google Drive
    const driveFile = await driveService.upload(file, 'gallery', caption);
    return this.add({ imageUrl: driveFile.url, caption });
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'gallery', id));
  },
};

export const notificationsService = {
  async getAll(offset = 0, limitVal = 50): Promise<{ notifications: Notification[]; unreadCount: number }> {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), firestoreLimit(offset + limitVal));
    const snapshot = await getDocs(q);
    const notifications = snapshot.docs.map(d => mapNotificationFromFirestore({ id: d.id, ...d.data() }));
    return { notifications: notifications.slice(offset, offset + limitVal), unreadCount: notifications.filter(n => !n.isRead).length };
  },

  async getUnread(): Promise<Notification[]> {
    const q = query(collection(db, 'notifications'), where('isRead', '==', false), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => mapNotificationFromFirestore({ id: d.id, ...d.data() }));
  },

  async getUnreadCount(): Promise<number> {
    const q = query(collection(db, 'notifications'), where('isRead', '==', false));
    const snapshot = await getDocs(q);
    return snapshot.size;
  },

  async markAsRead(id: string): Promise<void> {
    await updateDoc(doc(db, 'notifications', id), { isRead: true });
  },

  async markAllAsRead(): Promise<void> {
    const q = query(collection(db, 'notifications'), where('isRead', '==', false));
    const snapshot = await getDocs(q);
    await Promise.all(snapshot.docs.map(d => updateDoc(d.ref, { isRead: true })));
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'notifications', id));
  },
};

// ============================================
// Google Drive Service
// ============================================

const DRIVE_API_BASE = '/api/drive';

export interface DriveFile {
  id: string;
  name: string;
  url: string;
  downloadUrl: string;
  webViewLink: string;
}

export const driveService = {
  // Upload file to Google Drive
  async upload(file: File, type: 'events' | 'members' | 'gallery' = 'events', customName?: string): Promise<DriveFile> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (customName) {
      formData.append('name', customName);
    }

    const response = await fetch(DRIVE_API_BASE, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload to Drive');
    }

    const data = await response.json();
    return data.file;
  },

  // Get file URL from Drive
  async getFileUrl(fileId: string): Promise<string> {
    const response = await fetch(`${DRIVE_API_BASE}?action=url&fileId=${fileId}`);
    if (!response.ok) {
      throw new Error('Failed to get file URL');
    }
    const data = await response.json();
    return data.url;
  },

  // Delete file from Drive
  async delete(fileId: string): Promise<void> {
    const response = await fetch(`${DRIVE_API_BASE}?fileId=${fileId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete from Drive');
    }
  },

  // Get images from a specific type folder
  async getImages(type: 'events' | 'members' | 'gallery' | 'news' | 'announcements' = 'events'): Promise<DriveFile[]> {
    const response = await fetch(`${DRIVE_API_BASE}?action=images&type=${type}`);
    if (!response.ok) {
      throw new Error('Failed to fetch images');
    }
    return await response.json();
  },
};
