import imageCompression from "browser-image-compression";

export type CompressResult = {
  file: File;
  previewUrl: string;
};

export async function compressForWardrobe(input: File): Promise<CompressResult> {
  const options = {
    maxSizeMB: 0.35,          // mik op ~200–400KB
    maxWidthOrHeight: 1400,   // prima voor kledingfoto’s
    useWebWorker: true,       // houdt UI smooth
    fileType: "image/webp",   // force WebP
    initialQuality: 0.8,      // goede balans
  } as const;

  const compressedBlob = await imageCompression(input, options);

  // browser-image-compression geeft een File/Blob terug; we maken er expliciet een File van
  const file = new File([compressedBlob], makeWebpName(input.name), {
    type: "image/webp",
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

function makeWebpName(original: string) {
  const base = original.replace(/\.[^/.]+$/, "");
  return `${base}.webp`;
}