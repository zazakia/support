import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found. Image upload functionality will not work.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket name for job images
export const IMAGES_BUCKET = 'greenware717_job-images';

export const uploadImage = async (fileUri: string, fileName: string): Promise<string> => {
  try {
    // Convert URI to blob
    const response = await fetch(fileUri);
    const blob = await response.blob();

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(IMAGES_BUCKET)
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(IMAGES_BUCKET)
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
};

export const deleteImage = async (fileName: string): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from(IMAGES_BUCKET)
      .remove([fileName]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image');
  }
};