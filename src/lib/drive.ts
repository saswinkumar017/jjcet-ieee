// Google Drive Service for Gallery, Events, and Members
// Uses API route for server-side authentication

const API_BASE = '/api/drive';

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

// Get collections (subfolders) from the main Drive folder - for Gallery
export async function getCollections(): Promise<DriveFolder[]> {
  try {
    const response = await fetch(`${API_BASE}?action=collections`);
    if (!response.ok) {
      throw new Error('Failed to fetch collections');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
}

// Get images from a specific folder - for Gallery subfolders
export async function getGalleryImages(folderId: string): Promise<DriveImage[]> {
  try {
    const response = await fetch(`${API_BASE}?action=images&folderId=${encodeURIComponent(folderId)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch images');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return [];
  }
}

// Get images from Events folder - for Event form selection
export async function getEventImages(): Promise<DriveImage[]> {
  try {
    const response = await fetch(`${API_BASE}?action=images&type=events`);
    if (!response.ok) {
      throw new Error('Failed to fetch event images');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching event images:', error);
    return [];
  }
}

// Get images from Members folder - for Member form selection
export async function getMemberImages(): Promise<DriveImage[]> {
  try {
    const response = await fetch(`${API_BASE}?action=images&type=members`);
    if (!response.ok) {
      throw new Error('Failed to fetch member images');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching member images:', error);
    return [];
  }
}

// Get all Drive images (for event/member image selection)
export async function getAllDriveImages(): Promise<DriveImage[]> {
  try {
    const response = await fetch(`${API_BASE}?action=images`);
    if (!response.ok) {
      throw new Error('Failed to fetch images');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching drive images:', error);
    return [];
  }
}

// Generate direct thumbnail URL from Google Drive file ID
export function getDriveThumbnailUrl(fileId: string): string {
  return `/api/drive?action=image&fileId=${fileId}`;
}

// Generate direct download URL from Google Drive file ID  
export function getDriveDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

// Generate web view link for storage in Firestore
export function getDriveWebViewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

// Fallback images if API fails
function getFallbackImages(): DriveImage[] {
  return [
    {
      id: '1',
      name: 'Sample Image 1',
      thumbnailLink: '/jjcet-campus.jpg',
      webContentLink: '/jjcet-campus.jpg',
      webViewLink: '/jjcet-campus.jpg',
      description: 'JJCET Campus',
    },
    {
      id: '2', 
      name: 'Sample Image 2',
      thumbnailLink: '/College-site-logo.png',
      webContentLink: '/College-site-logo.png',
      webViewLink: '/College-site-logo.png',
      description: 'IEEE Logo',
    },
  ];
}
