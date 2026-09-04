import { projectId, publicAnonKey } from '/utils/supabase/info';
import { Color } from './ColorExtractor';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-db88b16c`;

export interface GalleryEntry {
  id: string;
  colors: Color[];
  palette: Color[];
  title: string;
  author?: string;
  imageSrc?: string;
  createdAt: string;
}

export async function fetchGalleryEntries(): Promise<GalleryEntry[]> {
  const res = await fetch(`${API_BASE}/gallery`, {
    headers: { Authorization: `Bearer ${publicAnonKey}` },
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.entries || [];
}

export async function saveToGallery(params: {
  colors: Color[];
  palette: Color[];
  title?: string;
  author?: string;
  imageSrc?: string;
}): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/gallery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        colors: params.colors,
        palette: params.palette,
        title: params.title || 'Untitled',
        author: params.author || 'Anonymous',
        imageSrc: params.imageSrc || null,
      }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error('Error saving to gallery:', errData);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error saving to gallery:', err);
    return false;
  }
}
