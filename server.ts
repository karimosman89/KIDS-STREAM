import express from "express";
import path from "path";
import fs from "fs";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Shared Types Inline / Import
import { VideoContent, Episode, Comment, SystemLog, Advertisement, UserProfile } from "./src/types";

const app = express();
const PORT = 3000;

app.use(express.json());

// Path to persist mock DB
const IS_VERCEL = !!process.env.VERCEL;
const BUNDLED_DB_FILE = path.join(process.cwd(), "db_kids_platform.json");
const DB_FILE = IS_VERCEL 
  ? path.join("/tmp", "db_kids_platform.json") 
  : path.join(process.cwd(), "db_kids_platform.json");

// Default initial datasets
const DEFAULT_VIDEOS: VideoContent[] = [];

const DEFAULT_EPISODES: Episode[] = [];

const DEFAULT_COMMENTS: Comment[] = [];

const DEFAULT_ADS: Advertisement[] = [
  {
    id: "ad1",
    title: "مخيم الصيف للأطفال العباقرة",
    imageUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600&auto=format&fit=crop",
    targetUrl: "#camp",
    type: "banner",
    isActive: true
  },
  {
    id: "ad2",
    title: "ألعاب تركيب وبناء ذكية صديقة للبيئة",
    imageUrl: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=300&auto=format&fit=crop",
    targetUrl: "#lego",
    type: "sidebar",
    isActive: true
  }
];

const DEFAULT_PROFILES: UserProfile[] = [
  { 
    id: "p1", 
    name: "مجد (Majd)", 
    avatar: "🦁", 
    age: 5, 
    isKidsMode: true, 
    color: "from-orange-400 to-red-500", 
    watchHistory: [],
    downloads: []
  },
  { 
    id: "p2", 
    name: "رين (Rayan)", 
    avatar: "🦄", 
    age: 10, 
    isKidsMode: true, 
    color: "from-pink-400 to-purple-500", 
    watchHistory: [],
    downloads: []
  },
  { 
    id: "p3", 
    name: "خالد (Emily)", 
    avatar: "🐲", 
    age: 7, 
    isKidsMode: true, 
    color: "from-green-400 to-emerald-600", 
    watchHistory: [],
    downloads: []
  }
];

const DEFAULT_LOGS: SystemLog[] = [
  { id: "l1", type: "security", severity: "info", message: "Parent PIN code challenged successfully for Emily profile", timestamp: "2026-06-17T09:30:15Z", ipAddress: "192.168.1.41" },
  { id: "l2", type: "payment", severity: "info", message: "Stripe recurring Premium Kids Subscription active state verified", timestamp: "2026-06-17T09:15:00Z" },
  { id: "l3", type: "admin", severity: "warning", message: "Admin setting changed: Custom Header Ads banner toggled to true", timestamp: "2026-06-17T08:44:11Z" }
];

// Load Database or initialize
function getDb() {
  if (IS_VERCEL && !fs.existsSync(DB_FILE)) {
    try {
      if (fs.existsSync(BUNDLED_DB_FILE)) {
        fs.copyFileSync(BUNDLED_DB_FILE, DB_FILE);
      }
    } catch (e) {
      console.error("Failed to copy bundled DB to /tmp", e);
    }
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const dbData = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
      // Ensure watchHistory exists for robustness
      let updated = false;
      if (dbData.profiles && Array.isArray(dbData.profiles)) {
        dbData.profiles.forEach((p: any) => {
          if (!p.watchHistory) {
            p.watchHistory = [];
            updated = true;
          }
          if (!p.downloads) {
            p.downloads = [];
            updated = true;
          }
        });
      }
      if (updated) {
        try {
          fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), "utf-8");
        } catch (writeErr) {
          console.error("Failed to write updated db in getDb", writeErr);
        }
      }
      return dbData;
    } catch (e) {
      console.error("Error reading db... recreating default database schema", e);
    }
  }
  const initialDb = {
    videos: DEFAULT_VIDEOS,
    episodes: DEFAULT_EPISODES,
    comments: DEFAULT_COMMENTS,
    ads: DEFAULT_ADS,
    profiles: DEFAULT_PROFILES,
    logs: DEFAULT_LOGS,
    settings: {
      siteName: "Kids Stream",
      allowAdSense: true,
      requireSubscription: false,
      parentPin: "1234",
      activeAdBanners: ["banner", "sidebar"]
    }
  };
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf-8");
  } catch (writeErr) {
    console.error("Failed to write initialDb in getDb", writeErr);
  }
  return initialDb;
}

function saveDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to save DB in saveDb", e);
  }
}

// REST Api endpoints
app.get("/api/videos", (req, res) => {
  const db = getDb();
  res.json({ success: true, videos: db.videos });
});

// TMDB Info Resolver for movies and series
app.get("/api/videos/resolve-tmdb", async (req, res) => {
  const { title, type } = req.query;
  if (!title) {
    return res.status(400).json({ success: false, message: "Title parameter is required" });
  }

  const tmdbKey = process.env.TMDB_API_KEY || "844dba0bfd8f3a28136764721c1957fa";
  try {
    const isTV = type === 'series' || type === 'anime' || type === 'tv';
    const cleanTitle = (typeof title === 'string' ? title : '')
      .replace(/[\(\[\{].*?[\)\]\}]/g, '') // remove brackets or extra tags
      .trim();

    // Search TMDB
    let searchUrl = `https://api.themoviedb.org/3/search/multi?api_key=${tmdbKey}&query=${encodeURIComponent(cleanTitle)}`;
    if (isTV) {
      searchUrl = `https://api.themoviedb.org/3/search/tv?api_key=${tmdbKey}&query=${encodeURIComponent(cleanTitle)}`;
    } else if (type === 'movie') {
      searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(cleanTitle)}`;
    }

    const tmdbRes = await fetch(searchUrl);
    const tmdbData = await tmdbRes.json();

    if (tmdbData.results && tmdbData.results.length > 0) {
      const best = tmdbData.results[0];
      const isTvResult = best.media_type === 'tv' || (isTV && !best.media_type) || best.first_air_date;
      return res.json({
        success: true,
        tmdbId: best.id,
        resolvedType: isTvResult ? 'tv' : 'movie',
        originalTitle: best.name || best.title,
        overview: best.overview
      });
    }

    // Try multi-search secondary fallback
    if (isTV || type === 'movie') {
      const fallbackUrl = `https://api.themoviedb.org/3/search/multi?api_key=${tmdbKey}&query=${encodeURIComponent(cleanTitle)}`;
      const fallbackRes = await fetch(fallbackUrl);
      const fallbackData = await fallbackRes.json();
      if (fallbackData.results && fallbackData.results.length > 0) {
        const best = fallbackData.results[0];
        const isTvResult = best.media_type === 'tv' || best.first_air_date;
        return res.json({
          success: true,
          tmdbId: best.id,
          resolvedType: isTvResult ? 'tv' : 'movie',
          originalTitle: best.name || best.title,
          overview: best.overview
        });
      }
    }

    res.json({ success: false, message: "No match found on TMDB" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// External Video Aggregator
app.get("/api/videos/external", async (req, res) => {
  try {
    const query = typeof req.query.q === 'string' ? req.query.q : '';
    const results: any[] = [];
    
    // 1. TMDB Kids (Movie & TV show catalog with complete streaming links)
    const tmdbKey = process.env.TMDB_API_KEY || "844dba0bfd8f3a28136764721c1957fa";
    if (results.length < 35) {
      try {
        // A. Fetch movies
        let tmdbMovieUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${tmdbKey}&with_genres=16&certification_country=US&certification.lte=PG`;
        if (query) {
           tmdbMovieUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(query)}`;
        }
        
        const tmdbRes = await fetch(tmdbMovieUrl);
        const tmdbData = await tmdbRes.json();
        
        if (tmdbData.results) {
          tmdbData.results.forEach((item: any) => {
            // Check if it's animation if we searched
            if (query && item.genre_ids && !item.genre_ids.includes(16)) return;
            
            results.push({
              id: `tmdb_${item.id}`,
              title: { en: item.title, ar: item.title },
              description: { en: item.overview || '', ar: item.overview || '' },
              poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800&q=80',
              banner: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=1200&q=80',
              videoUrl: `https://vidsrc.me/embed/movie?tmdb=${item.id}`,
              type: 'movie',
              category: 'Kids',
              ageCategory: '6-8',
              source: 'TMDB',
              duration: "1:30:00",
              views: item.popularity ? Math.floor(item.popularity * 1000) : 1000,
              rating: item.vote_average ? parseFloat((item.vote_average / 2).toFixed(1)) : 5.0,
              creator: 'Studio',
              tags: ['movie', 'animation'],
              genres: ['movie', 'animation'],
              releaseYear: item.release_date ? parseInt(item.release_date.substring(0, 4)) : 2025,
              languageOptions: {
                dubbed: ["en", "ar"],
                subtitled: ["en", "ar"]
              }
            });
          });
        }

        // B. Fetch animated TV shows / series
        let tmdbTvUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${tmdbKey}&with_genres=16`;
        if (query) {
           tmdbTvUrl = `https://api.themoviedb.org/3/search/tv?api_key=${tmdbKey}&query=${encodeURIComponent(query)}`;
        }
        
        const tvRes = await fetch(tmdbTvUrl);
        const tvData = await tvRes.json();
        
        if (tvData.results) {
          tvData.results.forEach((item: any) => {
            if (query && item.genre_ids && !item.genre_ids.includes(16)) return;
            
            results.push({
              id: `tmdb_tv_${item.id}`,
              title: { en: item.name, ar: item.name },
              description: { en: item.overview || '', ar: item.overview || '' },
              poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80',
              banner: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80',
              videoUrl: `https://vidsrc.me/embed/tv?tmdb=${item.id}&season=1&episode=1`,
              type: 'series',
              category: 'Kids',
              ageCategory: '6-8',
              source: 'TMDB',
              duration: "24m",
              views: item.popularity ? Math.floor(item.popularity * 1000) : 1000,
              rating: item.vote_average ? parseFloat((item.vote_average / 2).toFixed(1)) : 5.0,
              creator: 'TV Studio',
              tags: ['series', 'cartoon', 'animation'],
              genres: ['cartoon', 'animation'],
              releaseYear: item.first_air_date ? parseInt(item.first_air_date.substring(0, 4)) : 2024,
              languageOptions: {
                dubbed: ["en", "ar"],
                subtitled: ["en", "ar"]
              }
            });
          });
        }
      } catch (e) {
        console.error("TMDB search error", e);
      }
    }

    // 2. Jikan (MyAnimeList) - sfw filtered
    if (results.length < 30) {
      try {
        let jikanUrl = 'https://api.jikan.moe/v4/top/anime?filter=bypopularity&sfw=true&limit=10';
        if (query) {
          jikanUrl = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&sfw=true&limit=10`;
        }
        
        const jikanRes = await fetch(jikanUrl);
        const jikanData = await jikanRes.json();
        
        if (jikanData.data) {
          jikanData.data.forEach((item: any) => {
            if (item.rating && (item.rating.includes('Rx') || item.rating.includes('R+'))) return;
            results.push({
              id: `jikan_${item.mal_id}`,
              title: { en: item.title_english || item.title, ar: item.title },
              description: { en: item.synopsis || "Anime description not available.", ar: item.synopsis || "" },
              poster: item.images?.jpg?.large_image_url || 'https://images.unsplash.com/photo-1541562232579-512a21360020?w=800&q=80',
              banner: item.trailer?.images?.maximum_image_url || item.images?.jpg?.large_image_url || 'https://images.unsplash.com/photo-1541562232579-512a21360020?w=1200&q=80',
              videoUrl: `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent((item.title_english || item.title) + " full anime episode list")}`,
              type: 'anime',
              category: 'Anime',
              ageCategory: item.rating && item.rating.includes('PG') ? '9-12' : '13+',
              source: 'Jikan',
              duration: item.duration || "24m",
              views: item.members || 10000,
              rating: item.score ? parseFloat((item.score / 2).toFixed(1)) : 4.5,
              creator: item.studios?.[0]?.name || 'Anime Studio',
              tags: ['anime', 'japanese'],
              genres: ['anime', 'action'],
              releaseYear: item.year || 2023,
              languageOptions: {
                dubbed: ["ja", "en", "ar"],
                subtitled: ["ja", "en", "ar"]
              }
            });
          });
        }
      } catch(e) {
        console.error("Jikan error", e);
      }
    }
    
    // 3. TVmaze
    if (results.length < 40) {
      try {
        let tvmazeUrl = 'https://api.tvmaze.com/shows?page=0'; // getting some shows
        if (query) {
          tvmazeUrl = `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`;
        }
        
        const tvmRes = await fetch(tvmazeUrl);
        const tvmData = await tvmRes.json();
        
        let processable = query ? tvmData.map((t: any) => t.show) : tvmData;
        
        processable.slice(0, 10).forEach((item: any) => {
          if (!item.genres?.includes('Anime') && !item.genres?.includes('Children')) return;
          results.push({
             id: `tvmaze_${item.id}`,
             title: { en: item.name, ar: item.name },
             description: { en: item.summary ? item.summary.replace(/<[^>]+>/g, '') : '', ar: '' },
             poster: item.image?.original || item.image?.medium || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80',
             banner: item.image?.original || item.image?.medium || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&q=80',
             videoUrl: `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(item.name + " cartoon full episode playlist")}`,
             type: 'series',
             category: 'Kids',
             ageCategory: '6-8',
             source: 'TVmaze',
             duration: "30m",
             views: item.weight ? item.weight * 1000 : 5000,
             rating: item.rating?.average ? parseFloat((item.rating.average / 2).toFixed(1)) : 4.0,
             creator: item.network?.name || 'TV Network',
             tags: ['tv', 'cartoon', 'series'],
             genres: ['cartoon', 'comedy'],
             releaseYear: item.premiered ? parseInt(item.premiered.substring(0, 4)) : 2020,
             languageOptions: {
               dubbed: ["en", "ar"],
               subtitled: ["en", "ar"]
             }
          });
        });
      } catch (e) {
        console.error("TVmaze error", e);
      }
    }
    
    // 4. Internet Archive (cc videos)
    if (results.length < 150) {
      try {
      const iaQuery = query ? `${query} AND format:\"h.264\" AND collection:animationandcartoons` : `collection:animationandcartoons AND format:\"h.264\"`;
      const randomPage = query ? 1 : Math.floor(Math.random() * 5) + 1;
      const iaUrl = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(iaQuery)}&fl[]=identifier&fl[]=title&fl[]=description&fl[]=downloads&fl[]=image&rows=50&page=${randomPage}&output=json`;
        
        const iaRes = await fetch(iaUrl);
        const iaData = await iaRes.json();
        
        if (iaData.response?.docs) {
           for (const item of iaData.response.docs) {
             results.push({
               id: `ia_${item.identifier}`,
               title: { en: item.title, ar: item.title },
               description: { en: item.description || "Archived Cartoon", ar: "كرتون كلاسيكي" },
               poster: `https://archive.org/services/img/${item.identifier}`,
               banner: `https://archive.org/services/img/${item.identifier}`,
               videoUrl: `https://archive.org/download/${item.identifier}/format=h.264`,
               type: 'movie',
               category: 'Classic',
               ageCategory: 'all',
               source: 'Internet Archive',
               duration: "10m",
               views: item.downloads || 1000,
               rating: 4.0,
               creator: 'Public Domain',
               tags: ['classic', 'archive'],
               genres: ['classic', 'animation'],
               releaseYear: 1950,
               languageOptions: {
                 dubbed: ["en"],
                 subtitled: ["en"]
               }
             });
           }
        }
      } catch (e) {
        console.error("IA error", e);
      }
    }

    res.json({ success: true, videos: results });
  } catch (error: any) {
    console.error("External videos error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/videos/add", (req, res) => {
  const db = getDb();
  const newVideo: VideoContent = req.body;
  
  if (!newVideo.id) {
    newVideo.id = "v_" + Date.now();
  }
  if (!newVideo.views) {
    newVideo.views = 0;
  }
  if (!newVideo.rating) {
    newVideo.rating = 5.0;
  }

  db.videos.unshift(newVideo);
  db.logs.unshift({
    id: "log_" + Date.now(),
    type: "admin",
    severity: "info",
    message: `Admin added new content: ${newVideo.title.en || 'Unknown'} (${newVideo.type})`,
    timestamp: new Date().toISOString()
  });

  saveDb(db);
  res.json({ success: true, video: newVideo });
});

app.post("/api/videos/:id/rate", (req, res) => {
  const db = getDb();
  const videoId = req.params.id;
  const { rating } = req.body;

  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: "Invalid rating value. Must be between 1 and 5." });
  }

  const video = db.videos.find((v: any) => v.id === videoId);
  if (!video) {
    return res.status(404).json({ success: false, message: "Video not found." });
  }

  const prevRating = video.rating || 5.0;
  const totalVotes = 50; 
  const newRating = parseFloat(((prevRating * totalVotes + rating) / (totalVotes + 1)).toFixed(1));
  video.rating = newRating;

  db.logs.unshift({
    id: "log_" + Date.now(),
    type: "user",
    severity: "info",
    message: `User rated content: "${video.title.en || 'Unknown'}" (${rating} Stars). New Rating: ${newRating}`,
    timestamp: new Date().toISOString()
  });

  saveDb(db);
  res.json({ success: true, rating: newRating, video });
});

app.get("/api/episodes", async (req, res) => {
  const db = getDb();
  const { seriesId } = req.query;

  if (!seriesId) {
    return res.json({ success: true, episodes: db.episodes });
  }

  // Check if it's a TMDB Series ID. For example: tmdb_tv_1234 or tmdb_1234
  const isTmdbSeries = typeof seriesId === 'string' && (seriesId.startsWith('tmdb_tv_') || seriesId.startsWith('tmdb_'));
  
  if (isTmdbSeries) {
    const rawTvId = seriesId.replace('tmdb_tv_', '').replace('tmdb_', '');
    const tmdbKey = process.env.TMDB_API_KEY || "844dba0bfd8f3a28136764721c1957fa";
    
    try {
      // 1. Fetch TV Seasons info
      const infoUrl = `https://api.themoviedb.org/3/tv/${rawTvId}?api_key=${tmdbKey}&language=en-US`;
      const infoRes = await fetch(infoUrl);
      
      if (infoRes.ok) {
        const infoData = await infoRes.json();
        
        // Filter out specials (season_number = 0) and get latest/first valid season
        const validSeasons = (infoData.seasons || []).filter((s: any) => s.season_number > 0);
        const targetSeason = validSeasons.length > 0 ? validSeasons[0].season_number : 1;
        
        // 2. Fetch all episodes of target season
        const seasonUrl = `https://api.themoviedb.org/3/tv/${rawTvId}/season/${targetSeason}?api_key=${tmdbKey}&language=en-US`;
        const seasonRes = await fetch(seasonUrl);
        const seasonData = await seasonRes.json();
        
        if (seasonData.episodes && seasonData.episodes.length > 0) {
          const dynamicEpisodes = seasonData.episodes.map((ep: any) => ({
            id: `tmdb_tv_${rawTvId}_s${targetSeason}e${ep.episode_number}`,
            seasonId: targetSeason.toString(),
            seriesId: seriesId,
            episodeNumber: ep.episode_number,
            title: {
              en: ep.name || `Episode ${ep.episode_number}`,
              ar: ep.name ? `الحلقة  ${ep.episode_number}: ${ep.name}` : `الحلقة ${ep.episode_number}`,
              fr: ep.name || `Épisode ${ep.episode_number}`,
              de: ep.name || `Episode ${ep.episode_number}`
            },
            description: {
              en: ep.overview || "No English description available.",
              ar: ep.overview || "لا يوجد وصف لهذه الحلقة حالياً.",
              fr: ep.overview || "Pas de description disponible.",
              de: ep.overview || "Keine Beschreibung verfügbar."
            },
            videoUrl: `https://vidsrc.me/embed/tv?tmdb=${rawTvId}&season=${targetSeason}&episode=${ep.episode_number}`,
            duration: ep.runtime ? `${ep.runtime} min` : "24 min",
            poster: ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : (infoData.poster_path ? `https://image.tmdb.org/t/p/w300${infoData.poster_path}` : 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=600&q=80'),
            banner: ep.still_path ? `https://image.tmdb.org/t/p/original${ep.still_path}` : (infoData.backdrop_path ? `https://image.tmdb.org/t/p/original${infoData.backdrop_path}` : 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=1200&q=80'),
          }));
          
          return res.json({ success: true, episodes: dynamicEpisodes });
        }
      }
    } catch (e: any) {
      console.error("Dynamic TMDB episodes fetch error, fallback to mock custom list:", e.message);
    }
  }

  // If we are dealing with Jikan or TVMaze or pre-seeded database with YouTube trailer urls, let's try to resolve to TMDB TV show, and fetch episodes for that!
  const isJikanOrTvmaze = typeof seriesId === 'string' && (seriesId.startsWith('jikan_') || seriesId.startsWith('tvmaze_') || seriesId.startsWith('v'));
  
  if (isJikanOrTvmaze) {
    // Look up title inside current memory or cached db
    const videoObj = db.videos.find((v: any) => v.id === seriesId);
    if (videoObj) {
      const tmdbKey = process.env.TMDB_API_KEY || "844dba0bfd8f3a28136764721c1957fa";
      const cleanTitle = (videoObj.title.en || videoObj.title.ar || '')
        .replace(/[\(\[\{].*?[\)\]\}]/g, '')
        .trim();
        
      try {
        // Search TV series by name
        const searchUrl = `https://api.themoviedb.org/3/search/tv?api_key=${tmdbKey}&query=${encodeURIComponent(cleanTitle)}`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();
        
        if (searchData.results && searchData.results.length > 0) {
          const matchedTvId = searchData.results[0].id;
          
          // Fetch Seasons/Episodes for matched TMDB TV ID
          const seasonUrl = `https://api.themoviedb.org/3/tv/${matchedTvId}/season/1?api_key=${tmdbKey}&language=en-US`;
          const seasonRes = await fetch(seasonUrl);
          const seasonData = await seasonRes.json();
          
          if (seasonData.episodes && seasonData.episodes.length > 0) {
            const dynamicEpisodes = seasonData.episodes.map((ep: any) => ({
              id: `${seriesId}_s1e${ep.episode_number}`,
              seasonId: "1",
              seriesId: seriesId,
              episodeNumber: ep.episode_number,
              title: {
                en: ep.name || `Episode ${ep.episode_number}`,
                ar: ep.name ? `الحلقة ${ep.episode_number}: ${ep.name}` : `الحلقة ${ep.episode_number}`,
                fr: ep.name || `Épisode ${ep.episode_number}`,
                de: ep.name || `Episode ${ep.episode_number}`
              },
              description: {
                en: ep.overview || `Episode ${ep.episode_number} of ${cleanTitle}`,
                ar: ep.overview || `الحلقة ${ep.episode_number} من ${cleanTitle}`,
                fr: ep.overview || `Épisode ${ep.episode_number} de ${cleanTitle}`,
                de: ep.overview || `Episode ${ep.episode_number} von ${cleanTitle}`
              },
              videoUrl: `https://vidsrc.me/embed/tv?tmdb=${matchedTvId}&season=1&episode=${ep.episode_number}`,
              duration: ep.runtime ? `${ep.runtime} min` : "24 min",
              poster: ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : videoObj.poster,
              banner: ep.still_path ? `https://image.tmdb.org/t/p/original${ep.still_path}` : videoObj.banner,
            }));
            
            return res.json({ success: true, episodes: dynamicEpisodes });
          }
        }
      } catch (e: any) {
        console.error("Resolver search fail for Jikan/TVMaze/v episodes:", e.message);
      }
    }
  }

  // Fallback to local database episodes
  const filtered = db.episodes.filter((ep: any) => ep.seriesId === seriesId);
  
  // If still empty and it's a TV series/movie/educational, auto-populate 12 complete simulation episodes so the user at least has interactive selections!
  if (filtered.length === 0) {
    const videoObj = db.videos.find((v: any) => v.id === seriesId);
    if (videoObj && (videoObj.type === 'series' || videoObj.type === 'anime' || videoObj.type === 'educational' || videoObj.type === 'movie')) {
      const simulatedEpisodes = Array.from({ length: 12 }, (_, i) => {
        const streams = [
          "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          "https://archive.org/download/mr-bean-the-animated-series-artful-bean/format=h.264",
          "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
          "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
          "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
        ];
        const hasValidDirectUrl = videoObj.videoUrl && !videoObj.videoUrl.includes('youtube.com') && !videoObj.videoUrl.includes('youtu.be') && !videoObj.videoUrl.includes('trailer');
        const episodeUrl = hasValidDirectUrl ? videoObj.videoUrl : streams[i % streams.length];
        
        return {
          id: `sim_${seriesId}_s1e${i+1}`,
          seasonId: "1",
          seriesId: seriesId,
          episodeNumber: i + 1,
          title: {
            en: `Episode ${i + 1}: The Great Quest Begins`,
            ar: `الحلقة ${i + 1}: بداية المغامرة الكبرى`,
            fr: `Épisode ${i + 1}: La grande aventure commence`,
            de: `Episode ${i + 1}: Das große Abenteuer beginnt`
          },
          description: {
            en: `Follow our heroes in Episode ${i + 1} as they tackle funny surprises and solve amazing forest puzzles with friends inside of this season's complete package.`,
            ar: `تابع أبطالنا في الحلقة ${i + 1} وهم يواجهون مفاجآت مضحكة ويحلون ألغازًا مذهلة في الغابة مع الأصدقاء.`,
            fr: `Suivez nos héros dans l'épisode ${i + 1} alors qu'ils font face à des aventures drôles et éducatives.`,
            de: `Erleben Sie mit unseren Helden in Episode ${i + 1} lustige Momente und unvergessliche Abenteuer.`
          },
          videoUrl: episodeUrl,
          duration: "24 min",
          poster: videoObj.poster,
          banner: videoObj.banner
        };
      });
      return res.json({ success: true, episodes: simulatedEpisodes });
    }
  }

  res.json({ success: true, episodes: filtered });
});

app.post("/api/episodes/add", (req, res) => {
  const db = getDb();
  const newEp: Episode = req.body;
  if (!newEp.id) {
    newEp.id = "ep_" + Date.now();
  }
  db.episodes.push(newEp);
  db.logs.unshift({
    id: "log_" + Date.now(),
    type: "admin",
    severity: "info",
    message: `Admin added episode ${newEp.episodeNumber} to series ${newEp.seriesId}`,
    timestamp: new Date().toISOString()
  });
  saveDb(db);
  res.json({ success: true, episode: newEp });
});

app.get("/api/comments", (req, res) => {
  const db = getDb();
  const { contentId } = req.query;
  const filtered = contentId 
    ? db.comments.filter((c: any) => c.contentId === contentId)
    : db.comments;
  res.json({ success: true, comments: filtered });
});

app.post("/api/comments/add", (req, res) => {
  const db = getDb();
  const newComment: Comment = {
    id: "c_" + Date.now(),
    contentId: req.body.contentId,
    userName: req.body.userName || "Happy Kid",
    userAvatar: req.body.userAvatar || "🦁",
    text: req.body.text,
    timestamp: new Date().toISOString()
  };
  db.comments.unshift(newComment);
  saveDb(db);
  res.json({ success: true, comment: newComment });
});

app.get("/api/profiles", (req, res) => {
  const db = getDb();
  res.json({ success: true, profiles: db.profiles });
});

app.post("/api/profiles/add", (req, res) => {
  const db = getDb();
  const newProf: UserProfile = req.body;
  if (!newProf.id) {
    newProf.id = "p_" + Date.now();
  }
  if (!newProf.watchHistory) {
    newProf.watchHistory = [];
  }
  db.profiles.push(newProf);
  saveDb(db);
  res.json({ success: true, profile: newProf });
});

app.post("/api/profiles/:id/update-avatar", (req, res) => {
  const db = getDb();
  const idToUpdate = req.params.id;
  const { customAvatar, avatar } = req.body;

  const profile = db.profiles.find((p: any) => p.id === idToUpdate);
  if (!profile) {
    return res.status(404).json({ success: false, message: "Profile not found." });
  }

  if (customAvatar) {
    profile.customAvatar = customAvatar;
    profile.avatar = "🎨";
  } else if (avatar) {
    profile.avatar = avatar;
    delete profile.customAvatar;
  }

  db.logs.unshift({
    id: "log_" + Date.now(),
    type: "admin",
    severity: "info",
    message: `Profile avatar updated for user: "${profile.name}"`,
    timestamp: new Date().toISOString()
  });

  saveDb(db);
  res.json({ success: true, profile });
});

app.post("/api/profiles/view", (req, res) => {
  const db = getDb();
  const { profileId, videoId } = req.body;
  const profile = db.profiles.find((p: any) => p.id === profileId);
  if (profile) {
    if (!profile.watchHistory) {
      profile.watchHistory = [];
    }
    // Remove if already in history and push to front to represent latest watch action
    profile.watchHistory = profile.watchHistory.filter((id: string) => id !== videoId);
    profile.watchHistory.unshift(videoId);
    // Limit to latest 10
    if (profile.watchHistory.length > 10) {
      profile.watchHistory = profile.watchHistory.slice(0, 10);
    }
    
    // Log video viewing
    db.logs.unshift({
      id: "log_" + Date.now(),
      type: "video",
      severity: "info",
      message: `${profile.name} opened and started viewing video content ID: ${videoId}`,
      timestamp: new Date().toISOString()
    });

    saveDb(db);
    res.json({ success: true, profile });
  } else {
    res.status(404).json({ success: false, message: "Profile not found" });
  }
});

app.post("/api/profiles/download", (req, res) => {
  const db = getDb();
  const { profileId, videoId, episodeId, title, poster, type, sizeMb } = req.body;
  const profile = db.profiles.find((p: any) => p.id === profileId);
  if (profile) {
    if (!profile.downloads) {
      profile.downloads = [];
    }
    const alreadyDownloaded = profile.downloads.find((d: any) => 
      d.videoId === videoId && (episodeId ? d.episodeId === episodeId : !d.episodeId)
    );
    
    if (!alreadyDownloaded) {
      const newDl = {
        id: "dl_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        videoId,
        episodeId,
        title,
        poster,
        type: type || "movies",
        sizeMb: sizeMb || 45,
        downloadedAt: new Date().toISOString()
      };
      profile.downloads.unshift(newDl);

      db.logs.unshift({
        id: "log_" + Date.now(),
        type: "video",
        severity: "info",
        message: `${profile.name} saved offline content: "${title}" (${sizeMb || 45}MB)`,
        timestamp: new Date().toISOString()
      });

      saveDb(db);
    }
    res.json({ success: true, profile });
  } else {
    res.status(404).json({ success: false, message: "Profile not found" });
  }
});

app.post("/api/profiles/download/remove", (req, res) => {
  const db = getDb();
  const { profileId, downloadId, removeAll } = req.body;
  const profile = db.profiles.find((p: any) => p.id === profileId);
  if (profile) {
    if (!profile.downloads) {
      profile.downloads = [];
    }
    
    if (removeAll) {
      profile.downloads = [];
      db.logs.unshift({
        id: "log_" + Date.now(),
        type: "video",
        severity: "info",
        message: `${profile.name} cleared all offline downloads.`,
        timestamp: new Date().toISOString()
      });
    } else {
      const itemToRemove = profile.downloads.find((d: any) => d.id === downloadId);
      if (itemToRemove) {
        db.logs.unshift({
          id: "log_" + Date.now(),
          type: "video",
          severity: "info",
          message: `${profile.name} deleted offline download "${itemToRemove.title}".`,
          timestamp: new Date().toISOString()
        });
      }
      profile.downloads = profile.downloads.filter((d: any) => d.id !== downloadId);
    }

    saveDb(db);
    res.json({ success: true, profile });
  } else {
    res.status(404).json({ success: false, message: "Profile not found" });
  }
});

app.delete("/api/profiles/:id", (req, res) => {
  const db = getDb();
  const idToDelete = req.params.id;
  db.profiles = db.profiles.filter((p: any) => p.id !== idToDelete);
  saveDb(db);
  res.json({ success: true });
});

app.get("/api/ads", (req, res) => {
  const db = getDb();
  res.json({ success: true, ads: db.ads });
});

app.post("/api/ads/toggle", (req, res) => {
  const db = getDb();
  const { id } = req.body;
  const ad = db.ads.find((a: any) => a.id === id);
  if (ad) {
    ad.isActive = !ad.isActive;
    saveDb(db);
  }
  res.json({ success: true, ads: db.ads });
});

app.get("/api/logs", (req, res) => {
  const db = getDb();
  res.json({ success: true, logs: db.logs });
});

app.post("/api/logs/add", (req, res) => {
  const db = getDb();
  const { type, severity, message } = req.body;
  if (db.logs && Array.isArray(db.logs)) {
    db.logs.unshift({
      id: "log_" + Date.now(),
      type: type || "video",
      severity: severity || "info",
      message: message || "System action logged",
      timestamp: new Date().toISOString()
    });
    // Keep logs of reasonable size
    if (db.logs.length > 500) {
      db.logs = db.logs.slice(0, 500);
    }
  }
  saveDb(db);
  res.json({ success: true, logs: db.logs });
});

app.get("/api/settings", (req, res) => {
  const db = getDb();
  res.json({ success: true, settings: db.settings });
});

app.post("/api/settings/update", (req, res) => {
  const db = getDb();
  db.settings = { ...db.settings, ...req.body };
  db.logs.unshift({
    id: "log_" + Date.now(),
    type: "admin",
    severity: "info",
    message: "Admin settings updated",
    timestamp: new Date().toISOString()
  });
  saveDb(db);
  res.json({ success: true, settings: db.settings });
});

// AI Search & Smart Recommendations Endpoint calling Gemini
// Let's do lazy initialization and fallback correctly
app.post("/api/ai-search", async (req, res) => {
  const db = getDb();
  const { prompt, ageCategory, language = "en" } = req.body;

  if (!prompt) {
    return res.status(400).json({ success: false, error: "Prompt is required" });
  }

  // Quick fallback check for local recommendation if key is missing or invalid
  const hasApiKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY" && process.env.GEMINI_API_KEY.trim().length > 0;

  let serializedVideoMeta = db.videos.map((v: any) => ({
    id: v.id,
    type: v.type,
    views: v.views,
    rating: v.rating,
    ageCategory: v.ageCategory,
    genres: v.genres,
    tags: v.tags,
    titleEn: v.title.en,
    titleAr: v.title.ar,
    descriptionEn: v.description.en,
    descriptionAr: v.description.ar
  }));

  if (!hasApiKey) {
    // Elegant local fallback rule matching
    console.log("Gemini API key is not configured. Running stateful local fuzzy recommendation algorithm...");
    const promptLower = prompt.toLowerCase();
    
    // Sort videos based on fuzzy matches of keywords
    const evaluated = db.videos.map((v: any) => {
      let score = 0;
      const combinedMeta = `${JSON.stringify(v.title).toLowerCase()} ${JSON.stringify(v.description).toLowerCase()} ${v.genres.join(" ")} ${v.tags.join(" ")}`;
      
      // search scoring
      if (promptLower.includes("space") || promptLower.includes("fadaa") || promptLower.includes("فضاء") || promptLower.includes("أرنب")) {
        if (v.id === "v1") score += 5;
      }
      if (promptLower.includes("math") || promptLower.includes("عدد") || promptLower.includes("حساب") || promptLower.includes("بومة") || promptLower.includes("تعلم") || promptLower.includes("learn")) {
        if (v.id === "v2") score += 5;
      }
      if (promptLower.includes("dino") || promptLower.includes("ديناصور") || promptLower.includes("رياضة") || promptLower.includes("sport")) {
        if (v.id === "v3") score += 5;
      }
      if (promptLower.includes("color") || promptLower.includes("ألوان") || promptLower.includes("رسم") || promptLower.includes("art")) {
        if (v.id === "v4") score += 5;
      }
      if (promptLower.includes("ninja") || promptLower.includes("نينجا") || promptLower.includes("panda") || promptLower.includes("باندا")) {
        if (v.id === "v5") score += 5;
      }
      if (promptLower.includes("عبقور") || promptLower.includes("doraemon") || promptLower.includes("gadget") || promptLower.includes("جيب")) {
        if (v.id === "v6") score += 5;
      }
      if (v.ageCategory === ageCategory) {
        score += 2;
      }
      return { id: v.id, score };
    }).sort((a: any, b: any) => b.score - a.score);

    const recomIds = evaluated.filter((ev: any) => ev.score > 0).map((ev: any) => ev.id);
    const finalIds = recomIds.length > 0 ? recomIds : db.videos.slice(0, 3).map((v: any) => v.id);

    // Friendly fallback explanation
    const explanatoryText = language === "ar"
      ? `أهلاً بك! الذكاء الاصطناعي يقترح عليك مشاهدة "${db.videos.find((v:any)=>v.id === finalIds[0])?.title.ar}" ومحتويات مشابهة بناءً على اهتمامك بـ "${prompt}". استمتع بالمشاهدة الآمنة صغارنا!`
      : `Hello! Our recommendation engine suggests starting with "${db.videos.find((v:any)=>v.id === finalIds[0])?.title.en}" because it matches your interest in "${prompt}". Have fun watching securely!`;

    return res.json({
      success: true,
      recommendedIds: finalIds,
      explanation: explanatoryText,
      mode: "local_intelligent"
    });
  }

  // Real Gemini generation
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const aiPrompt = `You are a friendly, kids-loving AI assistant called "Beep-Boop" guiding children on a safe streaming platform.
Available catalog: ${JSON.stringify(serializedVideoMeta)}

User kids request: "${prompt}"
Kids profile age group limit: "${ageCategory || 'Any'}"
Language to respond in: "${language}"

Examine the catalog. Select up to 3 content IDs that are best matching the child's interest and age. Avoid recommending age-inappropriate content if any filter exists.
Return a valid JSON object ONLY, adhering to this format:
{
  "recommendedIds": ["v1", "v4"],
  "explanation": "Write a lovely, friendly explanation directly to the kid (e.g., 'Oh! Bobo the bunny is flying in rocket ships today!') in the requested language."
}
No extra markdown code blocks outside JSON. Keep it concise, friendly, and magical.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: aiPrompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    try {
      const parsed = JSON.parse(text.trim());
      return res.json({
        success: true,
        recommendedIds: parsed.recommendedIds || [],
        explanation: parsed.explanation || "Enjoy these wonderful picks!",
        mode: "gemini_ai"
      });
    } catch (parseError) {
      console.error("JSON parsing from Gemini failed", text, parseError);
      throw parseError;
    }

  } catch (error: any) {
    console.error("Gemini AI API search error:", error);
    res.json({
      success: true,
      recommendedIds: db.videos.slice(0, 2).map((v:any) => v.id),
      explanation: language === "ar"
        ? "تألق يا بطل! إليك هذه الأفلام المناسبة جداً لمشاهدتها الآن!"
        : "Here's some cool content lined up for your adventurous day!",
      mode: "api_fallback"
    });
  }
});

// AI-powered video detail related recommendation helper
app.post("/api/videos/recommend-more", async (req, res) => {
  const db = getDb();
  const { videoId, excludeIds = [], language = "en" } = req.body;

  if (!videoId) {
    return res.status(400).json({ success: false, error: "videoId is required" });
  }

  const activeVideo = db.videos.find((v: any) => v.id === videoId);
  if (!activeVideo) {
    return res.status(404).json({ success: false, error: "Video not found" });
  }

  const hasApiKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY" && process.env.GEMINI_API_KEY.trim().length > 0;

  // Compile candidates that are not the current active video
  const candidates = db.videos.filter((v: any) => v.id !== videoId);

  if (!hasApiKey) {
    console.log("No Gemini API key for recommend-more. Running stateful local fuzzy recommendation algorithm...");
    // Local fallback: prioritize videos with matching genres/tags/category, but filter out excludeIds where possible
    const scored = candidates.map((v: any) => {
      let score = 0;
      // Share genre
      const sharedGenres = (v.genres || []).filter((g: string) => (activeVideo.genres || []).includes(g));
      score += sharedGenres.length * 3;

      // Share tags
      const sharedTags = (v.tags || []).filter((t: string) => (activeVideo.tags || []).includes(t));
      score += sharedTags.length * 1.5;

      // Same category
      if (v.category === activeVideo.category) {
        score += 2;
      }
      
      // If listed in excludeIds, penalize heavily so we get fresh results
      if (excludeIds.includes(v.id)) {
        score -= 20;
      }

      // Add a tiny random factor so multiple refreshes return slightly different mixes
      score += Math.random() * 2;

      return { video: v, score };
    }).sort((a: any, b: any) => b.score - a.score);

    const recommended = scored.slice(0, 4).map((item: any) => item.video);

    return res.json({
      success: true,
      recommendations: recommended,
      mode: "local_intelligent"
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    // Provide catalog and active video metadata
    const serializedVideoMeta = candidates.map((v: any) => ({
      id: v.id,
      type: v.type,
      ageCategory: v.ageCategory,
      genres: v.genres,
      tags: v.tags,
      titleEn: v.title.en,
      titleAr: v.title.ar,
      descriptionEn: v.description.en,
      descriptionAr: v.description.ar
    }));

    const aiPrompt = `You are a kids-streaming platform recommendation engine.
We want to generate 4 customized "More Like This" recommendations for a child who is currently watching:
Title: "${activeVideo.title.en}" (Arabic: "${activeVideo.title.ar}")
Description: "${activeVideo.description.en}"
Genres: ${JSON.stringify(activeVideo.genres)}
Tags: ${JSON.stringify(activeVideo.tags)}

Available Candidates catalog: ${JSON.stringify(serializedVideoMeta)}

The user has explicitly asked to refresh or avoid these specific video IDs because they are NOT interested in them: ${JSON.stringify(excludeIds)}. Avoid recommending these IDs if possible.

Select exactly 4 unique content IDs from the candidates catalog that would be highly appealing, fun, safe, and closely related or a creative next step.
Return a valid JSON object ONLY, adhering to this format:
{
  "recommendedIds": ["v1", "v2", "v3", "v4"]
}
No extra markdown code blocks outside JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: aiPrompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text.trim());
    const recommendedIds = parsed.recommendedIds || [];

    // Map back to video objects
    let recommendations = recommendedIds
      .map((id: string) => db.videos.find((v: any) => v.id === id))
      .filter(Boolean);

    // If less than 4, fill with best local fallbacks
    if (recommendations.length < 4) {
      const remaining = candidates.filter((c: any) => !recommendations.some((r: any) => r.id === c.id) && !excludeIds.includes(c.id));
      recommendations = [...recommendations, ...remaining.slice(0, 4 - recommendations.length)];
    }

    // Keep precisely up to 4
    recommendations = recommendations.slice(0, 4);

    return res.json({
      success: true,
      recommendations,
      mode: "gemini_ai"
    });

  } catch (error: any) {
    console.error("Gemini AI API recommend-more error:", error);
    // Secure fallback: get 4 candidates from same genres or category
    const fallback = candidates
      .filter((v: any) => !excludeIds.includes(v.id))
      .slice(0, 4);
    res.json({
      success: true,
      recommendations: fallback,
      mode: "api_fallback"
    });
  }
});

// Active Watch Party Rooms
interface WatchPartyUser {
  userId: string;
  name: string;
  avatar: string;
  color: string;
}

interface WatchPartyMessage {
  id: string;
  senderName: string;
  senderAvatar: string;
  senderColor: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

interface WatchPartyRoom {
  roomId: string;
  hostId: string;
  currentVideoId?: string;
  currentEpisodeId?: string;
  isPlaying: boolean;
  currentTime: number;
  users: WatchPartyUser[];
  messages: WatchPartyMessage[];
}

const watchPartyRooms = new Map<string, WatchPartyRoom>();
const wsClients = new Map<any, { roomId: string; userId: string }>();

function initWebSocketServer(httpServer: any) {
  const wss = new WebSocketServer({ server: httpServer });

  wss.on("connection", (ws: any) => {
    console.log("New WebSocket client connected");

    ws.on("message", (messageStr: string) => {
      try {
        const data = JSON.parse(messageStr);

        switch (data.type) {
          case "join": {
            const { roomId, userId, userName, userAvatar, userColor, currentVideoId, currentEpisodeId } = data;
            if (!roomId || !userId) return;

            wsClients.set(ws, { roomId, userId });

            let room = watchPartyRooms.get(roomId);
            if (!room) {
              room = {
                roomId,
                hostId: userId,
                currentVideoId: currentVideoId || undefined,
                currentEpisodeId: currentEpisodeId || undefined,
                isPlaying: false,
                currentTime: 0,
                users: [],
                messages: []
              };
              watchPartyRooms.set(roomId, room);
            }

            const existingUserIndex = room.users.findIndex(u => u.userId === userId);
            const userObj: WatchPartyUser = {
              userId,
              name: userName || "Friend",
              avatar: userAvatar || "🐱",
              color: userColor || "from-amber-400 to-orange-500"
            };

            if (existingUserIndex === -1) {
              room.users.push(userObj);
              const sysMsg: WatchPartyMessage = {
                id: "msg_sys_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
                senderName: "Kids Stream",
                senderAvatar: "🤖",
                senderColor: "from-cyan-400 to-[#00F2FF]",
                text: `${userName || 'A friend'} joined the watch party! Let's watch together! 🍿`,
                timestamp: new Date().toISOString(),
                isSystem: true
              };
              room.messages.push(sysMsg);
              if (room.messages.length > 100) room.messages.splice(0, room.messages.length - 100);
            } else {
              room.users[existingUserIndex] = userObj;
            }

            if (currentVideoId && !room.currentVideoId) {
              room.currentVideoId = currentVideoId;
              room.currentEpisodeId = currentEpisodeId || undefined;
            }

            broadcastToRoom(roomId, {
              type: "room_state",
              room
            });
            break;
          }

          case "play": {
            const meta = wsClients.get(ws);
            if (!meta) return;
            const room = watchPartyRooms.get(meta.roomId);
            if (room) {
              room.isPlaying = true;
              room.currentTime = data.currentTime || 0;
              broadcastToRoom(meta.roomId, {
                type: "playback_change",
                action: "play",
                currentTime: room.currentTime,
                senderId: meta.userId
              });
            }
            break;
          }

          case "pause": {
            const meta = wsClients.get(ws);
            if (!meta) return;
            const room = watchPartyRooms.get(meta.roomId);
            if (room) {
              room.isPlaying = false;
              room.currentTime = data.currentTime || 0;
              broadcastToRoom(meta.roomId, {
                type: "playback_change",
                action: "pause",
                currentTime: room.currentTime,
                senderId: meta.userId
              });
            }
            break;
          }

          case "seek": {
            const meta = wsClients.get(ws);
            if (!meta) return;
            const room = watchPartyRooms.get(meta.roomId);
            if (room) {
              room.currentTime = data.currentTime || 0;
              broadcastToRoom(meta.roomId, {
                type: "playback_change",
                action: "seek",
                currentTime: room.currentTime,
                senderId: meta.userId
              });
            }
            break;
          }

          case "change_video": {
            const meta = wsClients.get(ws);
            if (!meta) return;
            const room = watchPartyRooms.get(meta.roomId);
            if (room) {
              room.currentVideoId = data.videoId;
              room.currentEpisodeId = data.episodeId;
              room.currentTime = 0;
              room.isPlaying = false;
              broadcastToRoom(meta.roomId, {
                type: "content_change",
                videoId: data.videoId,
                episodeId: data.episodeId,
                senderId: meta.userId
              });

              const sysMsg: WatchPartyMessage = {
                id: "msg_sys_" + Date.now(),
                senderName: "Kids Stream",
                senderAvatar: "🤖",
                senderColor: "from-cyan-400 to-[#00F2FF]",
                text: `Awesome choice! We are now watching something new together! 🎬`,
                timestamp: new Date().toISOString(),
                isSystem: true
              };
              room.messages.push(sysMsg);
              broadcastToRoom(meta.roomId, {
                type: "room_state",
                room
              });
            }
            break;
          }

          case "chat_message": {
            const meta = wsClients.get(ws);
            if (!meta) return;
            const room = watchPartyRooms.get(meta.roomId);
            if (room) {
              const user = room.users.find(u => u.userId === meta.userId);
              const newMsg: WatchPartyMessage = {
                id: "msg_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
                senderName: user ? user.name : "Friend",
                senderAvatar: user ? user.avatar : "🐱",
                senderColor: user ? user.color : "from-amber-400 to-orange-500",
                text: data.text,
                timestamp: new Date().toISOString()
              };
              room.messages.push(newMsg);
              if (room.messages.length > 100) room.messages.splice(0, room.messages.length - 100);

              broadcastToRoom(meta.roomId, {
                type: "new_chat",
                message: newMsg
              });
            }
            break;
          }
        }
      } catch (err) {
        console.error("Error processing WebSocket message", err);
      }
    });

    ws.on("close", () => {
      const meta = wsClients.get(ws);
      if (meta) {
        const { roomId, userId } = meta;
        wsClients.delete(ws);

        const room = watchPartyRooms.get(roomId);
        if (room) {
          const departingUser = room.users.find(u => u.userId === userId);
          room.users = room.users.filter(u => u.userId !== userId);

          if (room.users.length === 0) {
            watchPartyRooms.delete(roomId);
          } else {
            if (room.hostId === userId) {
              room.hostId = room.users[0].userId;
            }

            const sysMsg: WatchPartyMessage = {
              id: "msg_sys_" + Date.now(),
              senderName: "Kids Stream",
              senderAvatar: "🤖",
              senderColor: "from-cyan-400 to-[#00F2FF]",
              text: `${departingUser ? departingUser.name : 'A friend'} left the watch party. Sayonara! 👋`,
              timestamp: new Date().toISOString(),
              isSystem: true
            };
            room.messages.push(sysMsg);

            broadcastToRoom(roomId, {
              type: "room_state",
              room
            });
          }
        }
      }
    });
  });

  function broadcastToRoom(roomId: string, payload: any) {
    const serialized = JSON.stringify(payload);
    for (const [clientWs, meta] of wsClients.entries()) {
      if (meta.roomId === roomId && clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(serialized);
      }
    }
  }
}

// Vite Middleware integrate
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const httpServer = http.createServer(app);
  initWebSocketServer(httpServer);

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Kids Stream full-stack platform running on port ${PORT}`);
    
    // Auto-match and expand Archive in the background
    autoExpandArchive();
  });
}

async function autoExpandArchive() {
  const db = getDb();
  if ((db.settings as any).archiveExpanded) {
    return;
  }
  
  console.log("Starting background task: Auto-Match & Big Archive Expansion...");
  let updated = false;

  // 1. Auto-match generic placeholder URLs to real Internet Archive files
  for (const ep of db.episodes) {
    if (ep.videoUrl && ep.videoUrl.includes("commondatastorage.googleapis.com")) {
      const q = `${ep.title.en} AND collection:animationandcartoons AND format:"h.264"`;
      try {
        const iaUrl = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(q)}&fl[]=identifier&rows=1&output=json`;
        const res = await fetch(iaUrl);
        const data = await res.json();
        if (data.response?.docs?.length > 0) {
          ep.videoUrl = `https://archive.org/download/${data.response.docs[0].identifier}/format=h.264`;
          updated = true;
        } else {
          // If no match, pull a random classic cartoon
          const genQ = `collection:animationandcartoons AND format:"h.264"`;
          const iaUrlGen = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(genQ)}&fl[]=identifier&rows=1&page=${Math.floor(Math.random()*50)+1}&output=json`;
          const resGen = await fetch(iaUrlGen);
          const dataGen = await resGen.json();
          if (dataGen.response?.docs?.length > 0) {
             ep.videoUrl = `https://archive.org/download/${dataGen.response.docs[0].identifier}/format=h.264`;
             updated = true;
          }
        }
      } catch (e) { }
    }
  }

  // 2. Big Expansion (insert 100 new items into DB)
  try {
     const extQ = `collection:animationandcartoons AND format:"h.264" AND mediatype:movies`;
     const extUrl = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(extQ)}&fl[]=identifier&fl[]=title&fl[]=description&fl[]=downloads&fl[]=image&rows=100&page=${Math.floor(Math.random()*20)+1}&output=json`;
     const extRes = await fetch(extUrl);
     const extData = await extRes.json();
     if (extData.response?.docs) {
       for (const doc of extData.response.docs) {
         if (!db.videos.find((v: any) => v.id === `ia_${doc.identifier}`)) {
            db.videos.push({
               id: `ia_${doc.identifier}`,
               title: { en: doc.title, ar: doc.title },
               description: { en: doc.description || "Public domain archive cartoon.", ar: "رسوم متحركة من الأرشيف العام." },
               poster: `https://archive.org/services/img/${doc.identifier}`,
               banner: `https://archive.org/services/img/${doc.identifier}`,
               videoUrl: `https://archive.org/download/${doc.identifier}/format=h.264`,
               type: 'movie',
               category: 'Classic',
               ageCategory: 'all',
               source: 'Internet Archive',
               duration: "15 min",
               views: doc.downloads || Math.floor(Math.random() * 5000),
               rating: 4.5,
               creator: 'Public Domain',
               genres: ['classic', 'animation', 'cartoon'],
               tags: ['archive', 'classic', 'cartoon'],
               releaseYear: 1950,
               languageOptions: {
                 dubbed: ["en"],
                 subtitled: ["en"]
               }
            });
            updated = true;
         }
       }
     }
  } catch (e) {}

  if (updated) {
    (db.settings as any).archiveExpanded = true;
    saveDb(db);
    console.log("Archive expansion and auto-matching complete!");
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
