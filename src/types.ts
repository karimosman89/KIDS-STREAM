export interface VideoContent {
  id: string;
  title: Record<string, string>; // Multilingual titles: { ar, en, fr, de, es, it }
  description: Record<string, string>; // Multilingual descriptions
  poster: string;
  banner: string;
  type: 'movie' | 'series' | 'anime' | 'educational';
  ageCategory: 'all' | '3-5' | '6-8' | '9-12';
  duration?: string; // For movies or educational clips
  seasonsCount?: number; // For series/anime
  rating: number;
  releaseYear: number;
  views: number;
  genres: string[]; // e.g. ["comedy", "adventure", "learning"]
  languageOptions: {
    dubbed: string[]; // Languages available as audio
    subtitled: string[]; // Languages available as subtitles
  };
  tags: string[];
}

export interface Season {
  id: string;
  seriesId: string;
  seasonNumber: number;
  title: Record<string, string>;
  episodesCount: number;
}

export interface Episode {
  id: string;
  seasonId: string;
  seriesId: string;
  episodeNumber: number;
  title: Record<string, string>;
  description: Record<string, string>;
  thumbnail: string;
  duration: string;
  videoUrl: string; // fallback kids cartoon links
}

export interface Review {
  id: string;
  contentId: string;
  userName: string;
  avatar: string;
  rating: number;
  comment: string;
  timestamp: string;
}

export interface Comment {
  id: string;
  contentId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
}

export interface DownloadedItem {
  id: string;
  videoId: string;
  episodeId?: string;
  title: string;
  poster: string;
  type: 'movie' | 'series' | 'anime' | 'educational' | string;
  sizeMb: number;
  downloadedAt: string;
}

export interface CustomAvatarConfig {
  bodyType: 'blob' | 'box' | 'bunny' | 'cat' | 'star';
  color: string;
  eyes: 'sparkle' | 'cool' | 'wink' | 'joy' | 'glasses';
  mouth: 'smile' | 'tongue' | 'whiskers' | 'vamp' | 'mustache';
  accessory: 'crown' | 'wizard' | 'party' | 'headphones' | 'space' | 'flower' | 'none';
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  age: number;
  isKidsMode: boolean;
  color: string;
  watchHistory?: string[];
  downloads?: DownloadedItem[];
  customAvatar?: CustomAvatarConfig;
}

export interface SystemLog {
  id: string;
  type: 'auth' | 'video' | 'payment' | 'admin' | 'security';
  severity: 'info' | 'warning' | 'danger';
  message: string;
  timestamp: string;
  ipAddress?: string;
}

export interface Advertisement {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  type: 'banner' | 'sidebar' | 'video';
  durationSeconds?: number;
  isActive: boolean;
}

export type AppLanguage = 'ar' | 'en' | 'fr' | 'de' | 'es' | 'it';

export interface Translatables {
  [key: string]: Record<string, string>;
}
