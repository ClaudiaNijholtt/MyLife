type SignedUrlCacheEntry = {
  url: string;
  expiresAt: number;
};

const signedUrlMemoryCache = new Map<string, SignedUrlCacheEntry>();
const SIGNED_URL_CACHE_KEY = "wardrobe:signed-url-cache:v1";
const SIGNED_URL_EXPIRY_SAFETY_MS = 30_000;

function getCacheKey(path: string, expiresInSeconds: number) {
  return `${path}|${expiresInSeconds}`;
}

function readSessionCache(): Record<string, SignedUrlCacheEntry> {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.sessionStorage.getItem(SIGNED_URL_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, SignedUrlCacheEntry>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeSessionCache(cache: Record<string, SignedUrlCacheEntry>) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(SIGNED_URL_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore cache write failures (quota/private mode)
  }
}

function getCachedSignedUrl(path: string, expiresInSeconds: number): string | null {
  const cacheKey = getCacheKey(path, expiresInSeconds);
  const now = Date.now();

  const fromMemory = signedUrlMemoryCache.get(cacheKey);
  if (fromMemory && fromMemory.expiresAt > now) {
    return fromMemory.url;
  }

  const sessionCache = readSessionCache();
  const fromSession = sessionCache[cacheKey];

  if (fromSession && fromSession.expiresAt > now) {
    signedUrlMemoryCache.set(cacheKey, fromSession);
    return fromSession.url;
  }

  if (fromSession) {
    delete sessionCache[cacheKey];
    writeSessionCache(sessionCache);
  }

  if (fromMemory) {
    signedUrlMemoryCache.delete(cacheKey);
  }

  return null;
}

function setCachedSignedUrl(path: string, expiresInSeconds: number, url: string) {
  const cacheKey = getCacheKey(path, expiresInSeconds);
  const expiresAt = Date.now() + expiresInSeconds * 1000 - SIGNED_URL_EXPIRY_SAFETY_MS;
  const entry: SignedUrlCacheEntry = {
    url,
    expiresAt,
  };

  signedUrlMemoryCache.set(cacheKey, entry);

  const sessionCache = readSessionCache();
  sessionCache[cacheKey] = entry;
  writeSessionCache(sessionCache);
}

export async function uploadWardrobePhoto(params: {
  userId: string;
  itemId: string;
  file: File;
}) {
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();

  const path = `${params.userId}/${params.itemId}.webp`;

  const { error } = await supabase.storage
    .from("wardrobe")
    .upload(path, params.file, {
      contentType: "image/webp",
      upsert: true,
    });

  if (error) throw error;
  return path;
}

export async function getWardrobePhotoSignedUrl(path: string, expiresInSeconds = 3600) {
  const cached = getCachedSignedUrl(path, expiresInSeconds);
  if (cached) return cached;

  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from("wardrobe")
    .createSignedUrl(path, expiresInSeconds);

  if (error) throw error;
  setCachedSignedUrl(path, expiresInSeconds, data.signedUrl);
  return data.signedUrl;
}

export async function deleteWardrobePhoto(path: string) {
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  const { error } = await supabase.storage
    .from("wardrobe")
    .remove([path]);

  if (error) throw error;
}