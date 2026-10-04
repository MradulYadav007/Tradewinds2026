/** Local media starts with /media/; external media uses an HTTPS URL. */
export interface MediaAsset {
  type?: 'image' | 'video';
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  poster?: string;
  sources?: { src: string; width: number }[];
}
export type MediaLike = MediaAsset | string | null;

export interface Event {
  id: string; name: string; category: string; organizer: string; clubId: string | null;
  date: string; time: string; venue: string; format: string; status: string;
  featured: boolean; image: MediaLike; registrationUrl: string;
}

export interface Speaker {
  id: string; name: string; role: string; bio: string; image: MediaLike; featured: boolean;
  website: string | null; description: string; club?: string;
}

export interface Club {
  id: string; name: string; description: string; logo: MediaLike; src: string;
}
