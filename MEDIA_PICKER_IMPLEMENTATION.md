# Media Picker Implementation Guide

## Current Status
The animal sell form now has dynamic media upload UI with the following features:
- ✅ Interactive media selection buttons
- ✅ Media preview when selected
- ✅ Remove media functionality
- ✅ Proper state management
- ⏳ **Pending**: Actual media picker implementation

## Required Dependencies

To implement the actual media picker functionality, you'll need to install:

```bash
npx expo install expo-image-picker
npx expo install expo-document-picker
npx expo install expo-camera
```

## Implementation Steps

### 1. Update Imports
Replace the placeholder imports in `frontend/app/(tabs)/sell-animal.tsx`:

```typescript
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Camera from 'expo-camera';
```

### 2. Update Media Picker Functions

Replace the placeholder functions with actual implementations:

```typescript
const openCamera = async (type: 'video' | 'photo', mediaType: 'general' | 'udder' | 'milking') => {
  try {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: type === 'video' ? ImagePicker.MediaTypeOptions.Videos : ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const media = result.assets[0];
      switch (mediaType) {
        case 'general':
          setGeneralVideo(media);
          break;
        case 'udder':
          setUdderPhoto(media);
          break;
        case 'milking':
          setMilkingVideo(media);
          break;
      }
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to open camera');
  }
};

const openGallery = async (type: 'video' | 'photo', mediaType: 'general' | 'udder' | 'milking') => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Gallery permission is required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: type === 'video' ? ImagePicker.MediaTypeOptions.Videos : ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const media = result.assets[0];
      switch (mediaType) {
        case 'general':
          setGeneralVideo(media);
          break;
        case 'udder':
          setUdderPhoto(media);
          break;
        case 'milking':
          setMilkingVideo(media);
          break;
      }
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to open gallery');
  }
};
```

### 3. Update handleSubmit Function

Add media upload to the API call:

```typescript
// Create FormData for multipart upload
const formData = new FormData();

// Add animal data
Object.keys(animalData).forEach(key => {
  formData.append(key, animalData[key]);
});

// Add media files
if (generalVideo) {
  formData.append('general_video', {
    uri: generalVideo.uri,
    type: generalVideo.type || 'video/mp4',
    name: 'general_video.mp4'
  } as any);
}

if (udderPhoto) {
  formData.append('udder_photo', {
    uri: udderPhoto.uri,
    type: udderPhoto.type || 'image/jpeg',
    name: 'udder_photo.jpg'
  } as any);
}

if (milkingVideo) {
  formData.append('milking_video', {
    uri: milkingVideo.uri,
    type: milkingVideo.type || 'video/mp4',
    name: 'milking_video.mp4'
  } as any);
}

// Update API call to use FormData
const response = await fetch('https://api.sociamosaic.com/api/animals', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'multipart/form-data',
  },
  body: formData
});
```

## Current Features

### ✅ Working Features
1. **Dynamic UI**: Media buttons show different states (empty/selected)
2. **Media Preview**: Shows when media is selected with remove option
3. **State Management**: Proper state handling for all media types
4. **Keyboard Handling**: Improved UX with KeyboardAvoidingView
5. **Form Validation**: All required fields validation
6. **API Integration**: Ready for media upload

### 🎯 UX Improvements Made
1. **Keyboard Handling**: Page no longer auto-scrolls and hides fields
2. **Persistent Taps**: `keyboardShouldPersistTaps="handled"` allows interaction while keyboard is open
3. **Proper Spacing**: Added padding to prevent content from being hidden
4. **Platform-specific Behavior**: Different keyboard behavior for iOS and Android

## Testing

The current implementation shows placeholder alerts for media selection. To test the full functionality:

1. Install the required dependencies
2. Implement the media picker functions
3. Test on a real device (camera/gallery access required)
4. Verify media upload to the backend

## Backend Integration

The backend is already configured to handle multipart form data with media uploads. The API expects:
- `general_video`: General animal video
- `udder_photo`: Udder photo (marked as primary)
- `milking_video`: Milking process video

All media will be uploaded to AWS S3 and categorized appropriately. 