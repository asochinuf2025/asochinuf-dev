# 📋 Cloudinary Integration Summary

## Overview

Cloudinary has been successfully integrated into the ASOCHINUF application for image management with automatic cropping, zoom, and rotation features. The implementation includes both profile photo uploads and course image management.

## What Was Implemented

### ✅ Backend (Node.js/Express)
- **Service:** `backend/services/cloudinaryService.js`
  - `subirImagenCloudinary()` - Upload images with automatic optimization
  - `eliminarImagenCloudinary()` - Delete images by publicId
  - `obtenerURLTransformada()` - Generate transformed image URLs

- **API Routes:** `backend/routes/cloudinary.js`
  - `POST /api/cloudinary/upload-perfil` - Upload profile photos
  - `POST /api/cloudinary/upload-curso` - Upload course images
  - `DELETE /api/cloudinary/delete` - Delete images

### ✅ Frontend (React)
- **Reusable Component:** `frontend/src/components/CloudinaryImageCrop.jsx`
  - Image cropping with react-easy-crop
  - Zoom slider (1x to 3x)
  - 90° rotation
  - Circular/rectangular crop modes
  - Real-time preview with grid overlay
  - Automatic upload to Cloudinary via backend

- **Integration Points:**
  1. **Profile Section:** `frontend/src/pages/PerfilSection/MiPerfil.jsx`
     - Users can change profile photos
     - Crop and upload directly to Cloudinary
     - Updates user profile in real-time

  2. **Course Management:** `frontend/src/pages/CursosSection/GestionCursosSection.jsx`
     - Admins/Nutritionists can set course cover images
     - Same crop functionality as profile
     - Image URL stored in course data

## Technical Implementation Details

### Data Flow

**Profile Photo Upload:**
```
User selects file → Input validation → Modal opens with cropping UI
→ User adjusts crop/zoom/rotation → Confirms → Base64 sent to backend
→ Backend uploads to Cloudinary → Returns URL → Display and save
```

**Course Image Upload:**
```
Admin selects image → Same cropping workflow → URL stored in course data
→ Can be displayed in course previews and listings
```

### Database Updates

For the profile system to persist Cloudinary URLs:
- User's `foto` field now stores Cloudinary URL instead of local filename
- The `actualizarUsuario()` function in AuthContext updates the profile immediately

For courses:
- Course's `imagen_portada` field stores the Cloudinary URL
- Backend stores URL directly without file handling

### Security Features

- ✅ JWT authentication required (Bearer token)
- ✅ File type validation (images only)
- ✅ File size limits (5MB max)
- ✅ Role-based access (nutricionista/admin for courses)
- ✅ Secure base64 transmission over HTTPS
- ✅ Cloudinary API credentials stored in environment variables

### Environment Variables (Already Configured)

```env
CLOUDINARY_CLOUD_NAME="dc8qanjnd"
CLOUDINARY_API_KEY="474564119143581"
CLOUDINARY_API_SECRET="iEoMm4rlslmBgcO0tDv-PulRnwE"
```

## How to Use

### For Users (Profile Photo)

1. Go to Dashboard → Perfil (Profile Tab)
2. Click the camera icon on your profile photo
3. Select an image file (JPG, PNG, GIF - max 5MB)
4. Crop and adjust the image:
   - Drag to position
   - Scroll to zoom (1x-3x)
   - Click rotation button to rotate 90°
5. Click "Guardar" (Save)
6. Image automatically uploads to Cloudinary
7. Profile photo updates immediately

### For Admins (Course Images)

1. Go to Dashboard → Gestion → Cursos (Course Management)
2. Create or edit a course
3. In the form, find the "Imagen de Portada" section
4. Click to select an image file
5. Follow the same cropping workflow as profile photos
6. Confirm to upload
7. Image URL is automatically stored in the course data

## Files Modified

| File | Changes | Purpose |
|------|---------|---------|
| `frontend/src/pages/PerfilSection/MiPerfil.jsx` | Replaced ImageCropModal with CloudinaryImageCrop | Profile photo uploads |
| `frontend/src/pages/CursosSection/GestionCursosSection.jsx` | Replaced ImageCropModalCursos with CloudinaryImageCrop | Course image uploads |
| `backend/server.js` | Added cloudinary routes registration | API endpoint availability |
| `CLOUDINARY_QUICK_START.md` | Updated with integration status | Documentation |

## API Endpoints

### Upload Profile Photo
```
POST /api/cloudinary/upload-perfil
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Body:
{
  "imagenBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}

Response:
{
  "success": true,
  "url": "https://res.cloudinary.com/dc8qanjnd/image/upload/v1234567890/asochinuf/perfiles/usuario-123_abc123.jpg",
  "publicId": "asochinuf/perfiles/usuario-123_abc123"
}
```

### Upload Course Image
```
POST /api/cloudinary/upload-curso
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Body:
{
  "imagenBase64": "data:image/jpeg;base64/...",
  "cursoId": 123
}

Response:
{
  "success": true,
  "url": "https://res.cloudinary.com/dc8qanjnd/image/upload/v1234567890/asochinuf/cursos/curso-123_xyz789.jpg",
  "publicId": "asochinuf/cursos/curso-123_xyz789"
}
```

### Delete Image
```
DELETE /api/cloudinary/delete
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Body:
{
  "publicId": "asochinuf/perfiles/usuario-123_abc123"
}

Response:
{
  "success": true,
  "mensaje": "Imagen eliminada exitosamente"
}
```

## Image Storage in Cloudinary

Images are organized in folders:

```
asochinuf/
├── perfiles/
│   ├── usuario-1_abc123.jpg
│   ├── usuario-2_def456.jpg
│   └── ...
└── cursos/
    ├── curso-1_ghi789.jpg
    ├── curso-2_jkl012.jpg
    └── ...
```

## Features

✅ **Free Image Cropping**
- No additional costs for cropping functionality
- Uses react-easy-crop library

✅ **Automatic Image Optimization**
- Cloudinary automatically optimizes quality
- Responsive image sizing
- Format conversion (WebP, etc.)

✅ **Zone Selection**
- Users can drag image to select visible area
- Zoom in/out with slider
- Rotate 90 degrees
- Real-time preview with grid guide

✅ **Dark Mode Support**
- Component respects theme settings
- Consistent UI in both light and dark modes

✅ **Real-time Updates**
- No page refresh needed
- Profile/course updates immediately
- Toast notifications for feedback

## Testing the Integration

### Test Profile Photo Upload
1. Login to dashboard
2. Go to Perfil (Profile Tab)
3. Click camera icon
4. Select a test image
5. Crop and save
6. Verify image appears in profile

### Test Course Image Upload
1. Login as admin/nutricionista
2. Go to Gestion → Cursos
3. Create a new course or edit existing
4. Click image upload field
5. Select and crop image
6. Verify URL is saved in course data

## Dependencies

Already installed:
- `react-easy-crop@5.5.3` - Frontend cropping
- `cloudinary@2.8.0` - Backend SDK
- `axios` - HTTP client (already in project)
- `sonner` - Toast notifications (already in project)

## Security Notes

1. **Base64 Encoding:** Images are converted to base64 client-side for transmission
2. **JWT Authentication:** All endpoints require valid JWT token
3. **Server-side Upload:** Actual Cloudinary upload happens on backend (secure)
4. **File Validation:** Size and type checked both client and server-side
5. **HTTPS Required:** Should be used over HTTPS in production

## Troubleshooting

### Image not uploading?
- Check JWT token is valid
- Verify Cloudinary credentials in .env
- Check browser console for error details
- Ensure image is < 5MB

### Image not displaying?
- Check Cloudinary URL is returned correctly
- Verify image exists in Cloudinary dashboard
- Check CORS settings if cross-origin

### Crop modal not showing?
- Ensure CloudinaryImageCrop component is imported
- Check `isOpen` prop is true
- Verify token is passed correctly

## What's Next?

### Optional Enhancements
1. Add image transformations (resize, blur, filters)
2. Implement image galleries
3. Add drag-and-drop file upload
4. Create image optimization presets
5. Add batch upload functionality

### For Production
1. Review Cloudinary pricing and limits
2. Set up backup strategy for images
3. Configure CDN for faster delivery
4. Add image moderation (if needed)
5. Set up analytics and monitoring

## Support

- **Cloudinary Docs:** https://cloudinary.com/documentation
- **React Easy Crop:** https://github.com/ricardo-ch/react-easy-crop
- **Project Docs:** See CLOUDINARY_SETUP.md and CLOUDINARY_QUICK_START.md
