import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';

// Folder IDs
const MAIN_FOLDER_ID = '1k6dU1uEKV6SaLW_b5c1_gmZSwbDklwr1'; // Gallery - contains subfolders
const EVENTS_FOLDER_ID = '1oVCkFLpXzi3havqZ4Iib10NhaKhEnYqQ'; // Events images
const MEMBERS_FOLDER_ID = '1VIEn4x2JPTRoMqxj5XEnjcfL8C815CUf'; // Members images
const CHAPTERS_FOLDER_ID = '1DlMDoDrKt-xgu0XBX_aSmOn4iP2AcGQa'; // Chapters images

const SUBFOLDERS: Record<string, string> = {
  events: 'Events',
  members: 'Members',
  gallery: 'Gallery',
  chapters: 'Chapters',
  chapter_members: 'Members',
};

function getServiceAccount() {
  const privateKey = process.env.GOOGLE_SA_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!privateKey || !process.env.GOOGLE_SA_CLIENT_EMAIL) {
    throw new Error('Google service account credentials not configured');
  }
  return {
    type: 'service_account',
    project_id: 'jjcet-ieee',
    private_key_id: process.env.GOOGLE_SA_PRIVATE_KEY_ID,
    private_key: privateKey,
    client_email: process.env.GOOGLE_SA_CLIENT_EMAIL,
    client_id: '103723842126087917378',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40jjcet-ieee.iam.gserviceaccount.com',
  };
}

async function getDriveClient() {
  const serviceAccount = getServiceAccount();
  
  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  
  const authClient = await auth.getClient();
  return google.drive({ version: 'v3', auth: authClient as any });
}

async function getFolderId(drive: any, folderName: string): Promise<string> {
  return MAIN_FOLDER_ID;
}

// Get thumbnail for a folder (first image in folder)
async function getFolderThumbnail(drive: any, folderId: string): Promise<string | null> {
  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/'`,
      fields: 'files(id, name)',
      spaces: 'drive',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      orderBy: 'createdTime desc',
      pageSize: 1,
    }) as any;
    
    const files = response.data.files || [];
    if (files.length > 0) {
      return `/api/drive?action=image&fileId=${files[0].id}`;
    }
    return null;
  } catch (error) {
    console.error('Error getting folder thumbnail:', error);
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const fileId = searchParams.get('fileId');
  const folderId = searchParams.get('folderId');
  const type = searchParams.get('type'); // 'gallery', 'events', 'members'

  try {
    const drive = await getDriveClient();

    // Get image by file ID
    if (action === 'image' && fileId) {
      const fileMeta = await drive.files.get({ fileId, fields: 'mimeType', supportsAllDrives: true });
      const imageRes = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(imageRes.data as ArrayBuffer);
      return new Response(buffer, {
        headers: { 'Content-Type': fileMeta.data.mimeType || 'image/jpeg', 'Cache-Control': 'public, max-age=86400' },
      });
    }

    // Get collections (subfolders) from main gallery folder
    if (action === 'collections') {
      const targetFolderId = folderId || MAIN_FOLDER_ID;
      const response = await drive.files.list({
        q: `'${targetFolderId}' in parents and mimeType='application/vnd.google-apps.folder'`,
        fields: 'files(id, name)',
        spaces: 'drive',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
        orderBy: 'name',
      }) as any;
      
      // Get thumbnails for each folder
      const folders = response.data.files || [];
      const foldersWithThumbnails = await Promise.all(
        folders.map(async (folder: any) => ({
          id: folder.id,
          name: folder.name,
          thumbnailLink: await getFolderThumbnail(drive, folder.id),
        }))
      );
      
      return NextResponse.json(foldersWithThumbnails);
    }

    // Get images from a specific folder
    if (action === 'images') {
      let targetFolderId = folderId;
      
      // If type is specified, use the corresponding folder
      if (!targetFolderId) {
        if (type === 'events') {
          targetFolderId = EVENTS_FOLDER_ID;
        } else if (type === 'members') {
          targetFolderId = MEMBERS_FOLDER_ID;
        } else if (type === 'chapters') {
          targetFolderId = CHAPTERS_FOLDER_ID;
        } else if (type === 'chapter_members') {
          targetFolderId = MEMBERS_FOLDER_ID;
        } else {
          targetFolderId = MAIN_FOLDER_ID;
        }
      }
      
      const response = await drive.files.list({
        q: `'${targetFolderId}' in parents and mimeType contains 'image/'`,
        fields: 'files(id, name, webViewLink, thumbnailLink)',
        spaces: 'drive',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
        orderBy: 'createdTime desc',
      }) as any;
      
      const files = (response.data.files || []).map((f: any) => ({
        id: f.id,
        name: f.name,
        thumbnailLink: f.thumbnailLink ? `/api/drive?action=image&fileId=${f.id}` : `/api/drive?action=image&fileId=${f.id}`,
        webViewLink: f.webViewLink,
        webContentLink: f.webViewLink,
      }));
      
      return NextResponse.json(files);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Drive API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const drive = await getDriveClient();
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = (formData.get('type') as string) || 'events';
    const customName = (formData.get('name') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const folderName = SUBFOLDERS[type] || 'Events';
    const folderId = await getFolderId(drive, folderName);

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    const stream = new Readable();
    stream.push(uint8Array);
    stream.push(null);

    const timestamp = Date.now();
    const ext = file.name.split('.').pop() || 'jpg';
    const name = customName ? `${customName}_${timestamp}.${ext}` : `${type}_${timestamp}.${ext}`;

    const response = await drive.files.create({
      requestBody: { name },
      media: {
        mimeType: file.type,
        body: stream,
      },
      fields: 'id, name, webViewLink',
      enforceSingleParent: true,
    });

    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: { type: 'anyone', role: 'reader' },
      supportsAllDrives: true,
    });

    const fileUrl = `/api/drive?action=image&fileId=${response.data.id}`;

    return NextResponse.json({
      success: true,
      file: {
        id: response.data.id,
        name: response.data.name,
        url: fileUrl,
        webViewLink: response.data.webViewLink,
      },
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('fileId');

  if (!fileId) {
    return NextResponse.json({ error: 'File ID required' }, { status: 400 });
  }

  try {
    const drive = await getDriveClient();
    await drive.files.delete({ fileId, supportsAllDrives: true });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
