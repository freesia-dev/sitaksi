// imgBB API integration for image uploads
const IMGBB_API_KEY = '413570b3dcbc4d9ab9477dd28d573d98';

export interface ImgBBResponse {
  success: boolean;
  data?: {
    url: string;
    display_url: string;
    delete_url: string;
    thumb: {
      url: string;
    };
  };
  error?: {
    message: string;
  };
}

export async function uploadToImgBB(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('key', IMGBB_API_KEY);

  try {
    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData,
    });

    const result: ImgBBResponse = await response.json();

    if (result.success && result.data) {
      // Prefer direct image URL for reliable hotlinking
      return result.data.url;
    }

    throw new Error(result.error?.message || 'Upload failed');
  } catch (error) {
    console.error('ImgBB upload error:', error);
    throw error;
  }
}

export async function uploadMultipleToImgBB(files: File[]): Promise<string[]> {
  const uploadPromises = files.map(file => uploadToImgBB(file));
  return Promise.all(uploadPromises);
}
