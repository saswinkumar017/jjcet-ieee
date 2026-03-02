// Google Drive Service for Gallery
// Uses API route for server-side authentication

const API_BASE = '/api/drive';

export interface DriveImage {
  id: string;
  name: string;
  thumbnailLink: string;
  webContentLink: string;
  webViewLink: string;
  description: string;
}

export interface DriveFolder {
  id: string;
  name: string;
}

// Get collections (folders) from the main Drive folder
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

// Get images from a specific folder
export async function getGalleryImages(folderId?: string): Promise<DriveImage[]> {
  try {
    const url = folderId 
      ? `${API_BASE}?action=images&folderId=${encodeURIComponent(folderId)}`
      : `${API_BASE}?action=images`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch images');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return getFallbackImages();
  }
}

// Generate direct thumbnail URL from Google Drive file ID
// Generate proxy thumbnail URL via our own API route
export function getDriveThumbnailUrl(fileId: string, _size: number = 800): string {
  return `/api/drive?action=image&fileId=${fileId}`;
}

// Generate direct download URL from Google Drive file ID  
export function getDriveDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
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
