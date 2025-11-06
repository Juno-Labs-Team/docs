# Uploads API

The Uploads API handles file uploads to Supabase Storage, specifically for user avatar images.

## Overview

The API uses Multer for multipart/form-data handling and Supabase Storage for file persistence. Avatar uploads are:
- **Scoped per user**: Each user has their own storage folder
- **Single avatar**: New uploads replace old avatars automatically
- **Image only**: Only image MIME types are accepted
- **Size limited**: Maximum 5MB per file

## Authentication

All upload endpoints require authentication. Include the session token in the `Authorization` header:

```http
Authorization: Bearer <session_token>
```

## Endpoints

### Upload Avatar

Upload or replace the user's avatar image.

::: code-group
```http [Request]
POST /api/uploads/avatar
Authorization: Bearer <session_token>
Content-Type: multipart/form-data

------WebKitFormBoundary
Content-Disposition: form-data; name="avatar"; filename="profile.jpg"
Content-Type: image/jpeg

<binary image data>
------WebKitFormBoundary--
```

```json [Response - Success]
{
  "success": true,
  "data": {
    "url": "https://project.supabase.co/storage/v1/object/public/avatars/user-id/1699123456.jpg"
  }
}
```

```json [Response - No File]
{
  "success": false,
  "error": {
    "message": "No file uploaded"
  }
}
```

```json [Response - Invalid Type]
{
  "success": false,
  "error": {
    "message": "Only image files are allowed"
  }
}
```

```json [Response - Too Large]
{
  "success": false,
  "error": {
    "message": "File too large"
  }
}
```
:::

#### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `avatar` | File | Yes | Image file (JPEG, PNG, GIF, WebP, etc.) |

#### File Constraints

- **Field Name**: Must be `avatar`
- **MIME Types**: Any `image/*` type (image/jpeg, image/png, image/gif, image/webp, etc.)
- **Max Size**: 5MB (5,242,880 bytes)
- **Storage**: Memory buffer (not written to disk)

#### Upload Behavior

When you upload a new avatar:
1. **Old avatars are deleted**: All previous avatars for the user are removed from storage
2. **New file is uploaded**: With a timestamped filename (e.g., `1699123456.jpg`)
3. **Profile is updated**: The `avatar_url` field in the `profiles` table is updated
4. **Public URL returned**: The new avatar's public URL is returned

#### Response Codes

| Code | Description |
|------|-------------|
| `200` | Avatar uploaded successfully |
| `400` | No file uploaded or invalid file type |
| `401` | User not authenticated |
| `413` | File too large (>5MB) |
| `500` | Server error (upload failed, storage error, etc.) |

---

### Delete Avatar

Remove the user's avatar and reset to default.

::: code-group
```http [Request]
DELETE /api/uploads/avatar
Authorization: Bearer <session_token>
```

```json [Response - Success]
{
  "success": true,
  "message": "Avatar deleted successfully"
}
```

```json [Response - Error]
{
  "success": false,
  "error": {
    "message": "Failed to update profile"
  }
}
```
:::

#### Delete Behavior

When you delete an avatar:
1. **All avatar files are removed** from the user's storage folder
2. **Profile is updated**: The `avatar_url` field is set to `null`
3. **Default avatar shown**: Frontend should display a default/placeholder avatar

#### Response Codes

| Code | Description |
|------|-------------|
| `200` | Avatar deleted successfully |
| `401` | User not authenticated |
| `500` | Server error (storage or database error) |

## Storage Configuration

### Supabase Storage Bucket

Avatars are stored in a dedicated public bucket:

```typescript
// Storage configuration
const config = {
  storage: {
    avatarBucket: 'avatars',
    maxFileSize: 5 * 1024 * 1024, // 5MB
  },
};
```

### Bucket Structure

```
avatars/
  ├── {user-id-1}/
  │   └── 1699123456.jpg
  ├── {user-id-2}/
  │   └── 1699234567.png
  └── {user-id-3}/
      └── 1699345678.webp
```

Each user has their own folder (named with their UUID) containing their avatar file.

### File Naming Convention

Files are named with timestamps to ensure uniqueness:

```typescript
const fileExt = originalname.split('.').pop();
const fileName = `${userId}/${Date.now()}.${fileExt}`;
// Example: "550e8400-e29b-41d4-a716-446655440000/1699123456.jpg"
```

### Public Access

The avatars bucket is configured for **public read access**, meaning:
- ✅ Anyone can view avatar images (no auth required for GET)
- ❌ Only authenticated users can upload/delete (auth required for POST/DELETE)

## Data Model

### Database Schema

Avatar URLs are stored in the `profiles` table:

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,  -- Public URL to avatar image
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### TypeScript Interfaces

```typescript
interface UploadResponse {
  success: boolean;
  data?: {
    url: string;  // Public URL of uploaded avatar
  };
  error?: {
    message: string;
  };
}

interface DeleteResponse {
  success: boolean;
  message?: string;
  error?: {
    message: string;
  };
}
```

## Rate Limiting

Upload endpoints are rate-limited to prevent abuse:

- **Window**: 15 minutes
- **Max Requests**: 100 per window

::: tip Note
Even with rate limiting, uploads are expensive operations. Consider implementing additional client-side throttling or cooldowns for better UX.
:::

## Security

### Authentication Middleware

All endpoints use the `authenticateUser` middleware:

```typescript
router.post('/avatar', authenticateUser, upload.single('avatar'), handler);
router.delete('/avatar', authenticateUser, handler);
```

### File Validation

Multiple layers of validation:

1. **MIME Type Check**: Only `image/*` MIME types allowed
2. **File Size Check**: Maximum 5MB enforced by Multer
3. **User Isolation**: Users can only upload to their own folder
4. **Automatic Cleanup**: Old avatars deleted before uploading new ones

```typescript
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});
```

### Storage Security

- **Folder Isolation**: Each user has a separate folder (prevents accessing other users' files)
- **Automatic Overwrite**: Old files deleted automatically (prevents accumulation)
- **Public Bucket**: Anyone can view avatars (appropriate for profile pictures)

::: warning Security Consideration
While the avatars bucket is public (anyone can view), only authenticated users can upload or delete files. This is intentional for profile pictures, but consider making the bucket private if you need more restrictive access.
:::

## Usage Examples

### React Component with File Upload

```typescript
import { useState } from 'react';
import apiClient from '@/lib/apiClient';

export function AvatarUpload() {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Maximum size is 5MB.');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await apiClient.post('/uploads/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setAvatarUrl(response.data.data.url);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await apiClient.delete('/uploads/avatar');
      
      if (response.data.success) {
        setAvatarUrl(null);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete avatar');
    }
  };

  return (
    <div>
      {avatarUrl ? (
        <>
          <img src={avatarUrl} alt="Avatar" width={100} height={100} />
          <button onClick={handleDelete}>Delete Avatar</button>
        </>
      ) : (
        <div>No avatar</div>
      )}
      
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
      />
      
      {uploading && <p>Uploading...</p>}
    </div>
  );
}
```

### Image Preview Before Upload

```typescript
function AvatarUploadWithPreview() {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert('File too large');
      return;
    }

    setFile(selectedFile);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.post('/uploads/avatar', formData);
    
    if (response.data.success) {
      console.log('Uploaded:', response.data.data.url);
      setPreview(null);
      setFile(null);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileSelect} />
      
      {preview && (
        <>
          <img src={preview} alt="Preview" width={200} />
          <button onClick={handleUpload}>Upload</button>
          <button onClick={() => { setPreview(null); setFile(null); }}>
            Cancel
          </button>
        </>
      )}
    </div>
  );
}
```

### Drag and Drop Upload

```typescript
import { useRef } from 'react';

function DragDropAvatar() {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) {
      alert('Please drop an image file');
      return;
    }

    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.post('/uploads/avatar', formData);
    console.log('Uploaded:', response.data.data.url);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        border: isDragging ? '2px dashed blue' : '2px dashed gray',
        padding: '40px',
        textAlign: 'center',
      }}
    >
      <p>Drag and drop an image here</p>
      <p>or</p>
      <button onClick={() => fileInputRef.current?.click()}>
        Choose File
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadFile(file);
        }}
      />
    </div>
  );
}
```

## Testing

### Manual Testing with cURL

```bash
# Upload avatar
curl -X POST http://localhost:3000/api/uploads/avatar \
  -H "Authorization: Bearer <session_token>" \
  -F "avatar=@/path/to/image.jpg"

# Delete avatar
curl -X DELETE http://localhost:3000/api/uploads/avatar \
  -H "Authorization: Bearer <session_token>"
```

### Automated Tests

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import app from '../src/index';

describe('Uploads API', () => {
  let authToken: string;
  
  beforeAll(async () => {
    // Login to get auth token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    authToken = loginRes.body.data.session.access_token;
  });

  it('should upload avatar successfully', async () => {
    const testImage = path.join(__dirname, 'fixtures', 'test-avatar.jpg');
    
    const res = await request(app)
      .post('/api/uploads/avatar')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('avatar', testImage);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.url).toContain('supabase.co/storage');
  });

  it('should reject non-image files', async () => {
    const testFile = path.join(__dirname, 'fixtures', 'test-document.pdf');
    
    const res = await request(app)
      .post('/api/uploads/avatar')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('avatar', testFile);
    
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject files over 5MB', async () => {
    // Create a 6MB buffer
    const largeBuffer = Buffer.alloc(6 * 1024 * 1024);
    
    const res = await request(app)
      .post('/api/uploads/avatar')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('avatar', largeBuffer, 'large-image.jpg');
    
    expect(res.status).toBe(413);
  });

  it('should delete avatar successfully', async () => {
    // Upload first
    const testImage = path.join(__dirname, 'fixtures', 'test-avatar.jpg');
    await request(app)
      .post('/api/uploads/avatar')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('avatar', testImage);
    
    // Then delete
    const res = await request(app)
      .delete('/api/uploads/avatar')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should replace old avatar on new upload', async () => {
    const testImage1 = path.join(__dirname, 'fixtures', 'avatar-1.jpg');
    const testImage2 = path.join(__dirname, 'fixtures', 'avatar-2.jpg');
    
    // Upload first avatar
    const res1 = await request(app)
      .post('/api/uploads/avatar')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('avatar', testImage1);
    const url1 = res1.body.data.url;
    
    // Upload second avatar
    const res2 = await request(app)
      .post('/api/uploads/avatar')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('avatar', testImage2);
    const url2 = res2.body.data.url;
    
    // URLs should be different (old one replaced)
    expect(url1).not.toBe(url2);
  });
});
```

## Troubleshooting

### Upload Fails Silently

**Problem**: Request returns 200 but no file appears

**Solutions**:
- Check Supabase Storage bucket exists and is public
- Verify storage bucket name matches config (`avatars`)
- Check Supabase project URL and API keys in `.env`
- Verify the user's auth token is valid

### File Size Limit Error

**Problem**: `413 Payload Too Large` or "File too large" error

**Solutions**:
- Reduce image file size (compress/resize before upload)
- Maximum allowed: 5MB (configurable in `config/index.ts`)
- Check if reverse proxy (nginx, etc.) has lower limit

### Invalid MIME Type

**Problem**: "Only image files are allowed" error

**Cause**: File doesn't have an `image/*` MIME type

**Solutions**:
- Ensure the file is actually an image
- Check file extension matches content (.jpg for JPEG, etc.)
- Some files may have incorrect MIME types (rename/re-export)

### Avatar Not Updating in UI

**Problem**: New avatar uploaded but old one still shows

**Solutions**:
- Cache-busting: Add timestamp to URL (`?t=${Date.now()}`)
- Clear browser cache
- Check `cache-control` header in storage configuration
- Verify profile `avatar_url` was updated in database

### Storage Bucket Permission Errors

**Problem**: "Storage bucket not found" or permission errors

**Solutions**:
- Create the `avatars` bucket in Supabase dashboard
- Set bucket to **public** (Storage → avatars → Configuration → Public bucket: ON)
- Verify RLS policies allow the user to SELECT their profile

## Advanced Features

### Image Optimization

Consider adding server-side image optimization:

```typescript
import sharp from 'sharp';

// Resize and optimize before upload
const optimizedBuffer = await sharp(req.file.buffer)
  .resize(400, 400, { fit: 'cover' })
  .jpeg({ quality: 85 })
  .toBuffer();
```

### Progress Tracking

For large uploads, track progress:

```typescript
const config = {
  onUploadProgress: (progressEvent) => {
    const percentCompleted = Math.round(
      (progressEvent.loaded * 100) / progressEvent.total
    );
    console.log(`Upload: ${percentCompleted}%`);
  },
};

await apiClient.post('/uploads/avatar', formData, config);
```

### Multiple File Support

Extend to support multiple avatar options:

```typescript
// Upload multiple avatars (thumbnail, medium, large)
router.post('/avatar-set', authenticateUser, upload.single('avatar'), async (req, res) => {
  const sizes = [
    { name: 'thumbnail', size: 100 },
    { name: 'medium', size: 400 },
    { name: 'large', size: 1000 },
  ];
  
  const urls = await Promise.all(
    sizes.map(async ({ name, size }) => {
      const resized = await sharp(req.file.buffer)
        .resize(size, size)
        .toBuffer();
      
      const filename = `${userId}/${name}-${Date.now()}.jpg`;
      await supabase.storage.from('avatars').upload(filename, resized);
      
      return { [name]: publicUrl };
    })
  );
  
  res.json({ success: true, data: Object.assign({}, ...urls) });
});
```

## Related Documentation

- [Users API](./users.md) - User profile management
- [Authentication API](./authentication.md) - Auth flow and session management
- [File Reference - upload.routes.ts](/eventive-api/reference/file-reference#upload-routes-ts) - Implementation details
