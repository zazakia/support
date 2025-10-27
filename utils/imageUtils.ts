import * as ImageManipulator from 'expo-image-manipulator';

export interface ImageInfo {
  uri: string;
  width: number;
  height: number;
  fileName?: string;
  fileSize?: number;
}

export const compressAndResizeImage = async (
  imageUri: string,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<ImageInfo> => {
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      imageUri,
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
      }
    );

    return {
      uri: manipResult.uri,
      width: manipResult.width,
      height: manipResult.height,
      fileName: manipResult.uri.split('/').pop(),
    };
  } catch (error) {
    console.error('Error compressing image:', error);
    // Return original image if compression fails
    return {
      uri: imageUri,
      width: 0,
      height: 0,
    };
  }
};

export const validateImage = (
  imageUri: string,
  maxSizeMB: number = 10,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/jpg']
): { isValid: boolean; error?: string } => {
  // Basic validation - in a real app, you'd check file size and type
  // For now, we'll assume images are valid if they have a URI
  if (!imageUri || imageUri.trim() === '') {
    return { isValid: false, error: 'Image URI is required' };
  }

  return { isValid: true };
};

export const generateImageFileName = (jobId: string, index: number): string => {
  const timestamp = Date.now();
  return `job-${jobId}-image-${index}-${timestamp}.jpg`;
};