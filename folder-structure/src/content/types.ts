/** Local media starts with /media/; external media uses an HTTPS URL. */
export interface MediaAsset {
  type: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  poster?: string;
  sources?: { src: string; width: number }[];
}
export interface Event {
  id: string; name: string; category: string; organizer: string; clubId: string | null;
  date: string; time: string; venue: string; format: string; status: string;
  featured: boolean; image: MediaAsset | null; registrationUrl: string;
}
export interface Speaker { id: string; name: string; role: string; bio: string; image: MediaAsset | null; featured: boolean }
export interface Club { id: string; name: string; description: string; logo: MediaAsset | null }
