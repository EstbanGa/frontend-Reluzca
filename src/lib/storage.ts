import { supabase } from "./supabase";

const BUCKET = "reluzca";
const FOTOS_FOLDER = "fotos";

export interface UploadFotoResult {
  url: string;
  path: string;
}

/**
 * Uploads a service photo to Supabase Storage.
 * Path structure: fotos/{empleadaId}/{reservaId}/{uuid}.ext
 */
export async function uploadFotoServicio(
  file: File,
  empleadaId: string,
  reservaId: string
): Promise<UploadFotoResult> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const uuid = crypto.randomUUID();
  const path = `${FOTOS_FOLDER}/${empleadaId}/${reservaId}/${uuid}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) throw new Error(`Error subiendo foto: ${error.message}`);

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return { url: urlData.publicUrl, path };
}

/**
 * Deletes a photo from Supabase Storage given its public URL.
 * Extracts the path from the URL automatically.
 */
export async function deleteFotoServicio(publicUrl: string): Promise<void> {
  // Extract path after "/object/public/{bucket}/"
  const marker = `/object/public/${BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return; // Not a Supabase URL — nothing to delete

  const path = publicUrl.slice(idx + marker.length);
  await supabase.storage.from(BUCKET).remove([path]);
}
