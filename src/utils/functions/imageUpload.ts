import { toast } from 'sonner';

const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

export const uploadToImgBB = async (file: File): Promise<string | null> => {
  if (!IMGBB_API_KEY) {
    toast.error('ImgBB API key is missing');
    console.error('NEXT_PUBLIC_IMGBB_API_KEY is not defined');
    return null;
  }

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();

    if (data.success) {
      return data.data.url;
    } else {
      console.error('ImgBB Upload Error:', data);
      toast.error('Failed to upload image');
      return null;
    }
  } catch (error) {
    console.error('Error uploading to ImgBB:', error);
    toast.error('Error uploading image');
    return null;
  }
};
