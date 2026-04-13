import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
if (!ADMIN_API_KEY) {
  console.error('[SECURITY] ADMIN_API_KEY environment variable is not set! Upload endpoint will be disabled.');
}

function checkAuth(request: NextRequest): boolean {
  if (!ADMIN_API_KEY) return false;
  const authHeader = request.headers.get('authorization');
  const xAdminKey = request.headers.get('x-admin-api-key');
  return authHeader === `Bearer ${ADMIN_API_KEY}` || xAdminKey === ADMIN_API_KEY;
}

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];

// POST /api/notifications/upload-image - Upload image for notification
export async function POST(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 2MB' }, { status: 400 });
    }

    // Validate extension
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ error: 'Invalid file extension' }, { status: 400 });
    }

    // Generate unique filename - ignore user-provided extension for safety
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const filename = `notification-${timestamp}-${randomStr}.${ext}`;

    // Ensure directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'notification-images');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Write file
    const filePath = path.join(uploadDir, filename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Return public URL
    const publicUrl = `/notification-images/${filename}`;
    const fullUrl = `${process.env.NEXT_PUBLIC_URL || 'https://esma3radio.vercel.app'}${publicUrl}`;

    return NextResponse.json({
      success: true,
      url: fullUrl,
      path: publicUrl,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
