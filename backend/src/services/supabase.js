import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BUCKET = "test";

export async function uploadVideoToSupabase(fileBuffer, fileName, mimeType) {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, fileBuffer, {
      contentType: mimeType,
      upsert: true
    });

  if (error) throw error;

  const { data } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(fileName, 60 * 60);

  return data.signedUrl; // return video URL
}
