import { createClient } from "@/lib/supabase/client";

export async function uploadWardrobePhoto(params: {
  userId: string;
  itemId: string;
  file: File; // jouw gecomprimeerde WebP
}) {
  const supabase = createClient();

  const path = `${params.userId}/${params.itemId}.webp`;

  const { error } = await supabase.storage
    .from("wardrobe")
    .upload(path, params.file, {
      contentType: "image/webp",
      upsert: true,
    });

  if (error) throw error;

  return path; // opslaan in DB
}

export async function getWardrobePhotoSignedUrl(path: string, expiresInSeconds = 3600) {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from("wardrobe")
    .createSignedUrl(path, expiresInSeconds);

  if (error) throw error;
  return data.signedUrl;
}