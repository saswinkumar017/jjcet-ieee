import { NextResponse } from 'next/server';
import { google } from 'googleapis';

const DRIVE_FOLDER_ID = '1k6dU1uEKV6SaLW_b5c1_gmZSwbDklwr1';

// Load service account credentials from environment variables
function getServiceAccount() {
  const privateKey = process.env.GOOGLE_SA_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!privateKey || !process.env.GOOGLE_SA_CLIENT_EMAIL) {
    throw new Error('Google service account env vars not set');
  }
  return {
    type: process.env.GOOGLE_SA_TYPE,
    project_id: process.env.GOOGLE_SA_PROJECT_ID,
    private_key_id: process.env.GOOGLE_SA_PRIVATE_KEY_ID,
    private_key: privateKey,
    client_email: process.env.GOOGLE_SA_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_SA_CLIENT_ID,
    auth_uri: process.env.GOOGLE_SA_AUTH_URI,
    token_uri: process.env.GOOGLE_SA_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.GOOGLE_SA_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.GOOGLE_SA_CLIENT_CERT_URL,
  };
}
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const folderId = searchParams.get('folderId');
  const fileId = searchParams.get('fileId');

  try {
    const serviceAccount = getServiceAccount();
    
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // ── Proxy image bytes through server (avoids browser 403 on lh3 URLs) ──
    if (action === 'image' && fileId) {
      const fileMeta = await drive.files.get({
        fileId,
        fields: 'id, name, mimeType',
      });
      const mimeType = fileMeta.data.mimeType || 'image/jpeg';

      const imageRes = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'arraybuffer' }
      );

      const buffer = Buffer.from(imageRes.data as ArrayBuffer);
      return new Response(buffer, {
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        },
      });
    }

    // ── Get collections (folders) ──
    if (action === 'collections') {
      const response = await drive.files.list({
        q: `'${DRIVE_FOLDER_ID}' in parents and mimeType = 'application/vnd.google-apps.folder'`,
        fields: 'files(id, name)',
        orderBy: 'name',
      });

      return NextResponse.json(response.data.files || []);
    }

    // ── Get images from a folder ──
    if (action === 'images') {
      const targetFolderId = folderId || DRIVE_FOLDER_ID;

      const response = await drive.files.list({
        q: `'${targetFolderId}' in parents and (mimeType contains 'image/' or mimeType = 'application/vnd.google-apps.folder')`,
        fields: 'files(id, name, mimeType, webContentLink, webViewLink, description)',
        orderBy: 'name',
      });

      // Filter to only images, map to proxy URLs
      const files = (response.data.files || [])
        .filter((file: any) => !file.mimeType.includes('folder'))
        .map((file: any) => ({
          id: file.id,
          name: file.name,
          // Use our own proxy so browser never hits lh3.googleusercontent.com
          thumbnailLink: `/api/drive?action=image&fileId=${file.id}`,
          webContentLink: file.webContentLink || `https://drive.google.com/uc?export=download&id=${file.id}`,
          webViewLink: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
          description: file.description || file.name,
        }));

      return NextResponse.json(files);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Google Drive API error:', error);
    return NextResponse.json({ error: 'Failed to fetch from Google Drive' }, { status: 500 });
  }
}
