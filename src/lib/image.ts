import imageCompression from "browser-image-compression";

export type CompressResult = {
  file: File;
  previewUrl: string;
};

/** Check if canvas can encode WebP (iOS Safari cannot) */
function canEncodeWebp(): boolean {
  try {
    const c = document.createElement("canvas");
    c.width = 1;
    c.height = 1;
    return c.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    return false;
  }
}

export async function compressForWardrobe(input: File): Promise<CompressResult> {
  const useWebp = canEncodeWebp();
  const targetType = useWebp ? "image/webp" : "image/jpeg";
  const ext = useWebp ? "webp" : "jpg";

  const options = {
    maxSizeMB: 0.35,
    maxWidthOrHeight: 1400,
    useWebWorker: true,
    fileType: targetType,
    initialQuality: 0.8,
  } as const;

  const compressedBlob = await imageCompression(input, options);

  const file = new File([compressedBlob], makeFileName(input.name, ext), {
    type: targetType,
  });

  const previewUrl = URL.createObjectURL(file);

  return { file, previewUrl };
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

function makeFileName(original: string, ext: string) {
  const base = original.replace(/\.[^/.]+$/, "");
  return `${base}.${ext}`;
}
