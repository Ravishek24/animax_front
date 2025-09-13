// app/(tabs)/sell-animal.tsx - UPDATED VERSION
import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Alert,
  Switch,
  Platform,
  KeyboardAvoidingView,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import CommonHeader from '../../components/CommonHeader';

// Smart Media Compression System - Similar to WhatsApp
import * as ImageManipulator from 'expo-image-manipulator';
import * as VideoThumbnails from 'expo-video-thumbnails';
import * as FileSystem from 'expo-file-system';

// Compression configuration
const COMPRESSION_CONFIG = {
  photos: {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.85,
    maxSizeBytes: 5 * 1024 * 1024, // Target 5MB max
  },
  videos: {
    maxWidth: 1280,
    maxHeight: 720,
    quality: 0.8,
    maxSizeBytes: 25 * 1024 * 1024, // Target 25MB max
    maxDuration: 300, // 5 minutes max
  }
};

// Smart compression utility functions
const MediaCompressor = {
  // Compress image with smart quality adjustment
  compressImage: async (uri: string, targetSizeBytes?: number): Promise<ImagePicker.ImagePickerAsset> => {
    try {
      console.log('🖼️ Starting image compression for:', uri);
      
      // Get original file info
      const fileInfo = await FileSystem.getInfoAsync(uri, { size: true });
      const originalSize = fileInfo.exists ? (fileInfo as any).size || 0 : 0;
      
      console.log('📊 Original image size:', (originalSize / 1024 / 1024).toFixed(2), 'MB');
      
      // If file is already small enough, return as is
      const maxSize = targetSizeBytes || COMPRESSION_CONFIG.photos.maxSizeBytes;
      if (originalSize <= maxSize) {
        console.log('✅ Image already optimal size, no compression needed');
        return {
          uri,
          type: 'image',
          fileName: `photo_${Date.now()}.jpg`,
          fileSize: originalSize,
          width: 0,
          height: 0
        };
      }

      // Calculate compression ratio based on file size
      let quality = COMPRESSION_CONFIG.photos.quality;
      let maxWidth = COMPRESSION_CONFIG.photos.maxWidth;
      let maxHeight = COMPRESSION_CONFIG.photos.maxHeight;

      // Aggressive compression for very large files
      if (originalSize > 20 * 1024 * 1024) { // > 20MB
        quality = 0.7;
        maxWidth = 1600;
        maxHeight = 1600;
      } else if (originalSize > 10 * 1024 * 1024) { // > 10MB
        quality = 0.75;
        maxWidth = 1800;
        maxHeight = 1800;
      }

      console.log('⚙️ Compression settings:', { quality, maxWidth, maxHeight });

      // Compress the image
      const compressedImage = await ImageManipulator.manipulateAsync(
        uri,
        [
          {
            resize: {
              width: maxWidth,
              height: maxHeight,
            },
          },
        ],
        {
          compress: quality,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: false,
        }
      );

      // Get compressed file info
      const compressedFileInfo = await FileSystem.getInfoAsync(compressedImage.uri, { size: true });
      const compressedSize = compressedFileInfo.exists ? (compressedFileInfo as any).size || 0 : 0;

      console.log('📉 Compressed image size:', (compressedSize / 1024 / 1024).toFixed(2), 'MB');
      console.log('📊 Compression ratio:', ((1 - compressedSize / originalSize) * 100).toFixed(1), '% reduction');

      // If still too large, try more aggressive compression
      if (compressedSize > maxSize && quality > 0.5) {
        console.log('🔄 File still large, applying more compression...');
        return await MediaCompressor.compressImage(compressedImage.uri, maxSize);
      }

      return {
        uri: compressedImage.uri,
        type: 'image',
        fileName: `compressed_photo_${Date.now()}.jpg`,
        fileSize: compressedSize,
        width: compressedImage.width,
        height: compressedImage.height
      };

    } catch (error) {
      console.error('❌ Image compression failed:', error);
      throw new Error('Failed to compress image');
    }
  },

  // Smart video compression (placeholder - would need native module for full implementation)
  compressVideo: async (uri: string, targetSizeBytes?: number): Promise<ImagePicker.ImagePickerAsset> => {
    try {
      console.log('🎬 Starting video compression for:', uri);
      
      // Get original file info
      const fileInfo = await FileSystem.getInfoAsync(uri, { size: true });
      const originalSize = fileInfo.exists ? (fileInfo as any).size || 0 : 0;
      
      console.log('📊 Original video size:', (originalSize / 1024 / 1024).toFixed(2), 'MB');
      
      const maxSize = targetSizeBytes || COMPRESSION_CONFIG.videos.maxSizeBytes;
      
      // For now, if video is reasonable size, return as is
      // In production, you'd use a video compression library like react-native-video-processing
      if (originalSize <= maxSize) {
        console.log('✅ Video size acceptable, no compression needed');
        return {
          uri,
          type: 'video',
          fileName: `video_${Date.now()}.mp4`,
          fileSize: originalSize,
          width: 0,
          height: 0
        };
      }

      // For very large videos, show user options
      console.log('⚠️ Large video detected, would compress in production app');
      
      // This is where you'd implement actual video compression
      // For now, we'll return the original with a warning
      return {
        uri,
        type: 'video',
        fileName: `large_video_${Date.now()}.mp4`,
        fileSize: originalSize,
        width: 0,
        height: 0
      };

    } catch (error) {
      console.error('❌ Video compression failed:', error);
      throw new Error('Failed to process video');
    }
  },

  // Get video thumbnail for preview
  getVideoThumbnail: async (uri: string): Promise<string> => {
    try {
      const { uri: thumbnailUri } = await VideoThumbnails.getThumbnailAsync(uri, {
        time: 1000, // 1 second into video
        quality: 0.7,
      });
      return thumbnailUri;
    } catch (error) {
      console.error('Failed to generate video thumbnail:', error);
      return uri; // Fallback to original
    }
  }
};

const AnimalSellScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Form state
  const [animalType, setAnimalType] = useState('');
  const [breed, setBreed] = useState('');
  const [currentMilk, setCurrentMilk] = useState('');
  const [maxMilk, setMaxMilk] = useState('');
  const [price, setPrice] = useState('');
  const [negotiable, setNegotiable] = useState(false);
  const [sellDuration, setSellDuration] = useState('');
  const [preferredAnimal, setPreferredAnimal] = useState('');
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [location, setLocation] = useState('Block C, Ansal Golf Links 1, Greater Noida');
  const [showAnimalDropdown, setShowAnimalDropdown] = useState(false);
  const [showBreedDropdown, setShowBreedDropdown] = useState(false);
  const [selectedOtherAnimal, setSelectedOtherAnimal] = useState('');
  const [selectedOtherBreed, setSelectedOtherBreed] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Media state
  const [generalVideo, setGeneralVideo] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [udderPhoto, setUdderPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [milkingVideo, setMilkingVideo] = useState<ImagePicker.ImagePickerAsset | null>(null);
  
  // ScrollView ref for keyboard handling
  const scrollViewRef = useRef(null);

  const handleSubmit = async () => {
    console.log('🚀 Starting animal submission...');
    
    // Validate required fields
    if (!animalType || !breed || !currentMilk || !price || !sellDuration || !preferredAnimal || !location) {
      console.log('❌ Validation failed - missing required fields');
      Alert.alert('Error', 'Please fill all required fields marked with *');
      return;
    }

    console.log('✅ Validation passed');
    setLoading(true);
    
    try {
      // Get user token from AsyncStorage
      console.log('🔑 Getting user token...');
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.log('❌ No user token found');
        Alert.alert('Error', 'Please login first');
        setLoading(false);
        return;
      }
      console.log('✅ Token retrieved successfully');

      // Map UI values to backend fields
      console.log('📝 Mapping form data...');
      const animalData = {
        category_id: getCategoryId(animalType, selectedOtherAnimal),
        title: `${animalType} - ${breed} - ${currentMilk}L दूध`,
        description: `Animal Type: ${animalType}, Breed: ${breed}, Current Milk: ${currentMilk}L`,
        price: parseFloat(price),
        is_negotiable: negotiable,
        breed_description: getBreedDescription(breed, selectedOtherBreed),
        lactation_number: getLactationNumber(breed, selectedOtherBreed),
        milk_yield_per_day: parseFloat(currentMilk),
        peak_milk_yield_per_day: parseFloat(maxMilk) || null,
        is_pregnant: false, // Default value, can be updated later
        months_pregnant: null,
        calf_status: 'Unknown', // Default value
        selling_timeframe: sellDuration,
        preferred_animal_type: preferredAnimal,
        status: 'active',
        location_address: location,
        location_latitude: null, // Optional
        location_longitude: null, // Optional
        additional_info: additionalInfo || null
      };

      console.log('📊 Animal data:', JSON.stringify(animalData, null, 2));

      // Create FormData for multipart upload
      console.log('📦 Creating FormData...');
      const formData = new FormData();

      // Add animal data
      Object.keys(animalData).forEach(key => {
        const value = animalData[key as keyof typeof animalData];
        if (value !== null && value !== undefined) {
          formData.append(key, String(value));
          console.log(`📎 Added to FormData: ${key} = ${String(value)}`);
        }
      });

      // Add compressed media files (no size restrictions!)
      if (generalVideo) {
        console.log('🎬 Adding compressed general video:', (generalVideo.fileSize! / 1024 / 1024).toFixed(1), 'MB');
        formData.append('general_video', {
          uri: generalVideo.uri,
          type: generalVideo.type === 'video' ? 'video/mp4' : 'video/mp4',
          name: generalVideo.fileName || `general_video_${Date.now()}.mp4`,
        } as any);
      }

      if (udderPhoto) {
        console.log('🖼️ Adding compressed udder photo:', (udderPhoto.fileSize! / 1024 / 1024).toFixed(1), 'MB');
        formData.append('udder_photo', {
          uri: udderPhoto.uri,
          type: udderPhoto.type === 'image' ? 'image/jpeg' : 'image/jpeg',
          name: udderPhoto.fileName || `udder_photo_${Date.now()}.jpg`,
        } as any);
      }

      if (milkingVideo) {
        console.log('🎬 Adding compressed milking video:', (milkingVideo.fileSize! / 1024 / 1024).toFixed(1), 'MB');
        formData.append('milking_video', {
          uri: milkingVideo.uri,
          type: milkingVideo.type === 'video' ? 'video/mp4' : 'video/mp4',
          name: milkingVideo.fileName || `milking_video_${Date.now()}.mp4`,
        } as any);
      }

      // Upload with generous timeout for any size file
      console.log('🌐 Uploading optimized media...');
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 600000); // 10 minutes timeout
      
      const response = await fetch('https://api.sociamosaic.com/api/animals', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
        signal: controller.signal
      });
      
      // Clear timeout if request completes
      clearTimeout(timeoutId);

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      const result = await response.json();
      console.log('📄 Response data:', JSON.stringify(result, null, 2));

      if (response.ok && result.success) {
        console.log('✅ Animal submission successful!');
        Alert.alert('Success', 'Animal listing submitted successfully!', [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setAnimalType('');
              setBreed('');
              setCurrentMilk('');
              setMaxMilk('');
              setPrice('');
              setNegotiable(false);
              setSellDuration('');
              setPreferredAnimal('');
              setAdditionalInfo('');
              setSelectedOtherAnimal('');
              setSelectedOtherBreed('');
              
              // Reset media
              setGeneralVideo(null);
              setUdderPhoto(null);
              setMilkingVideo(null);
              
              router.back();
            }
          }
        ]);
      } else {
        Alert.alert('Error', result.message || 'Failed to submit animal listing');
      }
    } catch (error: any) {
      console.error('💥 Submission error:', error);
      
      if (error.name === 'AbortError') {
        Alert.alert('Timeout Error', 'Upload is taking too long. Please check your connection and try again.');
      } else {
        Alert.alert('Error', 'Failed to submit listing. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getCategoryId = (animalType: string, selectedOther: string) => {
    switch (animalType) {
      case 'गाय': return 1;
      case 'भैंस': return 2;
      case 'अन्य':
        switch (selectedOther) {
          case 'बैल (Ox)': return 3;
          case 'भेसा (Male Buffalo)': return 4;
          default: return 5;
        }
      default: return 1;
    }
  };

  const getBreedDescription = (breed: string, selectedOther: string) => {
    if (breed === 'अन्य' && selectedOther) {
      return selectedOther;
    }
    return breed;
  };

  const getLactationNumber = (breed: string, selectedOther: string) => {
    const breedMap: { [key: string]: number } = {
      'ब्यावी नहीं': 0,
      'पहला': 1,
      'दूसरा': 2,
      'तीसरा (3rd)': 3,
      'चौथा (4th)': 4,
      'पांचवा (5th)': 5,
      'छठा (6th)': 6,
      'सातवां (7th)': 7
    };
    
    if (breed === 'अन्य' && selectedOther) {
      return breedMap[selectedOther] || null;
    }
    return breedMap[breed] || null;
  };

  // Media picker functions
  const pickMedia = async (type: 'video' | 'photo', mediaType: 'general' | 'udder' | 'milking') => {
    try {
      Alert.alert(
        'Select Media',
        'Choose media source',
        [
          {
            text: 'Camera',
            onPress: () => openCamera(type, mediaType)
          },
          {
            text: 'Gallery',
            onPress: () => openGallery(type, mediaType)
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to open media picker');
    }
  };

  const openCamera = async (type: 'video' | 'photo', mediaType: 'general' | 'udder' | 'milking') => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take photos/videos');
        return;
      }

      // Show loading indicator
      Alert.alert('Processing', 'Please wait while we prepare your media...');

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: type === 'video' ? ImagePicker.MediaTypeOptions.Videos : ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1.0, // Start with high quality, we'll compress smartly
        videoMaxDuration: 600, // 10 minutes max (we'll compress if needed)
        videoQuality: ImagePicker.UIImagePickerControllerQualityType.High,
      });

      if (!result.canceled && result.assets[0]) {
        const media = result.assets[0];
        
        console.log(`📱 Camera ${type} captured:`, {
          uri: media.uri,
          type: media.type,
          fileSize: media.fileSize,
          fileName: media.fileName
        });

        // Apply smart compression
        let processedMedia: ImagePicker.ImagePickerAsset;
        
        if (type === 'video') {
          processedMedia = await MediaCompressor.compressVideo(media.uri);
        } else {
          processedMedia = await MediaCompressor.compressImage(media.uri);
        }
        
        // Show compression results
        const originalSize = media.fileSize || 0;
        const newSize = processedMedia.fileSize || 0;
        const saved = originalSize - newSize;
        
        if (saved > 0) {
          const savedMB = (saved / 1024 / 1024).toFixed(1);
          console.log(`💾 Saved ${savedMB}MB through compression`);
        }
        
        switch (mediaType) {
          case 'general':
            setGeneralVideo(processedMedia);
            break;
          case 'udder':
            setUdderPhoto(processedMedia);
            break;
          case 'milking':
            setMilkingVideo(processedMedia);
            break;
        }

        Alert.alert(
          'Media Ready', 
          `${type === 'video' ? 'Video' : 'Photo'} processed successfully!${saved > 0 ? ` Saved ${(saved / 1024 / 1024).toFixed(1)}MB through smart compression.` : ''}`
        );
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to process media. Please try again.');
    }
  };

  const openGallery = async (type: 'video' | 'photo', mediaType: 'general' | 'udder' | 'milking') => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Gallery permission is required to select photos/videos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: type === 'video' ? ImagePicker.MediaTypeOptions.Videos : ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1.0, // Start with high quality
        videoMaxDuration: 600, // 10 minutes max
        videoQuality: ImagePicker.UIImagePickerControllerQualityType.High,
      });

      if (!result.canceled && result.assets[0]) {
        const media = result.assets[0];
        const originalSize = media.fileSize || 0;
        const originalSizeMB = (originalSize / 1024 / 1024).toFixed(1);
        
        console.log(`📂 Gallery ${type} selected:`, {
          uri: media.uri,
          type: media.type,
          fileSize: media.fileSize,
          fileName: media.fileName
        });

        // Show processing indicator for large files
        if (originalSize > 10 * 1024 * 1024) { // > 10MB
          Alert.alert('Processing', `Processing ${originalSizeMB}MB ${type}. This may take a moment...`);
        }

        try {
          // Apply smart compression
          let processedMedia: ImagePicker.ImagePickerAsset;
          
          if (type === 'video') {
            processedMedia = await MediaCompressor.compressVideo(media.uri);
          } else {
            processedMedia = await MediaCompressor.compressImage(media.uri);
          }
          
          // Calculate savings
          const newSize = processedMedia.fileSize || 0;
          const saved = originalSize - newSize;
          const compressionRatio = saved > 0 ? ((saved / originalSize) * 100).toFixed(1) : '0';
          
          console.log(`💾 Compression results:`, {
            original: `${originalSizeMB}MB`,
            compressed: `${(newSize / 1024 / 1024).toFixed(1)}MB`,
            saved: `${(saved / 1024 / 1024).toFixed(1)}MB`,
            ratio: `${compressionRatio}%`
          });
          
          switch (mediaType) {
            case 'general':
              setGeneralVideo(processedMedia);
              break;
            case 'udder':
              setUdderPhoto(processedMedia);
              break;
            case 'milking':
              setMilkingVideo(processedMedia);
              break;
          }

          // Show success message with compression info
          const message = saved > 1024 * 1024 ? // > 1MB saved
            `${type === 'video' ? 'Video' : 'Photo'} ready! Compressed from ${originalSizeMB}MB to ${(newSize / 1024 / 1024).toFixed(1)}MB (${compressionRatio}% smaller)` :
            `${type === 'video' ? 'Video' : 'Photo'} ready!`;
            
          Alert.alert('Success', message);

        } catch (compressionError) {
          console.error('Compression failed:', compressionError);
          
          // Fallback: use original file if compression fails
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
          
          Alert.alert('Media Added', `${type === 'video' ? 'Video' : 'Photo'} added successfully (original quality preserved).`);
        }
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to process media. Please try again.');
    }
  };

  const removeMedia = (mediaType: 'general' | 'udder' | 'milking') => {
    Alert.alert(
      'Remove Media',
      'Are you sure you want to remove this media?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            switch (mediaType) {
              case 'general':
                setGeneralVideo(null);
                break;
              case 'udder':
                setUdderPhoto(null);
                break;
              case 'milking':
                setMilkingVideo(null);
                break;
            }
          }
        }
      ]
    );
  };

  const renderSectionHeader = (title: string, icon: string) => (
    <View style={styles.sectionHeader}>
      <Icon name={icon} size={20} color="#666" />
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.requiredStar}>*</Text>
    </View>
  );

  const renderAnimalTypeSection = () => (
    <View style={styles.section}>
      {renderSectionHeader('कौन सा पशु', 'cow')}
      <View style={styles.buttonGroup}>
        {['गाय', 'भैंस'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.selectionButton,
              animalType === type && styles.selectedButton
            ]}
            onPress={() => {
              setAnimalType(type);
              setShowAnimalDropdown(false);
              setSelectedOtherAnimal('');
            }}
          >
            <Text style={[
              styles.selectionText,
              animalType === type && styles.selectedText
            ]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
        
        {/* अन्य with dropdown */}
        <TouchableOpacity
          style={[
            styles.selectionButton,
            (animalType === 'अन्य' || selectedOtherAnimal) && styles.selectedButton
          ]}
          onPress={() => setShowAnimalDropdown(!showAnimalDropdown)}
        >
          <Text style={[
            styles.selectionText,
            (animalType === 'अन्य' || selectedOtherAnimal) && styles.selectedText
          ]}>
            {selectedOtherAnimal || 'अन्य'}
          </Text>
          <Icon 
            name={showAnimalDropdown ? "chevron-up" : "chevron-down"} 
            size={16} 
            color={(animalType === 'अन्य' || selectedOtherAnimal) ? "#fff" : "#666"} 
          />
        </TouchableOpacity>
      </View>
      
      {/* Dropdown for अन्य options */}
      {showAnimalDropdown && (
        <View style={styles.dropdown}>
          {['बैल (Ox)', 'भेसा (Male Buffalo)', 'Other'].map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.dropdownItem}
              onPress={() => {
                setSelectedOtherAnimal(option);
                setAnimalType('अन्य');
                setShowAnimalDropdown(false);
              }}
            >
              <Text style={styles.dropdownText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderBreedSection = () => (
    <View style={styles.section}>
      {renderSectionHeader('कौन सा ब्यात', 'cow')}
      <View style={styles.buttonGroup}>
        {['ब्यावी नहीं', 'पहला', 'दूसरा'].map((breedType) => (
          <TouchableOpacity
            key={breedType}
            style={[
              styles.selectionButton,
              breed === breedType && styles.selectedButton
            ]}
            onPress={() => {
              setBreed(breedType);
              setShowBreedDropdown(false);
              setSelectedOtherBreed('');
            }}
          >
            <Text style={[
              styles.selectionText,
              breed === breedType && styles.selectedText
            ]}>
              {breedType}
            </Text>
          </TouchableOpacity>
        ))}
        
        {/* अन्य with dropdown */}
        <TouchableOpacity
          style={[
            styles.selectionButton,
            (breed === 'अन्य' || selectedOtherBreed) && styles.selectedButton
          ]}
          onPress={() => setShowBreedDropdown(!showBreedDropdown)}
        >
          <Text style={[
            styles.selectionText,
            (breed === 'अन्य' || selectedOtherBreed) && styles.selectedText
          ]}>
            {selectedOtherBreed || 'अन्य'}
          </Text>
          <Icon 
            name={showBreedDropdown ? "chevron-up" : "chevron-down"} 
            size={16} 
            color={(breed === 'अन्य' || selectedOtherBreed) ? "#fff" : "#666"} 
          />
        </TouchableOpacity>
      </View>
      
      {/* Dropdown for अन्य options */}
      {showBreedDropdown && (
        <View style={styles.dropdown}>
          {['तीसरा (3rd)', 'चौथा (4th)', 'पांचवा (5th)', 'छठा (6th)', 'सातवां (7th)'].map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.dropdownItem}
              onPress={() => {
                setSelectedOtherBreed(option);
                setBreed('अन्य');
                setShowBreedDropdown(false);
              }}
            >
              <Text style={styles.dropdownText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderMilkSection = () => (
    <View style={styles.section}>
      {renderSectionHeader('अभी का दूध (प्रति-दिन)', 'cup-water')}
      <Text style={styles.subLabel}>आज का 2 समय का कुल दूध</Text>
      <View style={styles.inputWithUnit}>
        <TextInput 
          style={styles.numberInput}
          value={currentMilk}
          onChangeText={setCurrentMilk}
          placeholder="जैसे: 10"
          keyboardType="numeric"
        />
        <View style={styles.unitContainer}>
          <Text style={styles.unitText}>लीटर</Text>
        </View>
      </View>
      
      {/* Max Milk Yield Section */}
      <Text style={[styles.subLabel, { marginTop: 16 }]}>अधिकतम दूध क्षमता (प्रति-दिन)</Text>
      <View style={styles.inputWithUnit}>
        <TextInput 
          style={styles.numberInput}
          value={maxMilk}
          onChangeText={setMaxMilk}
          placeholder="जैसे: 15"
          keyboardType="numeric"
        />
        <View style={styles.unitContainer}>
          <Text style={styles.unitText}>लीटर</Text>
        </View>
      </View>
    </View>
  );

  const renderPriceSection = () => (
    <View style={styles.section}>
      {renderSectionHeader('रेट (₹)', 'currency-inr')}
      <Text style={styles.subLabel}>सही रेट डालें, उससे ज्यादा ग्राहक कॉल करते हैं</Text>
      <View style={styles.inputWithUnit}>
        <TextInput 
          style={styles.numberInput}
          value={price}
          onChangeText={setPrice}
          placeholder="जैसे: ₹40,000"
          keyboardType="numeric"
        />
        <View style={styles.unitContainer}>
          <Text style={styles.unitText}>रुपए</Text>
        </View>
      </View>
      
      {/* Price Check Feature */}
      <TouchableOpacity style={styles.priceCheckButton}>
        <Icon name="information" size={20} color="#2196F3" />
        <Text style={styles.priceCheckText}>इस पशु का सही रेट जानें</Text>
        <Text style={styles.checkText}>चेक करें</Text>
        <Icon name="arrow-right" size={16} color="#2196F3" />
      </TouchableOpacity>
    </View>
  );

  const renderSellDurationSection = () => (
    <View style={styles.section}>
      {renderSectionHeader('कितने दिन में बेचना है', 'calendar')}
      <View style={styles.buttonGroup}>
        {['1 से 3 दिन', '4 से 7 दिन', 'हफ्ते से ज्यादा'].map((duration) => (
          <TouchableOpacity
            key={duration}
            style={[
              styles.selectionButton,
              sellDuration === duration && styles.selectedButton
            ]}
            onPress={() => setSellDuration(duration)}
          >
            <Text style={[
              styles.selectionText,
              sellDuration === duration && styles.selectedText
            ]}>
              {duration}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderPreferredAnimalSection = () => (
    <View style={styles.section}>
      {renderSectionHeader('कैसा पशु बेचना चाहते हो ?', 'home')}
      <View style={styles.buttonGroup}>
        {['खूंटे का पशु', 'मंडी का पशु'].map((preference) => (
          <TouchableOpacity
            key={preference}
            style={[
              styles.selectionButton,
              preferredAnimal === preference && styles.selectedButton
            ]}
            onPress={() => setPreferredAnimal(preference)}
          >
            <Text style={[
              styles.selectionText,
              preferredAnimal === preference && styles.selectedText
            ]}>
              {preference}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderMediaSection = () => (
    <View style={styles.section}>
      {renderSectionHeader('वीडियो या फोटो डालें', 'camera')}
      <Text style={styles.subLabel}>अच्छी फोटो डालने पर जल्दी बिकती है</Text>
      
      <View style={styles.mediaContainer}>
        {/* Top Row - Video and Photo side by side */}
        <View style={styles.mediaRow}>
          {/* General Video Upload */}
          <View style={styles.mediaBox}>
            <Text style={styles.mediaTitle}>वीडियो चुनें</Text>
                         {generalVideo ? (
               <View style={styles.mediaPreview}>
                 <Image 
                   source={{ uri: generalVideo.uri }} 
                   style={styles.mediaThumbnail}
                   resizeMode="cover"
                 />
                 <View style={styles.mediaOverlay}>
                   <Icon name="video" size={20} color="#fff" />
                   <Text style={styles.mediaPreviewText}>Video Selected</Text>
                 </View>
                 <TouchableOpacity 
                   style={styles.removeMediaButton}
                   onPress={() => removeMedia('general')}
                 >
                   <Icon name="close" size={16} color="#D32F2F" />
                 </TouchableOpacity>
               </View>
             ) : (
              <>
                <View style={styles.mediaIconContainer}>
                  <Icon name="video" size={32} color="#999" />
                </View>
                <TouchableOpacity 
                  style={styles.mediaButton}
                  onPress={() => pickMedia('video', 'general')}
                >
                  <Text style={styles.mediaButtonText}>वीडियो चुनें</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Udder Photo Upload */}
          <View style={styles.mediaBox}>
            <Text style={styles.mediaTitle}>धन का फोटो चुनें</Text>
                         {udderPhoto ? (
               <View style={styles.mediaPreview}>
                 <Image 
                   source={{ uri: udderPhoto.uri }} 
                   style={styles.mediaThumbnail}
                   resizeMode="cover"
                 />
                 <View style={styles.mediaOverlay}>
                   <Icon name="image" size={20} color="#fff" />
                   <Text style={styles.mediaPreviewText}>Photo Selected</Text>
                 </View>
                 <TouchableOpacity 
                   style={styles.removeMediaButton}
                   onPress={() => removeMedia('udder')}
                 >
                   <Icon name="close" size={16} color="#D32F2F" />
                 </TouchableOpacity>
               </View>
             ) : (
              <>
                <View style={styles.mediaIconContainer}>
                  <Icon name="cow" size={32} color="#999" />
                </View>
                <TouchableOpacity 
                  style={styles.mediaButton}
                  onPress={() => pickMedia('photo', 'udder')}
                >
                  <Text style={styles.mediaButtonText}>फोटो चुनें</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Bottom Row - Full width milking video */}
        <View style={styles.mediaBoxFull}>
          <Text style={styles.mediaTitle}>दूध दुहाई का वीडियो डालें</Text>
                     {milkingVideo ? (
             <View style={styles.mediaPreview}>
               <Image 
                 source={{ uri: milkingVideo.uri }} 
                 style={styles.mediaThumbnail}
                 resizeMode="cover"
               />
               <View style={styles.mediaOverlay}>
                 <Icon name="video" size={20} color="#fff" />
                 <Text style={styles.mediaPreviewText}>Milking Video Selected</Text>
               </View>
               <TouchableOpacity 
                 style={styles.removeMediaButton}
                 onPress={() => removeMedia('milking')}
               >
                 <Icon name="close" size={16} color="#D32F2F" />
               </TouchableOpacity>
             </View>
           ) : (
            <>
              <View style={styles.mediaIconContainer}>
                <Icon name="cup-water" size={32} color="#999" />
              </View>
              <TouchableOpacity 
                style={styles.mediaButton}
                onPress={() => pickMedia('video', 'milking')}
              >
                <Text style={styles.mediaButtonText}>वीडियो चुनें</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );

  const renderAdditionalInfoSection = () => (
    <View style={styles.section}>
      <TouchableOpacity 
        style={styles.expandableHeader}
        onPress={() => setShowAdditionalInfo(!showAdditionalInfo)}
      >
        <Text style={styles.expandableTitle}>और जानकारी डालें</Text>
        <Icon 
          name={showAdditionalInfo ? "chevron-up" : "chevron-down"} 
          size={24} 
          color="#D32F2F" 
        />
      </TouchableOpacity>
      
      {showAdditionalInfo && (
        <View style={styles.additionalContent}>
          {/* Add more fields here as needed */}
          <TextInput
            style={styles.textArea}
            placeholder="अतिरिक्त जानकारी..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={additionalInfo}
            onChangeText={setAdditionalInfo}
          />
        </View>
      )}
    </View>
  );

  const renderLocationSection = () => (
    <View style={styles.section}>
      {renderSectionHeader('जगह', 'map-marker')}
      <Text style={styles.subLabel}>खरीदारों को आपका पशु इस जगह दिखेगा</Text>
      <View style={styles.locationInputContainer}>
        <TextInput 
          style={styles.locationInput}
          value={location}
          onChangeText={setLocation}
          placeholder="Enter location"
        />
        <TouchableOpacity style={styles.changeLocationButton}>
          <Text style={styles.changeLocationText}>बदलें</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.freeListingText}>हर 30 दिन में 1 पशु फ्री में दर्ज कर पायंगे</Text>
      
      {/* Help Section */}
      <View style={styles.helpSection}>
        <Text style={styles.helpText}>मदद चाहिए ?</Text>
        <TouchableOpacity style={styles.whatsappButton}>
          <Icon name="whatsapp" size={20} color="#25D366" />
          <Text style={styles.whatsappButtonText}>हमसे बात करें</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBottomSection = () => (
    <View style={styles.bottomSection}>
      <View style={styles.liveUsersContainer}>
        <View style={styles.liveIndicator}>
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        <Icon name="account-group" size={20} color="#666" />
        <Text style={styles.liveUsersText}>200 खरीदार पशु ढूंढ रहे हैं</Text>
      </View>
      
      <TouchableOpacity 
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? 'Submitting...' : 'दर्ज करें'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        {/* Header */}
        <CommonHeader title="पशु बेचें" />
        
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView 
            ref={scrollViewRef}
            style={styles.scrollView} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {/* Page Title */}
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>पशु बेचें</Text>
              <TouchableOpacity style={styles.myAnimalsButton}>
                <Text style={styles.myAnimalsText}>मेरे पशु</Text>
                <Icon name="chevron-right" size={16} color="#990906" />
              </TouchableOpacity>
            </View>

            {/* Free Listing Banner */}
            <View style={styles.freeBanner}>
              <Icon name="information" size={20} color="#4CAF50" />
              <Text style={styles.freeBannerText}>FREE में पशु दर्ज करें</Text>
            </View>

            {/* Form Sections */}
            {renderAnimalTypeSection()}
            {renderBreedSection()}
            {renderMilkSection()}
            {renderPriceSection()}
            {renderSellDurationSection()}
            {renderPreferredAnimalSection()}
            {renderMediaSection()}
            {renderAdditionalInfoSection()}
            {renderLocationSection()}
            
            {/* Bottom spacing for navigation */}
            <View style={styles.bottomSpacing} />
          </ScrollView>
        </KeyboardAvoidingView>

        {renderBottomSection()}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  scrollView: {
    flex: 1,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  myAnimalsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  myAnimalsText: {
    color: '#990906',
    fontWeight: 'bold',
    marginRight: 4,
  },
  freeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  freeBannerText: {
    marginLeft: 8,
    color: '#4CAF50',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  requiredStar: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedButton: {
    backgroundColor: '#990906',
    borderColor: '#990906',
  },
  selectionText: {
    color: '#666',
    fontWeight: '500',
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  inputWithUnit: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FAFAFA',
  },
  numberInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  unitContainer: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#E0E0E0',
  },
  unitText: {
    color: '#666',
    fontWeight: '500',
  },
  priceCheckButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  priceCheckText: {
    flex: 1,
    marginLeft: 8,
    color: '#2196F3',
    fontWeight: '500',
  },
  checkText: {
    color: '#2196F3',
    fontWeight: 'bold',
    marginRight: 8,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mediaContainer: {
    gap: 12,
  },
  mediaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  mediaBox: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    minHeight: 120,
  },
  mediaBoxFull: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    minHeight: 120,
  },
  mediaTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  mediaIconContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
  },
  mediaButton: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  mediaButtonText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '500',
  },
  mediaPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    padding: 8,
    position: 'relative',
  },
  mediaPreviewText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  removeMediaButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D32F2F',
  },
  mediaThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  mediaOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownText: {
    color: '#333',
    fontSize: 14,
  },
  expandableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  expandableTitle: {
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  additionalContent: {
    marginTop: 12,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    height: 80,
    textAlignVertical: 'top',
  },
  locationInputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  locationInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  changeLocationButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#E0E0E0',
  },
  changeLocationText: {
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  freeListingText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    marginBottom: 16,
  },
  helpSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  helpText: {
    color: '#666',
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#25D366',
  },
  whatsappButtonText: {
    color: '#25D366',
    marginLeft: 4,
    fontWeight: '500',
  },
  bottomSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  liveUsersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  liveIndicator: {
    backgroundColor: '#D32F2F',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  liveText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  liveUsersText: {
    color: '#666',
    marginLeft: 4,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default AnimalSellScreen;