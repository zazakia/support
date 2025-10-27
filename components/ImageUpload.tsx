import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  ScrollView,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ImageIcon, X, Plus, Trash2 } from 'lucide-react-native';
import { compressAndResizeImage, validateImage, generateImageFileName, ImageInfo } from '../utils/imageUtils';
import { uploadImage, deleteImage } from '../utils/supabaseClient';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  jobId?: string;
}

export default function ImageUpload({
  images,
  onImagesChange,
  maxImages = 5,
  jobId
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and photo library permissions are required to upload images.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const pickImage = async (fromCamera: boolean = false) => {
    if (images.length >= maxImages) {
      Alert.alert('Limit Reached', `You can only upload up to ${maxImages} images.`);
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
            allowsMultipleSelection: true,
            selectionLimit: maxImages - images.length,
          });

      if (!result.canceled) {
        await handleImageSelection(result.assets);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const handleImageSelection = async (selectedImages: ImagePicker.ImagePickerAsset[]) => {
    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const asset of selectedImages) {
        // Validate image
        const validation = validateImage(asset.uri);
        if (!validation.isValid) {
          Alert.alert('Invalid Image', validation.error || 'Image is not valid');
          continue;
        }

        // Compress and resize
        const compressedImage = await compressAndResizeImage(asset.uri);

        // Generate filename
        const fileName = generateImageFileName(jobId || 'temp', images.length + uploadedUrls.length);

        // Upload to Supabase
        const imageUrl = await uploadImage(compressedImage.uri, fileName);
        uploadedUrls.push(imageUrl);
      }

      if (uploadedUrls.length > 0) {
        onImagesChange([...images, ...uploadedUrls]);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      Alert.alert('Upload Failed', 'Failed to upload one or more images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (index: number) => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const imageUrl = images[index];
              // Extract filename from URL for deletion
              const fileName = imageUrl.split('/').pop();
              if (fileName) {
                await deleteImage(fileName);
              }

              const newImages = images.filter((_, i) => i !== index);
              onImagesChange(newImages);
            } catch (error) {
              console.error('Error removing image:', error);
              Alert.alert('Error', 'Failed to remove image. Please try again.');
            }
          }
        }
      ]
    );
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onImagesChange(newImages);
  };

  const showImageOptions = () => {
    Alert.alert(
      'Add Images',
      'Choose how to add images',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Take Photo',
          onPress: () => pickImage(true)
        },
        {
          text: 'Choose from Gallery',
          onPress: () => pickImage(false)
        }
      ]
    );
  };

  const openImageModal = (index: number) => {
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Images ({images.length}/{maxImages})</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.imageScrollView}
        contentContainerStyle={styles.imageContainer}
      >
        {images.map((imageUri, index) => (
          <TouchableOpacity
            key={index}
            style={styles.imageWrapper}
            onPress={() => openImageModal(index)}
          >
            <Image source={{ uri: imageUri }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeImage(index)}
            >
              <X size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        {images.length < maxImages && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={showImageOptions}
            disabled={uploading}
          >
            {uploading ? (
              <Text style={styles.addButtonText}>Uploading...</Text>
            ) : (
              <>
                <Plus size={24} color="#64748B" />
                <Text style={styles.addButtonText}>Add Image</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Full Screen Image Modal */}
      <Modal
        visible={showImageModal}
        animationType="fade"
        presentationStyle="overFullScreen"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowImageModal(false)}
          >
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {selectedImageIndex !== null && (
            <Image
              source={{ uri: images[selectedImageIndex] }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  imageScrollView: {
    maxHeight: 120,
  },
  imageContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#DC2626',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  addButtonText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
});