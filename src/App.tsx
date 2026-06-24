import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  Pause,
  Volume2,
  RotateCcw,
  Monitor,
  Download,
  Maximize,
  Minimize,
  Search,
  Mic,
  Globe,
  Users,
  Shield,
  Plus,
  Heart,
  Watch,
  Star,
  Check,
  Tv,
  Radio,
  ListMusic,
  Layers,
  ChevronRight,
  Settings,
  Info,
  Dumbbell,
  Sparkles,
  Sliders,
  LogOut,
  CheckCircle,
  Database,
  AlertCircle,
  Trash2,
  HelpCircle,
  ChevronLeft,
  ArrowRight,
  Eye,
  Film,
  BookOpen,
  MessageSquare,
  FastForward,
  Send,
  Link,
  Crown,
  X,
  ChevronDown,
  ChevronUp,
  List,
  Bookmark,
  Tag,
  Activity,
  Terminal,
  Keyboard,
  VolumeX,
  Lock,
  Unlock,
  AudioLines,
  Sun,
  Contrast,
  ExternalLink,
  Moon,
  PictureInPicture2,
  PlayCircle,
  RefreshCw,
} from "lucide-react";
import { TRANSLATIONS, SupportedLanguage } from "./locale";
import {
  VideoContent,
  Episode,
  Comment,
  SystemLog,
  Advertisement,
  UserProfile,
  CustomAvatarConfig,
} from "./types";
import { CustomAvatarRenderer } from "./components/CustomAvatarRenderer";

export default function App() {
  // State management
  const [lang, setLang] = useState<SupportedLanguage>("en");
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(
    null,
  );
  const [profiles, setProfiles] = useState<UserProfile[]>([]);

  // Real-Time Watch Party States & Refs
  const [watchPartyId, setWatchPartyId] = useState<string | null>(null);
  const [watchPartyRoom, setWatchPartyRoom] = useState<any | null>(null);
  const [chatInputText, setChatInputText] = useState<string>("");
  const [watchPartyToast, setWatchPartyToast] = useState<string | null>(null);
  const [joinCodeInput, setJoinCodeInput] = useState<string>("");
  const [showJoinPartyInput, setShowJoinPartyInput] = useState<boolean>(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<"chat" | "reviews">(
    "chat",
  );

  const wsRef = useRef<WebSocket | null>(null);
  const ignoreNextEpisodeChangeRef = useRef<boolean>(false);

  // Navigation
  const [activeTab, setActiveTab] = useState<
    | "home"
    | "movies"
    | "series"
    | "anime"
    | "educational"
    | "favorites"
    | "subscriptions"
    | "parent-portal"
    | "downloads"
    | "open-resources"
  >("home");
  const [ageFilter, setAgeFilter] = useState<string>("all");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");

  // Custom states for Universal Open Resource Importer & Streamer
  const [openResSearchQuery, setOpenResSearchQuery] = useState<string>("");
  const [openResSearchResults, setOpenResSearchResults] = useState<any[]>([]);
  const [openResSearchLoading, setOpenResSearchLoading] =
    useState<boolean>(false);
  const [openResActiveSubTab, setOpenResActiveSubTab] = useState<
    "imdb" | "link" | "explorer"
  >("imdb");

  // IMDb & TMDB import form states
  const [openResImdbId, setOpenResImdbId] = useState<string>("");
  const [openResTmdbId, setOpenResTmdbId] = useState<string>("");
  const [openResImdbTitleEn, setOpenResImdbTitleEn] = useState<string>("");
  const [openResImdbTitleAr, setOpenResImdbTitleAr] = useState<string>("");
  const [openResImdbType, setOpenResImdbType] = useState<"movie" | "series">(
    "movie",
  );
  const [openResSeason, setOpenResSeason] = useState<number>(1);
  const [openResEpisode, setOpenResEpisode] = useState<number>(1);

  // Custom link stream states
  const [openResLinkUrl, setOpenResLinkUrl] = useState<string>("");
  const [openResLinkTitleEn, setOpenResLinkTitleEn] = useState<string>("");
  const [openResLinkTitleAr, setOpenResLinkTitleAr] = useState<string>("");
  const [openResLinkDesc, setOpenResLinkDesc] = useState<string>("");
  const [openResLinkType, setOpenResLinkType] = useState<
    "movie" | "series" | "anime" | "educational"
  >("movie");

  const [openResImportStatus, setOpenResImportStatus] = useState<string | null>(
    null,
  );

  // Videos & Search
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [activeVideo, setActiveVideo] = useState<VideoContent | null>(null);
  const [customRelatedVideos, setCustomRelatedVideos] = useState<VideoContent[]>([]);
  const [isRefreshingRelated, setIsRefreshingRelated] = useState<boolean>(false);
  const [episodeFilter, setEpisodeFilter] = useState<
    "all" | "unwatched" | "favorites" | "queue"
  >("all");
  const [isEpisodesCollapsed, setIsEpisodesCollapsed] =
    useState<boolean>(false);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [playbackQueue, setPlaybackQueue] = useState<Episode[]>([]);

  // Computed property to identify the next episode for autoplay
  const currentEpisodeIndex = episodes.findIndex(
    (ep) => ep.id === currentEpisode?.id,
  );
  const nextEpisode =
    currentEpisodeIndex !== -1 && currentEpisodeIndex < episodes.length - 1
      ? episodes[currentEpisodeIndex + 1]
      : null;
  const nextUpEpisode =
    playbackQueue.length > 0 ? playbackQueue[0] : nextEpisode;
  const [searchQuery, setSearchQuery] = useState<string>("");

  // AI Companion & Smart Search states
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [aiIsLoading, setAiIsLoading] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<{
    recommendedIds?: string[];
    explanation?: string;
    mode?: string;
  } | null>(null);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [recList, setRecList] = useState<VideoContent[]>([]);
  const [isGlowEnabled, setIsGlowEnabled] = useState<boolean>(true);
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const [showArenaTooltip, setShowArenaTooltip] = useState<boolean>(false);
  const [isCinematicMode, setIsCinematicMode] = useState<boolean>(false);
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [isAutoDimEnabled, setIsAutoDimEnabled] = useState<boolean>(false);
  const [isPipActive, setIsPipActive] = useState<boolean>(false);
  const handleEnterPip = useCallback(() => setIsPipActive(true), []);
  const handleLeavePip = useCallback(() => setIsPipActive(false), []);
  const [isPersistentAutoplayEnabled, setIsPersistentAutoplayEnabled] =
    useState<boolean>(() => {
      const saved = localStorage.getItem("persistentAutoplayEnabled");
      return saved === null ? true : saved === "true";
    });
  const [showSettingsPopover, setShowSettingsPopover] =
    useState<boolean>(false);
  const [videoTechnicalMeta, setVideoTechnicalMeta] = useState<{
    resolution: string;
    fps: number;
    codec: string;
    bitrate: string;
  } | null>(null);
  const hoverTimerRef = useRef<any>(null);

  // Video Player custom simulator states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [episodeProgressMap, setEpisodeProgressMap] = useState<
    Record<string, number>
  >(() => {
    try {
      const saved = localStorage.getItem("watchPartyEpisodeProgress");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  const [playerSpeed, setPlayerSpeed] = useState<number>(1);
  const [playerQuality, setPlayerQuality] = useState<string>("1080p");
  const [selectedAudio, setSelectedAudio] = useState<string>("en");
  const [selectedSubtitle, setSelectedSubtitle] = useState<string>("en");
  const [downloadState, setDownloadState] = useState<
    "none" | "loading" | "done"
  >("none");
  const [seriesDownloadState, setSeriesDownloadState] = useState<
    "none" | "loading" | "done"
  >("none");
  const [seriesDownloadProgress, setSeriesDownloadProgress] =
    useState<number>(0);
  const [currentDownloadEpisodeIndex, setCurrentDownloadEpisodeIndex] =
    useState<number>(0);
  const [isPip, setIsPip] = useState<boolean>(false);
  const [isCasting, setIsCasting] = useState<boolean>(false);

  // Social Interactions (Comments)
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState<string>("");

  // Favorites list
  const [favorites, setFavorites] = useState<string[]>([]);
  const [episodeFavorites, setEpisodeFavorites] = useState<string[]>([]);

  // Parent & Admin states
  const [isParentAuthorized, setIsParentAuthorized] = useState<boolean>(false);
  const [showParentPinModal, setShowParentPinModal] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>("");
  const [pinError, setPinError] = useState<boolean>(false);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [dbSettings, setDbSettings] = useState<any>({ parentPin: "1234" });

  // Admin form inputs
  const [newVideoTitleAr, setNewVideoTitleAr] = useState<string>("");
  const [newVideoTitleEn, setNewVideoTitleEn] = useState<string>("");
  const [newVideoDescAr, setNewVideoDescAr] = useState<string>("");
  const [newVideoDescEn, setNewVideoDescEn] = useState<string>("");
  const [newVideoPoster, setNewVideoPoster] = useState<string>("");
  const [newVideoBanner, setNewVideoBanner] = useState<string>("");
  const [newVideoType, setNewVideoType] = useState<
    "movie" | "series" | "anime" | "educational"
  >("movie");
  const [newVideoAge, setNewVideoAge] = useState<
    "all" | "3-5" | "6-8" | "9-12"
  >("all");
  const [newVideoGenres, setNewVideoGenres] =
    useState<string>("adventure, comedy");
  const [newVideoDur, setNewVideoDur] = useState<string>("95 min");
  const [newVideoDubbed, setNewVideoDubbed] = useState<string>("ar, en");
  const [newVideoSubtitles, setNewVideoSubtitles] =
    useState<string>("ar, en, fr");

  // New Episode inputs
  const [newEpTitleAr, setNewEpTitleAr] = useState<string>("");
  const [newEpTitleEn, setNewEpTitleEn] = useState<string>("");
  const [newEpDescAr, setNewEpDescAr] = useState<string>("");
  const [newEpDescEn, setNewEpDescEn] = useState<string>("");
  const [newEpSeriesId, setNewEpSeriesId] = useState<string>("");
  const [newEpNum, setNewEpNum] = useState<number>(3);
  const [newEpThumb, setNewEpThumb] = useState<string>("");
  const [newEpUrl, setNewEpUrl] = useState<string>(
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  );

  // Profile creation
  const [newProfileName, setNewProfileName] = useState<string>("");
  const [newProfileAge, setNewProfileAge] = useState<number>(6);
  const [newProfileAvatar, setNewProfileAvatar] = useState<string>("🐸");

  // Custom blocked keywords state for Parent restrictions
  const [customKeywordInput, setCustomKeywordInput] = useState<string>("");

  // Database Schemas state for parental exploration view
  const [activeSchemaTab, setActiveSchemaTab] = useState<string>("movies");

  // Voice Navigation States
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>("");
  const [voiceStatus, setVoiceStatus] = useState<string>("idle"); // 'idle' | 'listening' | 'heard' | 'error'
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const recognitionRef = useRef<any>(null);

  // Interactive Adventure Rating States
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});
  const [hoveredStars, setHoveredStars] = useState<number | null>(null);
  const [ratingSubmitLoading, setRatingSubmitLoading] = useState<string | null>(
    null,
  ); // maps videoId being rated
  const [ratingSuccessMessage, setRatingSuccessMessage] = useState<
    string | null
  >(null); // maps videoId showing success

  // Video player enhancement states (Skip Intro & Autoplay Next)
  const [playerCurrentTime, setPlayerCurrentTime] = useState<number>(0);
  const [playerDuration, setPlayerDuration] = useState<number>(0);
  const [autoplayCancelled, setAutoplayCancelled] = useState<boolean>(false);
  const [showSkipIntroToast, setShowSkipIntroToast] = useState<boolean>(false);
  const [isMiniPlayer, setIsMiniPlayer] = useState<boolean>(false);
  const [hoveredTime, setHoveredTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [bookmarks, setBookmarks] = useState<
    { id: string; time: number; title: string }[]
  >([]);
  const [showAddBookmark, setShowAddBookmark] = useState<boolean>(false);
  const [newBookmarkTitle, setNewBookmarkTitle] = useState<string>("");
  const [hoveredBookmark, setHoveredBookmark] = useState<{
    id: string;
    time: number;
    title: string;
    x: number;
  } | null>(null);

  const [activeProviderId, setActiveProviderId] =
    useState<string>("vidsrc-xyz");
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [providerPings, setProviderPings] = useState<Record<string, number>>({
    "vidsrc-xyz": 14,
    "vidsrc-cc": 18,
    "vidsrc-in": 22,
    "vidsrc-pm": 29,
    "vidbox-ultra": 34,
    "hls-cyber": 41,
    "super-fast": 48,
    "vidsrc-pro": 52,
    "autoembed-co": 59,
  });
  const [activeLogs, setActiveLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] Handshaking CDN edge gateway: vidsrc-xyz`,
    `[${new Date().toLocaleTimeString()}] Connection established! Latency: 14ms.`,
  ]);

  // Premium Stream Enhancements
  const [showStatsForNerds, setShowStatsForNerds] = useState<boolean>(false);
  const [isPlayerLocked, setIsPlayerLocked] = useState<boolean>(false);
  const [showHotkeysModal, setShowHotkeysModal] = useState<boolean>(false);
  const [spatialAudioMode, setSpatialAudioMode] = useState<
    "off" | "boost" | "theater" | "vocals"
  >("off");
  const [ambientBlurIntensity, setAmbientBlurIntensity] = useState<number>(80);
  const [ambientBlurOpacity, setAmbientBlurOpacity] = useState<number>(60);
  const [bandwidthData, setBandwidthData] = useState<number[]>([
    120, 124, 122, 125, 123, 126, 124, 128, 127, 126, 125, 126, 124, 126, 125,
  ]);
  const [videoBrightness, setVideoBrightness] = useState<number>(100);
  const [videoGrayscale, setVideoGrayscale] = useState<boolean>(false);
  const [resolvedTmdbInfo, setResolvedTmdbInfo] = useState<{
    tmdbId: number;
    resolvedType: string;
    title: string;
  } | null>(null);
  const [isLoadingTmdbInfo, setIsLoadingTmdbInfo] = useState<boolean>(false);

  useEffect(() => {
    if (currentEpisode) {
      const saved = localStorage.getItem(`bookmarks_${currentEpisode.id}`);
      if (saved) {
        try {
          setBookmarks(JSON.parse(saved));
        } catch (e) {
          setBookmarks([]);
        }
      } else {
        const dur = playerDuration || 1200;
        const defaults = [
          {
            id: "def1",
            time: Math.round(dur * 0.05),
            title: lang === "ar" ? "المقدمة" : "Opening & Intro",
          },
          {
            id: "def2",
            time: Math.round(dur * 0.25),
            title: lang === "ar" ? "بداية الإثارة" : "Main Story Event",
          },
          {
            id: "def3",
            time: Math.round(dur * 0.75),
            title: lang === "ar" ? "ذروة الأحداث" : "Climax Sequence",
          },
          {
            id: "def4",
            time: Math.round(dur * 0.92),
            title:
              lang === "ar" ? "الخاتمة وشارات النهاية" : "Resolution & Credits",
          },
        ];
        setBookmarks(defaults);
      }
    } else {
      setBookmarks([]);
    }
  }, [currentEpisode?.id, playerDuration, lang]);

  useEffect(() => {
    if (
      previewVideoRef.current &&
      hoveredTime !== null &&
      isFinite(hoveredTime)
    ) {
      previewVideoRef.current.currentTime = hoveredTime;
    }
  }, [hoveredTime]);

  useEffect(() => {
    setAutoplayCancelled(false);
    setShowSkipIntroToast(false);
  }, [currentEpisode?.id]);

  // Dismiss Theater Mode on pressing ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsTheaterMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Reset custom related videos on active video change
  useEffect(() => {
    setCustomRelatedVideos([]);
  }, [activeVideo?.id]);

  const handleRefreshRelatedRecommendations = async () => {
    if (!activeVideo) return;
    setIsRefreshingRelated(true);

    try {
      // Collect current displayed video IDs to exclude them from the new ones
      const currentIds = customRelatedVideos.length > 0
        ? customRelatedVideos.map((v) => v.id)
        : videos
            .filter(
              (v) =>
                v.id !== activeVideo.id &&
                !isBlockedByParentFilters(v) &&
                (v.genres || []).some((g) =>
                  (activeVideo.genres || []).includes(g),
                ),
            )
            .slice(0, 4)
            .map((v) => v.id);

      const response = await fetch("/api/videos/recommend-more", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoId: activeVideo.id,
          excludeIds: currentIds,
          language: lang,
        }),
      });

      const data = await response.json();
      if (data.success && Array.isArray(data.recommendations)) {
        setCustomRelatedVideos(data.recommendations);
      }
    } catch (error) {
      console.error("Error regenerating related recommendations:", error);
    } finally {
      setIsRefreshingRelated(false);
    }
  };

  const formatMinSec = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleImgError = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80";
  }, []);

  const handleAddBookmark = (title: string) => {
    if (!currentEpisode) return;
    const time = Math.round(playerCurrentTime);
    const newB = {
      id: Date.now().toString(),
      time,
      title:
        title.trim() ||
        (lang === "ar"
          ? `علامة مائية @ ${formatMinSec(time)}`
          : `Marker @ ${formatMinSec(time)}`),
    };
    const updated = [...bookmarks, newB].sort((a, b) => a.time - b.time);
    setBookmarks(updated);
    localStorage.setItem(
      `bookmarks_${currentEpisode.id}`,
      JSON.stringify(updated),
    );
    setNewBookmarkTitle("");
    setShowAddBookmark(false);
  };

  const handleDeleteBookmark = (bId: string) => {
    if (!currentEpisode) return;
    const updated = bookmarks.filter((b) => b.id !== bId);
    setBookmarks(updated);
    localStorage.setItem(
      `bookmarks_${currentEpisode.id}`,
      JSON.stringify(updated),
    );
  };

  const handleSelectProvider = (id: string, nameEn: string) => {
    setActiveProviderId(id);
    const newLogs = [
      `[${new Date().toLocaleTimeString()}] Handshaking CDN edge gateway: ${id}`,
      `[${new Date().toLocaleTimeString()}] Authenticating session credentials with host node...`,
      `[${new Date().toLocaleTimeString()}] Switching active source pipeline to ${nameEn}`,
      `[${new Date().toLocaleTimeString()}] Buffering stream tracks (HLS chunks)...`,
      `[${new Date().toLocaleTimeString()}] Connection established! Latency is ${providerPings[id]}ms. Channel ready.`,
    ];
    setActiveLogs(newLogs);
  };

  const runProviderPingTest = () => {
    setIsPinging(true);
    setActiveLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Broadcast global ICMP probe to providers list...`,
    ]);
    setTimeout(() => {
      const nextPings = {
        "vidsrc-xyz": Math.floor(Math.random() * 8) + 8,
        "vidsrc-cc": Math.floor(Math.random() * 10) + 12,
        "vidsrc-in": Math.floor(Math.random() * 12) + 15,
        "vidsrc-pm": Math.floor(Math.random() * 15) + 20,
        "vidbox-ultra": Math.floor(Math.random() * 15) + 25,
        "hls-cyber": Math.floor(Math.random() * 20) + 32,
        "super-fast": Math.floor(Math.random() * 22) + 40,
        "vidsrc-pro": Math.floor(Math.random() * 25) + 45,
        "autoembed-co": Math.floor(Math.random() * 30) + 50,
      };
      setProviderPings(nextPings);
      setIsPinging(false);
      setActiveLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Probe complete! Selected optimum tunnel: ${nextPings["vidsrc-xyz"]}ms`,
      ]);
    }, 1500);
  };

  // Realtime Bandwidth Speedometer simulation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setBandwidthData((prev) => {
        let baseSpeed = 120;
        if (activeProviderId === "vidsrc-xyz") baseSpeed = 138;
        else if (activeProviderId === "vidsrc-cc") baseSpeed = 126;
        else if (activeProviderId === "vidsrc-in") baseSpeed = 118;
        else if (activeProviderId === "vidsrc-pm") baseSpeed = 110;
        else if (activeProviderId === "vidbox-ultra") baseSpeed = 104;
        else if (activeProviderId === "hls-cyber") baseSpeed = 98;
        else if (activeProviderId === "super-fast") baseSpeed = 92;
        else if (activeProviderId === "vidsrc-pro") baseSpeed = 88;
        else if (activeProviderId === "autoembed-co") baseSpeed = 81;

        const fluctuation = Math.floor(Math.random() * 12) - 6;
        const nextSpeed = Math.max(1, baseSpeed + fluctuation);
        const nextArr = [...prev.slice(1), nextSpeed];
        return nextArr;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [isPlaying, activeProviderId]);

  // Premium Hotkeys and Keyboard Shortcuts Engine
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true")
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      if (key === "l") {
        e.preventDefault();
        setIsPlayerLocked((prev) => {
          const next = !prev;
          showSwipeMessage(
            lang === "ar"
              ? next
                ? "🔒 تم قفل أزرار التحكم"
                : "🔓 تم إلغاء قفل أزرار التحكم"
              : next
                ? "🔒 Player Controls Locked"
                : "🔓 Player Controls Unlocked",
          );
          return next;
        });
        return;
      }

      if (isPlayerLocked) return;

      if (e.key === " ") {
        e.preventDefault();
        handlePlayPauseToggle();
        showSwipeMessage(
          lang === "ar"
            ? isPlaying
              ? "⏸️ إيقاف مؤقت"
              : "▶️ تشغيل"
            : isPlaying
              ? "⏸️ Paused"
              : "▶️ Playing",
        );
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (videoRef.current) {
          const target = Math.min(
            videoRef.current.duration || 0,
            videoRef.current.currentTime + 10,
          );
          videoRef.current.currentTime = target;
          showSwipeMessage(lang === "ar" ? "تقديم 10ث »" : "Skip 10s »");
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (videoRef.current) {
          const target = Math.max(0, videoRef.current.currentTime - 10);
          videoRef.current.currentTime = target;
          showSwipeMessage(lang === "ar" ? "« إرجاع 10ث" : "« Rewind 10s");
        }
      } else if (key === "m") {
        e.preventDefault();
        if (videoRef.current) {
          const isMute = videoRef.current.muted;
          videoRef.current.muted = !isMute;
          showSwipeMessage(
            lang === "ar"
              ? isMute
                ? "🔊 إلغاء الكتم"
                : "🔇 كتم الصوت"
              : isMute
                ? "🔊 Unmuted"
                : "🔇 Muted",
          );
        }
      } else if (key === "t") {
        e.preventDefault();
        setIsTheaterMode((prev) => {
          const next = !prev;
          if (next && isCinematicMode) setIsCinematicMode(false);
          showSwipeMessage(
            lang === "ar"
              ? next
                ? "🎭 نمط المسرح"
                : "📺 النمط الافتراضي"
              : next
                ? "🎭 Theater Mode"
                : "📺 Default View",
          );
          return next;
        });
      } else if (key === "c") {
        e.preventDefault();
        setIsCinematicMode((prev) => {
          const next = !prev;
          if (next && isTheaterMode) setIsTheaterMode(false);
          showSwipeMessage(
            lang === "ar"
              ? next
                ? "✨ نمط الإضاءة السينمائية"
                : "⚙️ إيقاف النمط السينمائي"
              : next
                ? "✨ Amber Aura Glow On"
                : "⚙️ Amber Aura Glow Off",
          );
          return next;
        });
      } else if (key === "n") {
        e.preventDefault();
        setShowStatsForNerds((prev) => {
          const next = !prev;
          showSwipeMessage(
            next ? "⚙️ Stats for Nerds ON" : "⚙️ Stats for Nerds OFF",
          );
          return next;
        });
      } else if (key === "b") {
        e.preventDefault();
        if (currentEpisode) {
          const time = Math.round(
            videoRef.current?.currentTime || playerCurrentTime,
          );
          const quickTitle =
            lang === "ar"
              ? `علامة سريعة @ ${formatMinSec(time)}`
              : `Quick Tag @ ${formatMinSec(time)}`;
          handleAddBookmark(quickTitle);
          showSwipeMessage(
            lang === "ar" ? "📍 تم حفظ نقطة الفصل!" : "📍 Chapter tag added!",
          );
        }
      } else if (key === "h") {
        e.preventDefault();
        setShowHotkeysModal((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [
    isPlaying,
    isPlayerLocked,
    currentEpisode,
    playerCurrentTime,
    lang,
    isCinematicMode,
    isTheaterMode,
  ]);

  useEffect(() => {
    const handleScroll = () => {
      const arena = document.getElementById("video-arena");
      if (arena && activeVideo) {
        const rect = arena.getBoundingClientRect();
        if (rect.bottom < 150) {
          setIsMiniPlayer(true);
        } else {
          setIsMiniPlayer(false);
        }
      } else {
        setIsMiniPlayer(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeVideo]);

  useEffect(() => {
    let scrollTimeout: any;
    const handleScrollDetect = () => {
      setIsScrolling(true);
      if (scrollTimeout) {
        window.clearTimeout(scrollTimeout);
      }
      scrollTimeout = window.setTimeout(() => {
        setIsScrolling(false);
      }, 200);
    };
    window.addEventListener("scroll", handleScrollDetect, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScrollDetect);
      if (scrollTimeout) {
        window.clearTimeout(scrollTimeout);
      }
    };
  }, []);

  // Interactive Avatar Builder States
  const [selectedProfileToEdit, setSelectedProfileToEdit] =
    useState<UserProfile | null>(null);
  const [editingAvatarConfig, setEditingAvatarConfig] =
    useState<CustomAvatarConfig | null>(null);
  const [saveAvatarLoading, setSaveAvatarLoading] = useState<boolean>(false);
  const [saveAvatarSuccess, setSaveAvatarSuccess] = useState<boolean>(false);

  // Helper system logging inside clean state
  const addVoiceActivityLog = async (action: string, detail: string) => {
    try {
      await fetch("/api/logs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, detail }),
      });
      if (isParentAuthorized) {
        const res = await fetch("/api/logs");
        const data = await res.json();
        if (data.success) setLogs(data.logs);
      }
    } catch (err) {
      console.error("Failed to add speech activity log:", err);
    }
  };

  // Process voice navigation commands
  const processVoiceCommand = (text: string) => {
    const cleanText = text.toLowerCase().trim();

    // 1. Play / Pause
    if (
      cleanText === "play" ||
      cleanText === "start" ||
      cleanText.includes("play") ||
      cleanText.includes("تشغيل") ||
      cleanText.includes("شغل")
    ) {
      setIsPlaying(true);
      addVoiceActivityLog(
        "Voice Navigation",
        'Command: "Play" triggered video player.',
      );
      return;
    }
    if (
      cleanText === "pause" ||
      cleanText === "stop" ||
      cleanText.includes("pause") ||
      cleanText.includes("إيقاف") ||
      cleanText.includes("أوقف")
    ) {
      setIsPlaying(false);
      addVoiceActivityLog(
        "Voice Navigation",
        'Command: "Pause" paused video player.',
      );
      return;
    }

    // 2. Tab Navigation
    if (
      cleanText === "home" ||
      cleanText === "go home" ||
      cleanText.includes("go home") ||
      cleanText.includes("back home") ||
      cleanText === "الرئيسية" ||
      cleanText.includes("الرئيسية")
    ) {
      setActiveTab("home");
      setSearchQuery("");
      addVoiceActivityLog(
        "Voice Navigation",
        "Command: Navigated to Home screen.",
      );
      return;
    }
    if (
      cleanText.includes("movie") ||
      cleanText === "movies" ||
      cleanText.includes("أفلام") ||
      cleanText.includes("فيلم")
    ) {
      setActiveTab("movies");
      addVoiceActivityLog(
        "Voice Navigation",
        "Command: Navigated to Movies section.",
      );
      return;
    }
    if (
      cleanText.includes("series") ||
      cleanText === "shows" ||
      cleanText.includes("مسلسلات") ||
      cleanText.includes("مسلسل")
    ) {
      setActiveTab("series");
      addVoiceActivityLog(
        "Voice Navigation",
        "Command: Navigated to Series section.",
      );
      return;
    }
    if (
      cleanText.includes("anime") ||
      cleanText === "cartoon" ||
      cleanText.includes("أنمي") ||
      cleanText.includes("كرتون")
    ) {
      setActiveTab("anime");
      addVoiceActivityLog(
        "Voice Navigation",
        "Command: Navigated to Anime section.",
      );
      return;
    }
    if (
      cleanText.includes("education") ||
      cleanText.includes("educational") ||
      cleanText.includes("تعليمي") ||
      cleanText.includes("دراسة")
    ) {
      setActiveTab("educational");
      addVoiceActivityLog(
        "Voice Navigation",
        "Command: Navigated to Educational section.",
      );
      return;
    }
    if (
      cleanText.includes("favorite") ||
      cleanText === "favorites" ||
      cleanText.includes("المفضلة")
    ) {
      setActiveTab("favorites");
      addVoiceActivityLog(
        "Voice Navigation",
        "Command: Navigated to Favorites list.",
      );
      return;
    }
    if (
      cleanText.includes("download") ||
      cleanText === "downloads" ||
      cleanText.includes("تنزيل") ||
      cleanText.includes("تحميل")
    ) {
      setActiveTab("downloads");
      addVoiceActivityLog(
        "Voice Navigation",
        "Command: Navigated to Downloads list.",
      );
      return;
    }
    if (
      cleanText.includes("parent") ||
      cleanText === "portal" ||
      cleanText.includes("بوابة الآباء") ||
      cleanText.includes("بوابة الاباء") ||
      cleanText.includes("آباء")
    ) {
      setActiveTab("parent-portal");
      addVoiceActivityLog(
        "Voice Navigation",
        "Command: Navigated to Parent section.",
      );
      return;
    }

    // 3. Search commands
    // Supported formats: "search for [something]", "find [something]", "look for [something]", "search [something]"
    // Arabic equivalent: "ابحث عن [شيء]", "بحث عن [شيء]"
    const searchMatchEn = cleanText.match(
      /(?:search for|find|look for|search)\s+(.+)/i,
    );
    const searchMatchAr = cleanText.match(
      /(?:ابحث عن|بحث عن|ابحث|بحث|دور على)\s+(.+)/,
    );

    if (searchMatchEn && searchMatchEn[1]) {
      const keyword = searchMatchEn[1].trim();
      setSearchQuery(keyword);
      setActiveTab("home"); // display search result feed on home tab
      addVoiceActivityLog(
        "Voice Navigation",
        `Command: Searched keyword "${keyword}".`,
      );
      return;
    }

    if (searchMatchAr && searchMatchAr[1]) {
      const keyword = searchMatchAr[1].trim();
      setSearchQuery(keyword);
      setActiveTab("home"); // display search result feed on home tab
      addVoiceActivityLog(
        "Voice Navigation",
        `Command: Searched keyword "${keyword}".`,
      );
      return;
    }
  };

  // Setup Browser standard SpeechRecognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = false;
    // Auto adapt language support based on language selector
    rec.lang = lang === "ar" ? "ar-SA" : "en-US";

    rec.onstart = () => {
      setVoiceStatus("listening");
    };

    rec.onresult = (event: any) => {
      const resultIndex = event.resultIndex;
      if (event.results && event.results[resultIndex]) {
        const transcript = event.results[resultIndex][0].transcript;
        setVoiceTranscript(transcript);
        setVoiceStatus("heard");

        // Execute actions globally
        processVoiceCommand(transcript);

        // Reset to listening visual status shortly
        setTimeout(() => {
          setVoiceStatus("listening");
        }, 1500);
      }
    };

    rec.onerror = (event: any) => {
      console.warn("Speech recognition interface error:", event.error);
      if (event.error === "no-speech") {
        return;
      }
      setVoiceStatus("error");
    };

    rec.onend = () => {
      if (isVoiceActive) {
        // Continuous service preservation
        try {
          rec.start();
        } catch (e) {
          console.error("SpeechRestart failed:", e);
        }
      } else {
        setVoiceStatus("idle");
      }
    };

    recognitionRef.current = rec;

    // Trigger start/stop when state changes
    if (isVoiceActive) {
      try {
        rec.start();
      } catch (err) {
        console.error("SpeechStart failed:", err);
      }
    } else {
      try {
        rec.stop();
      } catch (err) {}
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [lang, isVoiceActive]);

  const toggleVoiceNavigation = () => {
    if (!speechSupported) return;
    setIsVoiceActive(!isVoiceActive);
  };

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipeHandledRef = useRef<boolean>(false);
  const [showSwipeToast, setShowSwipeToast] = useState<{
    message: string;
    visible: boolean;
  }>({ message: "", visible: false });

  const showSwipeMessage = (msg: string) => {
    setShowSwipeToast({ message: msg, visible: true });
    setTimeout(
      () =>
        setShowSwipeToast((prev) =>
          prev.message === msg ? { message: "", visible: false } : prev,
        ),
      1500,
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    swipeHandledRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Only handle swipes on actual video element interactions as fallback for iframe touch blocking
    if (!touchStartRef.current || swipeHandledRef.current) return;

    const deltaX = e.touches[0].clientX - touchStartRef.current.x;
    const deltaY = e.touches[0].clientY - touchStartRef.current.y;

    if (Math.abs(deltaX) > 60 || Math.abs(deltaY) > 60) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0) {
          // Skip forward
          if (videoRef.current) {
            videoRef.current.currentTime += 10;
            showSwipeMessage(lang === "ar" ? "تقديم 10ث »" : "Skip 10s »");
          } else {
            showSwipeMessage(
              lang === "ar" ? "غير متاح هنا" : "Not supported here",
            );
          }
        } else {
          // Skip backward
          if (videoRef.current) {
            videoRef.current.currentTime -= 10;
            showSwipeMessage(lang === "ar" ? "« إرجاع 10ث" : "« Rewind 10s");
          } else {
            showSwipeMessage(
              lang === "ar" ? "غير متاح هنا" : "Not supported here",
            );
          }
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          // Volume down
          if (videoRef.current) {
            const newVol = Math.max(0, videoRef.current.volume - 0.1);
            videoRef.current.volume = newVol;
            showSwipeMessage(
              lang === "ar"
                ? `الصوت: ${Math.round(newVol * 100)}%`
                : `Volume: ${Math.round(newVol * 100)}%`,
            );
          } else {
            showSwipeMessage(
              lang === "ar" ? "غير متاح هنا" : "Not supported here",
            );
          }
        } else {
          // Volume up
          if (videoRef.current) {
            const newVol = Math.min(1, videoRef.current.volume + 0.1);
            videoRef.current.volume = newVol;
            showSwipeMessage(
              lang === "ar"
                ? `الصوت: ${Math.round(newVol * 100)}%`
                : `Volume: ${Math.round(newVol * 100)}%`,
            );
          } else {
            showSwipeMessage(
              lang === "ar" ? "غير متاح هنا" : "Not supported here",
            );
          }
        }
      }
      swipeHandledRef.current = true;
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
    swipeHandledRef.current = false;
  };

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const isRtl = lang === "ar";

  // Translate helpers
  const t = (key: string): string => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS["en"]?.[key] || key;
  };

  // Fetch initial data
  useEffect(() => {
    fetchVideos();
    fetchProfiles();
    fetchAds();
    fetchSettings();
    if (isParentAuthorized) {
      fetchLogs();
    }
  }, [isParentAuthorized]);

  const fetchVideos = async () => {
    try {
      const res = await fetch("/api/videos");
      const data = await res.json();

      let allVideos: any[] = [];
      if (data.success) {
        allVideos = [...data.videos];
      }

      // Parse URL parameters
      const searchParams = new URLSearchParams(window.location.search);
      const watchId = searchParams.get("watch");
      const seasonParam = searchParams.get("season");
      const episodeParam = searchParams.get("episode");

      // If we have a specific TMDB watchId that might not be in the initial external list, fetch it specifically via external API search
      if (watchId && !allVideos.find((v: any) => v.id === watchId)) {
        try {
          // Try to search for it directly
          const qClean = watchId
            .replace("tmdb_", "")
            .replace("ia_", "")
            .replace("jikan_", "")
            .replace("tvmaze_", "");
          const extRes = await fetch(
            `/api/videos/external?q=${encodeURIComponent(qClean)}`,
          );
          const extData = await extRes.json();
          if (extData.success && extData.videos) {
            allVideos = [...extData.videos, ...allVideos];
          }
        } catch (err) {}
      } else {
        // Normal external videos fetching
        try {
          const extRes = await fetch("/api/videos/external");
          const extData = await extRes.json();
          if (extData.success && extData.videos) {
            allVideos = [...allVideos, ...extData.videos];
          }
        } catch (err) {
          console.error("Failed fetching external videos", err);
        }
      }

      // Deduplicate allVideos by id
      const uniqueVideos = [];
      const seenIds = new Set();
      for (const v of allVideos) {
        if (!seenIds.has(v.id)) {
          seenIds.add(v.id);
          uniqueVideos.push(v);
        }
      }
      allVideos = uniqueVideos;

      setVideos(allVideos);

      if (watchId) {
        let target = allVideos.find((v: any) => v.id === watchId);
        if (!target && watchId.startsWith("tmdb_")) {
          // Fallback: If tmdb ID didn't return from search, we can create a proxy object and play it!
          target = {
            id: watchId,
            title: { en: "Watch Target " + watchId, ar: "Watch Target" },
            description: { en: "Loading details...", ar: "Loading details..." },
            poster:
              "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800&q=80",
            banner:
              "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=1200&q=80",
            videoUrl: `https://vidsrc.me/embed/movie?tmdb=${watchId.replace("tmdb_", "")}`,
            type: "movie",
            category: "Kids",
            ageCategory: "all",
            source: "TMDB",
            duration: "2h",
          };
          setVideos((prev) => [target, ...prev]);
        }

        if (target) {
          setActiveVideo(target);
          setActiveTab("home");

          // If season and episode are specified, we will need to handle setting the current episode
          // once the episodes are fetched in the separate useEffect. We can store it in a ref or localStorage.
          if (seasonParam && episodeParam) {
            localStorage.setItem(
              "pendingEpisodeSelection",
              JSON.stringify({
                videoId: watchId,
                season: parseInt(seasonParam),
                episode: parseInt(episodeParam),
              }),
            );
          }
        } else if (allVideos.length > 0 && !activeVideo) {
          setActiveVideo(allVideos[0]);
        }
      } else {
        if (allVideos.length > 0 && !activeVideo) {
          setActiveVideo(allVideos[0]);
        }
      }
    } catch (e) {
      console.error("Error loading videos", e);
    }
  };

  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) return;
    const delay = setTimeout(async () => {
      try {
        const extRes = await fetch(
          `/api/videos/external?q=${encodeURIComponent(searchQuery.trim())}`,
        );
        const extData = await extRes.json();
        if (extData.success && extData.videos && extData.videos.length > 0) {
          setVideos((prev) => {
            const existingIds = new Set(prev.map((p: any) => p.id));
            const newVids = extData.videos.filter(
              (v: any) => !existingIds.has(v.id),
            );
            return [...newVids, ...prev]; // prepend search results
          });
        }
      } catch (err) {
        // failed
      }
    }, 600);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  const fetchProfiles = async () => {
    try {
      const res = await fetch("/api/profiles");
      const data = await res.json();
      if (data.success) {
        setProfiles(data.profiles);
        if (data.profiles.length > 0 && !currentProfile) {
          setCurrentProfile(data.profiles[0]);
        }
      }
    } catch (e) {
      console.error("Error loading profiles", e);
    }
  };

  const fetchAds = async () => {
    try {
      const res = await fetch("/api/ads");
      const data = await res.json();
      if (data.success) {
        setAds(data.ads);
      }
    } catch (e) {
      console.error("Error loading ads", e);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/logs");
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (e) {
      console.error("Error loading status logs", e);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.success) {
        setDbSettings(data.settings);
      }
    } catch (e) {
      console.error("Error loading settings", e);
    }
  };

  const recordVideoView = async (videoId: string) => {
    if (!currentProfile) return;
    try {
      const res = await fetch("/api/profiles/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: currentProfile.id, videoId }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentProfile(data.profile);
        setProfiles((prev) =>
          prev.map((p) => (p.id === data.profile.id ? data.profile : p)),
        );
      }
    } catch (err) {
      console.error("Error updating view history on server", err);
    }
  };

  // Track video view whenever active video content is loaded or profile changes
  useEffect(() => {
    if (activeVideo && currentProfile) {
      recordVideoView(activeVideo.id);
    }
  }, [activeVideo?.id, currentProfile?.id]);

  // Resolve TMDB Info whenever active video changes
  useEffect(() => {
    if (!activeVideo) {
      setResolvedTmdbInfo(null);
      return;
    }

    if (activeVideo.id.startsWith("tmdb_tv_")) {
      const rawId = parseInt(activeVideo.id.replace("tmdb_tv_", ""));
      setResolvedTmdbInfo({
        tmdbId: rawId,
        resolvedType: "tv",
        title: activeVideo.title.en,
      });
      return;
    } else if (activeVideo.id.startsWith("tmdb_")) {
      const rawId = parseInt(activeVideo.id.replace("tmdb_", ""));
      setResolvedTmdbInfo({
        tmdbId: rawId,
        resolvedType: "movie",
        title: activeVideo.title.en,
      });
      return;
    }

    const resolve = async () => {
      setIsLoadingTmdbInfo(true);
      try {
        const titleClean = activeVideo.title.en || activeVideo.title.ar || "";
        const typeClean =
          activeVideo.type === "anime" || activeVideo.type === "series"
            ? "series"
            : "movie";
        const res = await fetch(
          `/api/videos/resolve-tmdb?title=${encodeURIComponent(titleClean)}&type=${typeClean}`,
        );
        const data = await res.json();
        if (data.success && data.tmdbId) {
          setResolvedTmdbInfo({
            tmdbId: data.tmdbId,
            resolvedType: data.resolvedType,
            title: data.originalTitle,
          });
        } else {
          setResolvedTmdbInfo(null);
        }
      } catch (e) {
        console.error("Failed to resolve TMDB ID", e);
        setResolvedTmdbInfo(null);
      } finally {
        setIsLoadingTmdbInfo(false);
      }
    };

    resolve();
  }, [activeVideo?.id]);

  // Load episodes for active video
  useEffect(() => {
    if (activeVideo) {
      fetchEpisodes(activeVideo.id);
      fetchComments(activeVideo.id);

      // Auto-set video audio options
      if (activeVideo.languageOptions?.dubbed?.length > 0) {
        setSelectedAudio(activeVideo.languageOptions.dubbed[0]);
      }
      if (activeVideo.languageOptions?.subtitled?.length > 0) {
        setSelectedSubtitle(activeVideo.languageOptions.subtitled[0]);
      } else {
        setSelectedSubtitle("none");
      }
      // reset player
      setIsPlaying(false);
      setVideoProgress(15);
      setDownloadState("none");
      setSeriesDownloadState("none");
      setSeriesDownloadProgress(0);
      setCurrentDownloadEpisodeIndex(0);
    }
  }, [activeVideo]);

  // Update URL parameters for Deep Linking
  useEffect(() => {
    if (activeVideo) {
      const url = new URL(window.location.href);
      url.searchParams.set("watch", activeVideo.id);
      if (
        currentEpisode &&
        currentEpisode.seasonId &&
        currentEpisode.episodeNumber
      ) {
        url.searchParams.set("season", currentEpisode.seasonId.toString());
        url.searchParams.set(
          "episode",
          currentEpisode.episodeNumber.toString(),
        );
      } else {
        url.searchParams.delete("season");
        url.searchParams.delete("episode");
      }
      window.history.replaceState({}, "", url.toString());
    } else {
      const url = new URL(window.location.href);
      url.searchParams.delete("watch");
      url.searchParams.delete("season");
      url.searchParams.delete("episode");
      // keep 'room' param if exists
      window.history.replaceState({}, "", url.toString());
    }
  }, [
    activeVideo?.id,
    currentEpisode?.id,
    currentEpisode?.seasonId,
    currentEpisode?.episodeNumber,
  ]);

  // Update Technical Metadata when content loads
  useEffect(() => {
    if (currentEpisode) {
      const isEmbed =
        currentEpisode.videoUrl?.includes("embed") || !currentEpisode.videoUrl;
      const isAnime = activeVideo?.type === "anime";
      setVideoTechnicalMeta({
        resolution: isEmbed ? "1920x1080" : "1280x720", // Fallback defaults
        fps: isAnime ? 23.976 : 29.97,
        codec: "avc1.64002a (H.264 / AAC)",
        bitrate: "3.4 Mbps",
      });
    } else {
      setVideoTechnicalMeta(null);
    }
  }, [currentEpisode?.id, activeVideo?.type]);

  // ---------------------------------------------------------
  // WATCH PARTY SYNCHRONIZATION HELPERS & WEBSOCKET ENGINE
  // ---------------------------------------------------------
  const generatePartyCode = () => {
    const adjectives = [
      "happy",
      "magic",
      "sunny",
      "super",
      "galaxy",
      "cosmic",
      "bouncy",
      "lucky",
    ];
    const animals = [
      "bunny",
      "panda",
      "dino",
      "koala",
      "penguin",
      "fox",
      "owl",
      "tiger",
    ];
    const ad = adjectives[Math.floor(Math.random() * adjectives.length)];
    const an = animals[Math.floor(Math.random() * animals.length)];
    const num = Math.floor(Math.random() * 90) + 10;
    return `${ad}-${an}-${num}`;
  };

  const sendWsMessage = (payload: any) => {
    if (
      wsRef.current &&
      wsRef.current.readyState === WebSocket.OPEN &&
      watchPartyId
    ) {
      wsRef.current.send(
        JSON.stringify({
          roomId: watchPartyId,
          ...payload,
        }),
      );
    }
  };

  const startWatchParty = () => {
    const newCode = generatePartyCode();
    setWatchPartyId(newCode);

    // Update URL query parameters
    const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?room=${newCode}`;
    window.history.pushState({ path: newUrl }, "", newUrl);

    const isAr = lang === "ar";
    setWatchPartyToast(
      isAr
        ? "🎉 تم إنشاء الحفلة! انسخ الرابط لمشاركته مع أصدقائك!"
        : "🎉 Watch Party created! Copy the link to invite friends!",
    );
    setTimeout(() => setWatchPartyToast(null), 3000);
  };

  const joinWatchParty = (code: string) => {
    if (!code || !code.trim()) return;
    const cleanCode = code.trim().toLowerCase();
    setWatchPartyId(cleanCode);

    // Update URL query parameters
    const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?room=${cleanCode}`;
    window.history.pushState({ path: newUrl }, "", newUrl);

    const isAr = lang === "ar";
    setWatchPartyToast(
      isAr
        ? "🚀 انضممت إلى الحفلة بنجاح!"
        : "🚀 Joined the watch party successfully!",
    );
    setTimeout(() => setWatchPartyToast(null), 3000);
    setJoinCodeInput("");
    setShowJoinPartyInput(false);
  };

  const leaveWatchParty = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setWatchPartyId(null);
    setWatchPartyRoom(null);

    // Clear URL parameters
    const cleanUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    window.history.pushState({ path: cleanUrl }, "", cleanUrl);

    const isAr = lang === "ar";
    setWatchPartyToast(
      isAr ? "👋 غادرت حفلة المشاهدة." : "👋 Left the watch party.",
    );
    setTimeout(() => setWatchPartyToast(null), 3000);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim()) return;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "chat_message",
          text: chatInputText.trim(),
        }),
      );
      setChatInputText("");
    }
  };

  // Watch for Room ID in URL on initial load / mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const r = searchParams.get("room");
    if (r) {
      console.log("Detected room in URL search parameters:", r);
      setWatchPartyId(r);
    }
  }, []);

  // Sync Video/Episode Change
  const lastBroadcastedEpisodeIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (watchPartyId && activeVideo && currentEpisode) {
      if (lastBroadcastedEpisodeIdRef.current === currentEpisode.id) {
        return;
      }

      if (ignoreNextEpisodeChangeRef.current) {
        ignoreNextEpisodeChangeRef.current = false;
        lastBroadcastedEpisodeIdRef.current = currentEpisode.id;
        return;
      }

      console.log(
        "Broadcasting content switch:",
        activeVideo.id,
        currentEpisode.id,
      );
      lastBroadcastedEpisodeIdRef.current = currentEpisode.id;
      sendWsMessage({
        type: "change_video",
        videoId: activeVideo.id,
        episodeId: currentEpisode.id,
      });
    }
  }, [activeVideo?.id, currentEpisode?.id, watchPartyId]);

  // Handle WebSocket Room Lifecycle & Events
  useEffect(() => {
    if (watchPartyId && currentProfile) {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}`;

      console.log("Starting Watch Party WebSocket client:", wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket client joined party room:", watchPartyId);
        ws.send(
          JSON.stringify({
            type: "join",
            roomId: watchPartyId,
            userId: currentProfile.id,
            userName: currentProfile.name,
            userAvatar: currentProfile.avatar,
            userColor: currentProfile.color,
            currentVideoId: activeVideo?.id || undefined,
            currentEpisodeId: currentEpisode?.id || undefined,
          }),
        );
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Received WebSocket event:", data.type);

          switch (data.type) {
            case "room_state": {
              setWatchPartyRoom(data.room);

              const room = data.room;
              if (
                room.currentVideoId &&
                room.currentVideoId !== activeVideo?.id
              ) {
                const targetVideo = videos.find(
                  (v) => v.id === room.currentVideoId,
                );
                if (targetVideo) {
                  ignoreNextEpisodeChangeRef.current = true;
                  setActiveVideo(targetVideo);

                  if (room.currentEpisodeId) {
                    // Pre-fetch episodes and mount episode
                    fetch(`/api/episodes?seriesId=${room.currentVideoId}`)
                      .then((r) => r.json())
                      .then((epData) => {
                        if (epData.success && epData.episodes) {
                          setEpisodes(epData.episodes);
                          const ep = epData.episodes.find(
                            (e: any) => e.id === room.currentEpisodeId,
                          );
                          if (ep) {
                            setCurrentEpisode(ep);
                          }
                        }
                      })
                      .catch((e) => console.error(e));
                  }
                }
              }
              break;
            }

            case "playback_change": {
              if (data.senderId === currentProfile.id) return;
              const { action, currentTime } = data;

              if (videoRef.current) {
                if (
                  Math.abs(videoRef.current.currentTime - currentTime) > 1.8
                ) {
                  videoRef.current.currentTime = currentTime;
                  setPlayerCurrentTime(currentTime);
                  const pct =
                    (currentTime / (videoRef.current.duration || 1)) * 100;
                  setVideoProgress(pct);
                }

                if (action === "play") {
                  setIsPlaying(true);
                  videoRef.current
                    .play()
                    .catch((e) =>
                      console.log("WebSocket video play aborted", e),
                    );
                } else if (action === "pause") {
                  setIsPlaying(false);
                  videoRef.current.pause();
                } else if (action === "seek") {
                  videoRef.current.currentTime = currentTime;
                  setPlayerCurrentTime(currentTime);
                  const pct =
                    (currentTime / (videoRef.current.duration || 1)) * 100;
                  setVideoProgress(pct);
                }
              }
              break;
            }

            case "content_change": {
              if (data.senderId === currentProfile.id) return;
              const { videoId, episodeId } = data;

              const targetVideo = videos.find((v) => v.id === videoId);
              if (targetVideo) {
                ignoreNextEpisodeChangeRef.current = true;
                setActiveVideo(targetVideo);

                if (episodeId) {
                  fetch(`/api/episodes?seriesId=${videoId}`)
                    .then((r) => r.json())
                    .then((epData) => {
                      if (epData.success && epData.episodes) {
                        setEpisodes(epData.episodes);
                        const ep = epData.episodes.find(
                          (e: any) => e.id === episodeId,
                        );
                        if (ep) {
                          setCurrentEpisode(ep);
                        }
                      }
                    })
                    .catch((e) => console.error(e));
                }
              }
              break;
            }

            case "new_chat": {
              setWatchPartyRoom((prev: any) => {
                if (!prev) return null;
                if (prev.messages.some((m: any) => m.id === data.message.id))
                  return prev;
                return {
                  ...prev,
                  messages: [...prev.messages, data.message],
                };
              });
              break;
            }
          }
        } catch (err) {
          console.error("Error parsing party payload:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket Client Error:", err);
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed cleanly.");
      };

      return () => {
        ws.close();
        wsRef.current = null;
      };
    }
  }, [watchPartyId, currentProfile?.id, videos]);

  const fetchEpisodes = async (videoId: string) => {
    try {
      const res = await fetch(`/api/episodes?seriesId=${videoId}`);
      const data = await res.json();

      let nextEpisode = null;
      let availableEpisodes = [];

      if (data.success && data.episodes.length > 0) {
        availableEpisodes = data.episodes;
      } else {
        const targetVideo = videos.find((v) => v.id === videoId) || activeVideo; // fallback to activeVideo directly if videos isn't updated yet in closure
        if (targetVideo && targetVideo.videoUrl) {
          availableEpisodes = [
            {
              id: `dummy_${targetVideo.id}`,
              seasonId: "1",
              seriesId: targetVideo.id,
              episodeNumber: 1,
              title: targetVideo.title,
              description: targetVideo.description,
              videoUrl: targetVideo.videoUrl,
              duration: targetVideo.duration || "N/A",
            } as any,
          ];
        }
      }

      setEpisodes(availableEpisodes);

      if (availableEpisodes.length > 0) {
        // Handle pending episodes from URL sharing
        try {
          const pendingRaw = localStorage.getItem("pendingEpisodeSelection");
          if (pendingRaw) {
            const pending = JSON.parse(pendingRaw);
            if (pending.videoId === videoId) {
              // Try finding matching season and episode
              const matchingEp = availableEpisodes.find(
                (ep: any) =>
                  ep.seasonId === pending.season.toString() &&
                  ep.episodeNumber === pending.episode,
              );
              if (matchingEp) {
                nextEpisode = matchingEp;
              } else if (videoId.startsWith("tmdb_")) {
                // Create dummy dynamic episode for external TV series
                const targetVideo =
                  videos.find((v) => v.id === videoId) || activeVideo;
                const dynamicEp = {
                  id: `tmdb_tv_${videoId}_s${pending.season}e${pending.episode}`,
                  seasonId: pending.season.toString(),
                  seriesId: videoId,
                  episodeNumber: pending.episode,
                  title: {
                    en: `Season ${pending.season} Episode ${pending.episode}`,
                    ar: "",
                  },
                  description: { en: "", ar: "" },
                  videoUrl: `https://vidsrc.me/embed/tv?tmdb=${videoId.replace("tmdb_", "")}&season=${pending.season}&episode=${pending.episode}`,
                  duration: targetVideo?.duration || "N/A",
                };
                setEpisodes([dynamicEp as any, ...availableEpisodes]);
                nextEpisode = dynamicEp;
              }
            }
            localStorage.removeItem("pendingEpisodeSelection");
          }
        } catch (e) {}

        setCurrentEpisode(nextEpisode || availableEpisodes[0]);
      } else {
        setCurrentEpisode(null);
      }
    } catch (e) {
      console.error("Error fetching episodes", e);
    }
  };

  const fetchComments = async (videoId: string) => {
    try {
      const res = await fetch(`/api/comments?contentId=${videoId}`);
      const data = await res.json();
      if (data.success) {
        setComments(data.comments);
      }
    } catch (e) {
      console.error("Error fetching comments", e);
    }
  };

  // Switch Profiles securely
  const handleSelectProfile = (profile: UserProfile) => {
    setCurrentProfile(profile);
    // Log profile switch in UI simulator
    const tempLog: SystemLog = {
      id: "log_" + Date.now(),
      type: "auth",
      severity: "info",
      message: `Profile switched to ${profile.name} (Age ${profile.age})`,
      timestamp: new Date().toISOString(),
    };
    setLogs((prev) => [tempLog, ...prev]);
  };

  // Pin authentication
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === dbSettings.parentPin || pinInput === "1234") {
      setIsParentAuthorized(true);
      setShowParentPinModal(false);
      setPinInput("");
      setPinError(false);
      setActiveTab("parent-portal");
    } else {
      setPinError(true);
    }
  };

  // Log in as parent toggle
  const handleParentTabClick = () => {
    if (isParentAuthorized) {
      setActiveTab("parent-portal");
    } else {
      setShowParentPinModal(true);
    }
  };

  // Add Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activeVideo) return;

    try {
      const res = await fetch("/api/comments/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId: activeVideo.id,
          userName: currentProfile
            ? `${currentProfile.name} ${currentProfile.avatar}`
            : "Bright Star",
          text: newCommentText,
          userAvatar: currentProfile?.avatar || "✨",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setComments((prev) => [data.comment, ...prev]);
        setNewCommentText("");
      }
    } catch (err) {
      console.error("Error posting review comments", err);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((vId) => vId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const handleToggleEpisodeFavorite = (id: string) => {
    if (episodeFavorites.includes(id)) {
      setEpisodeFavorites(episodeFavorites.filter((eId) => eId !== id));
    } else {
      setEpisodeFavorites([...episodeFavorites, id]);
    }
  };

  const addToQueue = (ep: Episode) => {
    if (playbackQueue.some((q) => q.id === ep.id)) {
      return;
    }
    setPlaybackQueue([...playbackQueue, ep]);
    showSwipeMessage(
      lang === "ar"
        ? "تمت إضافة الحلقة للانتظار! 📺"
        : "Episode added to Playback Queue! 📺",
    );
  };

  const removeFromQueue = (epId: string) => {
    setPlaybackQueue(playbackQueue.filter((q) => q.id !== epId));
    showSwipeMessage(
      lang === "ar"
        ? "تمت إزالة الحلقة من قائمة الانتظار 🗑️"
        : "Removed from Playback Queue 🗑️",
    );
  };

  const clearQueue = () => {
    setPlaybackQueue([]);
    showSwipeMessage(
      lang === "ar" ? "تم تفريغ قائمة التشغيل" : "Playback Queue cleared",
    );
  };

  // Submit interactive star rating of current active video
  const handleRateVideo = async (videoId: string, stars: number) => {
    setRatingSubmitLoading(videoId);
    try {
      const res = await fetch(`/api/videos/${videoId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: stars }),
      });
      const data = await res.json();
      if (data.success) {
        setUserRatings((prev) => ({ ...prev, [videoId]: stars }));
        setVideos((prev) =>
          prev.map((v) =>
            v.id === videoId ? { ...v, rating: data.rating } : v,
          ),
        );
        setActiveVideo((prev) =>
          prev && prev.id === videoId ? { ...prev, rating: data.rating } : prev,
        );

        setRatingSuccessMessage(videoId);
        setTimeout(() => {
          setRatingSuccessMessage(null);
        }, 3000);
      }
    } catch (e) {
      console.error("Error submitting rating:", e);
    } finally {
      setRatingSubmitLoading(null);
    }
  };

  // Handle addition of movie via Admin Panel
  const handleAddVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoTitleEn || !newVideoTitleAr) return;

    const newVid: Partial<VideoContent> = {
      title: {
        ar: newVideoTitleAr,
        en: newVideoTitleEn,
        fr: newVideoTitleEn,
        de: newVideoTitleEn,
        es: newVideoTitleEn,
        it: newVideoTitleEn,
      },
      description: {
        ar: newVideoDescAr,
        en: newVideoDescEn,
        fr: newVideoDescEn,
        de: newVideoDescEn,
        es: newVideoDescEn,
        it: newVideoDescEn,
      },
      poster:
        newVideoPoster ||
        "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=600",
      banner:
        newVideoBanner ||
        "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200",
      type: newVideoType,
      ageCategory: newVideoAge,
      duration:
        newVideoType === "movie" || newVideoType === "educational"
          ? newVideoDur
          : undefined,
      seasonsCount:
        newVideoType === "series" || newVideoType === "anime" ? 1 : undefined,
      rating: 5.0,
      releaseYear: 2026,
      views: Math.floor(Math.random() * 50000) + 1200,
      genres: newVideoGenres.split(",").map((g) => g.trim().toLowerCase()),
      languageOptions: {
        dubbed: newVideoDubbed.split(",").map((g) => g.trim().toLowerCase()),
        subtitled: newVideoSubtitles
          .split(",")
          .map((g) => g.trim().toLowerCase()),
      },
      tags: newVideoGenres
        .split(",")
        .map((g) => g.trim().toLowerCase())
        .concat([newVideoAge]),
    };

    try {
      const res = await fetch("/api/videos/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVid),
      });
      const data = await res.json();
      if (data.success) {
        alert("Video Content added successfully! 🌟");
        setVideos((prev) => [data.video, ...prev]);
        // Reset Admin additions form
        setNewVideoTitleAr("");
        setNewVideoTitleEn("");
        setNewVideoDescAr("");
        setNewVideoDescEn("");
        setNewVideoPoster("");
        setNewVideoBanner("");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Handle addition of episode via Admin Panel
  const handleAddEpisodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEpTitleEn || !newEpTitleAr) return;

    const epObj: Partial<Episode> = {
      seriesId: newEpSeriesId,
      seasonId: "s_" + newEpSeriesId,
      episodeNumber: Number(newEpNum),
      title: {
        ar: newEpTitleAr,
        en: newEpTitleEn,
        fr: newEpTitleEn,
        de: newEpTitleEn,
        es: newEpTitleEn,
        it: newEpTitleEn,
      },
      description: {
        ar: newEpDescAr,
        en: newEpDescEn,
        fr: newEpDescEn,
        de: newEpDescEn,
        es: newEpDescEn,
        it: newEpDescEn,
      },
      thumbnail:
        newEpThumb ||
        "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=300",
      duration: "15 min",
      videoUrl: newEpUrl,
    };

    try {
      const res = await fetch("/api/episodes/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(epObj),
      });
      const data = await res.json();
      if (data.success) {
        alert("Episode Added successfully to catalog! ❤️");
        setNewEpTitleAr("");
        setNewEpTitleEn("");
        setNewEpDescAr("");
        setNewEpDescEn("");
        // reload current if matched active video
        if (activeVideo && activeVideo.id === newEpSeriesId) {
          fetchEpisodes(activeVideo.id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle creation of Profile
  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName) return;

    const colors = [
      "from-orange-400 to-red-500",
      "from-pink-400 to-purple-500",
      "from-green-400 to-emerald-600",
      "from-blue-400 to-indigo-600",
      "from-yellow-400 to-amber-500",
    ];
    const itemColor = colors[Math.floor(Math.random() * colors.length)];

    const prof: UserProfile = {
      id: "p_" + Date.now(),
      name: newProfileName,
      avatar: newProfileAvatar,
      age: newProfileAge,
      isKidsMode: true,
      color: itemColor,
    };

    try {
      const res = await fetch("/api/profiles/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prof),
      });
      const data = await res.json();
      if (data.success) {
        setProfiles([...profiles, data.profile]);
        setNewProfileName("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProfile = async (pId: string) => {
    try {
      await fetch(`/api/profiles/${pId}`, { method: "DELETE" });
      setProfiles(profiles.filter((p) => p.id !== pId));
      if (selectedProfileToEdit?.id === pId) {
        setSelectedProfileToEdit(null);
        setEditingAvatarConfig(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveCustomAvatar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfileToEdit || !editingAvatarConfig) return;

    setSaveAvatarLoading(true);
    setSaveAvatarSuccess(false);

    try {
      const res = await fetch(
        `/api/profiles/${selectedProfileToEdit.id}/update-avatar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customAvatar: editingAvatarConfig }),
        },
      );
      const data = await res.json();
      if (data.success) {
        setProfiles((prev) =>
          prev.map((p) =>
            p.id === selectedProfileToEdit.id ? data.profile : p,
          ),
        );
        if (currentProfile?.id === selectedProfileToEdit.id) {
          setCurrentProfile(data.profile);
        }
        setSaveAvatarSuccess(true);
        setTimeout(() => setSaveAvatarSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Error saving custom avatar", err);
    } finally {
      setSaveAvatarLoading(false);
    }
  };

  // Toggle active Ad State
  const handleToggleAd = async (adId: string) => {
    try {
      const res = await fetch("/api/ads/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: adId }),
      });
      const data = await res.json();
      if (data.success) {
        setAds(data.ads);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // AI companion submission
  const handleAiSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setAiIsLoading(true);
    setAiResponse(null);

    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt,
          ageCategory: currentProfile
            ? `${currentProfile.age - 2}-${currentProfile.age + 2}`
            : "6-8",
          language: lang,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiResponse(data);
        // Translate IDs back to movies for recommendation banner
        if (data.recommendedIds && data.recommendedIds.length > 0) {
          const matched = videos.filter((v: any) =>
            data.recommendedIds.includes(v.id),
          );
          setRecList(matched);
        } else {
          setRecList([]);
        }
      }
    } catch (err) {
      console.error("AI prompt search fail", err);
    } finally {
      setAiIsLoading(false);
    }
  };

  // Manage actual profile offline downloads
  const handleRemoveDownload = async (downloadId: string) => {
    if (!currentProfile) return;
    try {
      const res = await fetch("/api/profiles/download/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: currentProfile.id,
          downloadId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentProfile(data.profile);
        setProfiles((prev) =>
          prev.map((p) => (p.id === data.profile.id ? data.profile : p)),
        );
      }
    } catch (err) {
      console.error("Error removing download from base", err);
    }
  };

  const handleClearAllDownloads = async () => {
    if (!currentProfile) return;
    try {
      const res = await fetch("/api/profiles/download/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: currentProfile.id,
          removeAll: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentProfile(data.profile);
        setProfiles((prev) =>
          prev.map((p) => (p.id === data.profile.id ? data.profile : p)),
        );
      }
    } catch (err) {
      console.error("Error clearing downloads", err);
    }
  };

  const handlePlayDownloadedItem = (item: any) => {
    const video = videos.find((v) => v.id === item.videoId);
    if (video) {
      setActiveVideo(video);
      setIsPlaying(true);
      if (item.episodeId) {
        const foundEp = episodes.find((e) => e.id === item.episodeId);
        if (foundEp) {
          setCurrentEpisode(foundEp);
        } else {
          fetch(`/api/episodes?videoId=${video.id}`)
            .then((res) => res.json())
            .then((data) => {
              if (data.success && data.episodes) {
                const epObj = data.episodes.find(
                  (e: any) => e.id === item.episodeId,
                );
                if (epObj) {
                  setCurrentEpisode(epObj);
                }
              }
            })
            .catch((err) => console.error(err));
        }
      } else {
        setCurrentEpisode(null);
      }
      setTimeout(() => {
        document
          .getElementById("video-arena")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    }
  };

  // Simulate video offline download
  const handleDownloadOfflineSimulation = async () => {
    if (downloadState !== "none" || !currentProfile || !activeVideo) return;
    setDownloadState("loading");

    setTimeout(async () => {
      setDownloadState("done");

      const titleStr = currentEpisode
        ? `${activeVideo.title[lang] || activeVideo.title.en} - ${currentEpisode.title[lang] || currentEpisode.title.en}`
        : `${activeVideo.title[lang] || activeVideo.title.en}`;

      try {
        const res = await fetch("/api/profiles/download", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profileId: currentProfile.id,
            videoId: activeVideo.id,
            episodeId: currentEpisode?.id,
            title: titleStr,
            poster: activeVideo.poster,
            type: activeVideo.type,
            sizeMb: currentEpisode ? 45 : 180,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setCurrentProfile(data.profile);
          setProfiles((prev) =>
            prev.map((p) => (p.id === data.profile.id ? data.profile : p)),
          );
        }
      } catch (err) {
        console.error("Failed to sync download to database", err);
      }
    }, 2500);
  };

  const getOfflineCuteStepMessage = (pct: number, cl: string): string => {
    const isAr = cl === "ar";
    if (pct < 20) {
      return isAr
        ? "🍿 تحضير الفشار الكرتوني السحري..."
        : "🍿 Preparing magical cartoon popcorn...";
    } else if (pct < 40) {
      return isAr
        ? "🎒 تعبئة الحقائب بكل الحلقات الرائعة..."
        : "🎒 Packing the episode backpack for the adventure...";
    } else if (pct < 65) {
      return isAr
        ? "💫 رسم كل اللقطات المضحكة والممتعة بالداخل..."
        : "💫 Drawing all the funny moments and keyframes...";
    } else if (pct < 85) {
      return isAr
        ? "🚀 شحن بطارية حزمة المشاهدة بدون إنترنت..."
        : "🚀 Powering up the offline viewing rocket motor...";
    } else {
      return isAr
        ? "🦄 نضع الألوان البراقة الأخيرة على الحلقات..."
        : "🦄 Adding final sparkly colors to your awesome journey...";
    }
  };

  const getCosmicMoodText = (stars: number, language: string): string => {
    const moods: Record<string, string[]> = {
      ar: [
        "ضعيف جداً 😟",
        "مقبول 😐",
        "ممتع! 🙂",
        "رائع جداً! 🤩",
        "خارق للعادة! 🚀",
      ],
      en: [
        "Quiet Space 😟",
        "Nice 😐",
        "Fun! 🙂",
        "Awesome! 🤩",
        "Out of this world! 🚀",
      ],
      fr: [
        "Plutôt calme 😟",
        "Sympa 😐",
        "Amusant ! 🙂",
        "Génial ! 🤩",
        "Extraordinaire ! 🚀",
      ],
      de: [
        "Ziemlich ruhig 😟",
        "Nett 😐",
        "Lustig! 🙂",
        "Großartig! 🤩",
        "Nicht von dieser Welt! 🚀",
      ],
      es: [
        "Bastante tranquilo 😟",
        "Agradable 😐",
        "¡Divertido! 🙂",
        "¡Espectacular! 🤩",
        "¡Fuera de este mundo! 🚀",
      ],
      it: [
        "Abbastanza calmo 😟",
        "Simpatico 😐",
        "Divertente! 🙂",
        "Fantastico! 🤩",
        "Fuori dal mondo! 🚀",
      ],
    };
    const list = moods[language] || moods.en;
    return list[stars - 1] || "";
  };

  const handleBatchDownloadSeasonAnimation = () => {
    if (seriesDownloadState === "loading") return;
    setSeriesDownloadState("loading");
    setSeriesDownloadProgress(0);
    setCurrentDownloadEpisodeIndex(0);

    let currentPct = 0;
    const totalEpisodes = episodes.length || 1;
    const interval = setInterval(() => {
      currentPct += 2;
      if (currentPct >= 100) {
        currentPct = 100;
        setSeriesDownloadProgress(100);
        setSeriesDownloadState("done");
        clearInterval(interval);

        if (currentProfile && activeVideo) {
          const dlLog = {
            id: "log_" + Date.now(),
            type: "video",
            severity: "info",
            message: `${currentProfile.name} completely batch-saved ${episodes.length} episodes of '${activeVideo?.title.en}' for offline play.`,
            timestamp: new Date().toISOString(),
          };
          setLogs((prev) => [dlLog, ...prev]);

          fetch("/api/logs/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "video",
              severity: "info",
              message: `${currentProfile.name} completely batch-saved ${episodes.length} episodes for '${activeVideo?.title.en || "Selected Content"}' offline play.`,
            }),
          }).catch((err) =>
            console.error(
              "Could not write download action to security log db",
              err,
            ),
          );

          // Save batch
          const saveAllEpisodes = async () => {
            let updatedProfile = currentProfile;
            for (const ep of episodes) {
              try {
                const res = await fetch("/api/profiles/download", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    profileId: currentProfile.id,
                    videoId: activeVideo.id,
                    episodeId: ep.id,
                    title: `${activeVideo.title[lang] || activeVideo.title.en} - ${ep.title[lang] || ep.title.en}`,
                    poster: activeVideo.poster,
                    type: activeVideo.type,
                    sizeMb: 45,
                  }),
                });
                const data = await res.json();
                if (data.success) {
                  updatedProfile = data.profile;
                }
              } catch (err) {
                console.error("Ep download save error", err);
              }
            }
            setCurrentProfile(updatedProfile);
            setProfiles((prev) =>
              prev.map((p) =>
                p.id === updatedProfile.id ? updatedProfile : p,
              ),
            );
          };
          saveAllEpisodes();
        }
      } else {
        setSeriesDownloadProgress(currentPct);
        const epIndex = Math.floor((currentPct / 100) * totalEpisodes);
        setCurrentDownloadEpisodeIndex(Math.min(epIndex, totalEpisodes - 1));
      }
    }, 100);
  };

  // Simulate timeline click progress
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.round((x / rect.width) * 100);
    setVideoProgress(percentage);
    setIsPlaying(true);
    if (videoRef.current && videoRef.current.duration) {
      const targetTime = (percentage / 100) * videoRef.current.duration;
      videoRef.current.currentTime = targetTime;
      if (watchPartyId) {
        sendWsMessage({
          type: "seek",
          currentTime: targetTime,
        });
      }
    }
  };

  const handlePlayPauseToggle = () => {
    const nextPlay = !isPlaying;
    setIsPlaying(nextPlay);
    if (videoRef.current) {
      if (nextPlay) {
        videoRef.current.play().catch((e) => console.log("Play failed", e));
        if (watchPartyId) {
          sendWsMessage({
            type: "play",
            currentTime: videoRef.current.currentTime || 0,
          });
        }
      } else {
        videoRef.current.pause();
        if (watchPartyId) {
          sendWsMessage({
            type: "pause",
            currentTime: videoRef.current.currentTime || 0,
          });
        }
      }
    }
  };

  const handleSkipIntro = () => {
    if (videoRef.current && videoRef.current.duration) {
      // Skipped intro should fast forward to 30 seconds, or first 20% of the video duration whichever is shorter.
      const targetTime = Math.min(30, videoRef.current.duration * 0.2);
      videoRef.current.currentTime = targetTime;
      setPlayerCurrentTime(targetTime);
      const pct = (targetTime / videoRef.current.duration) * 100;
      setVideoProgress(pct);
      setShowSkipIntroToast(true);
      setTimeout(() => setShowSkipIntroToast(false), 2000);

      if (watchPartyId) {
        sendWsMessage({
          type: "seek",
          currentTime: targetTime,
        });
      }
    }
  };

  const handlePlayNextEpisode = () => {
    if (playbackQueue.length > 0) {
      const nextEp = playbackQueue[0];
      setPlaybackQueue((prev) => prev.slice(1));
      setCurrentEpisode(nextEp);
      setIsPlaying(true);
      setVideoProgress(0);
      setPlayerCurrentTime(0);
      setAutoplayCancelled(false);
      showSwipeMessage(
        lang === "ar"
          ? "تشغيل الحلقة من قائمة الانتظار 🎬"
          : "Playing next from Queue! 🎬",
      );
    } else if (nextEpisode) {
      setCurrentEpisode(nextEpisode);
      setIsPlaying(true);
      setVideoProgress(0);
      setPlayerCurrentTime(0);
      setAutoplayCancelled(false);
    }
  };

  useEffect(() => {
    if (currentEpisode && currentProfile && videoProgress > 0) {
      setEpisodeProgressMap((prev) => {
        const next = {
          ...prev,
          [`${currentProfile.id}_${currentEpisode.id}`]: videoProgress,
        };
        localStorage.setItem("watchPartyEpisodeProgress", JSON.stringify(next));
        return next;
      });
    }
  }, [videoProgress, currentEpisode, currentProfile]);

  // Dynamic Parent Portal filters helper
  const isBlockedByParentFilters = (v: VideoContent): boolean => {
    if (!dbSettings) return false;

    // 1. Theme-based filtering
    const blockedThemes: string[] = dbSettings.blockedThemes || [];

    if (blockedThemes.includes("no-slapstick")) {
      const isFunny =
        (v.tags || []).some(
          (t) =>
            t.toLowerCase().includes("funny") ||
            t.toLowerCase().includes("slapstick"),
        ) || (v.genres || []).some((g) => g.toLowerCase().includes("comedy"));
      if (isFunny) return true;
    }

    if (blockedThemes.includes("no-scary")) {
      const isScary =
        (v.tags || []).some(
          (t) =>
            t.toLowerCase().includes("scary") ||
            t.toLowerCase().includes("ghost") ||
            t.toLowerCase().includes("monster"),
        ) ||
        (v.genres || []).some(
          (g) =>
            g.toLowerCase().includes("scary") ||
            g.toLowerCase().includes("horror"),
        );
      const desc = (
        (v.description[lang] || "") +
        " " +
        (v.description.en || "")
      ).toLowerCase();
      const title = (
        (v.title[lang] || "") +
        " " +
        (v.title.en || "")
      ).toLowerCase();
      if (
        isScary ||
        desc.includes("scary") ||
        desc.includes("ghost") ||
        desc.includes("monster") ||
        title.includes("scary") ||
        title.includes("ghost") ||
        title.includes("monster")
      ) {
        return true;
      }
    }

    if (blockedThemes.includes("no-action")) {
      const isAction =
        (v.tags || []).some(
          (t) =>
            t.toLowerCase().includes("action") ||
            t.toLowerCase().includes("ninja") ||
            t.toLowerCase().includes("martial arts"),
        ) || (v.genres || []).some((g) => g.toLowerCase().includes("action"));
      if (isAction) return true;
    }

    if (blockedThemes.includes("no-gadgets")) {
      const isGadget =
        (v.tags || []).some(
          (t) =>
            t.toLowerCase().includes("gadget") ||
            t.toLowerCase().includes("doraemon"),
        ) || (v.genres || []).some((g) => g.toLowerCase().includes("gadget"));
      if (isGadget) return true;
    }

    // 2. Custom keywords filter (any word parents typed to block)
    const customKeywords: string[] = dbSettings.customBlockedKeywords || [];
    if (customKeywords.length > 0) {
      const titleText = (
        (v.title[lang] || "") +
        " " +
        (v.title.en || "")
      ).toLowerCase();
      const descText = (
        (v.description[lang] || "") +
        " " +
        (v.description.en || "")
      ).toLowerCase();
      const tagsText = (v.tags || []).join(" ").toLowerCase();
      const genresText = (v.genres || []).join(" ").toLowerCase();

      const matchesCustom = customKeywords.some((keyword: string) => {
        const kw = keyword.toLowerCase().trim();
        if (!kw) return false;
        return (
          titleText.includes(kw) ||
          descText.includes(kw) ||
          tagsText.includes(kw) ||
          genresText.includes(kw)
        );
      });

      if (matchesCustom) return true;
    }

    return false;
  };

  // Filter calculations (memoized to maximize rendering performance across player updates)
  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      // Parent Portal content filters
      if (isBlockedByParentFilters(v)) return false;

      // Top-level Category Filter
      if (activeTab === "movies" && v.type !== "movie") return false;
      if (activeTab === "series" && v.type !== "series") return false;
      if (activeTab === "anime" && v.type !== "anime") return false;
      if (activeTab === "educational" && v.type !== "educational") return false;
      if (activeTab === "favorites" && !favorites.includes(v.id)) return false;

      // Age Filter
      if (ageFilter !== "all") {
        if (v.ageCategory !== ageFilter) return false;
      }

      // Genre Filter
      if (selectedGenre !== "all") {
        if (!(v.genres || []).includes(selectedGenre)) return false;
      }

      // Search input match
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const titleMatch =
          (v.title[lang] || "").toLowerCase().includes(q) ||
          (v.title.en || "").toLowerCase().includes(q);
        const descMatch =
          (v.description[lang] || "").toLowerCase().includes(q) ||
          (v.description.en || "").toLowerCase().includes(q);
        const genreMatch = (v.genres || []).some((g) =>
          g.toLowerCase().includes(q),
        );
        const tagMatch = (v.tags || []).some((t) => t.toLowerCase().includes(q));
        return titleMatch || descMatch || genreMatch || tagMatch;
      }

      return true;
    });
  }, [videos, dbSettings, lang, activeTab, favorites, ageFilter, selectedGenre, searchQuery]);

  // Get recommendations based on the last 5 viewed items (memoized recommendation engine)
  const smartRecommendations = useMemo((): {
    video: VideoContent;
    originalWatched: VideoContent;
  }[] => {
    if (
      !currentProfile ||
      !currentProfile.watchHistory ||
      currentProfile.watchHistory.length === 0
    ) {
      return [];
    }

    const last5Ids = currentProfile.watchHistory.slice(0, 5);
    const watchedList = last5Ids
      .map((id) => videos.find((v) => v.id === id))
      .filter((v): v is VideoContent => !!v);

    if (watchedList.length === 0) return [];

    // All available videos excluding the ones already in the last 5 viewed items to avoid giving what they recently saw!
    const candidates = videos.filter(
      (v) => !last5Ids.includes(v.id) && !isBlockedByParentFilters(v),
    );

    // Calculate score for each candidate relative to each watched video
    const scored = candidates.map((v) => {
      let maxScore = -1;
      let coreWv: VideoContent | null = null;

      watchedList.forEach((wv) => {
        let currentScore = 0;
        // Same type matches
        if (v.type === wv.type) currentScore += 3;

        // Matching genres
        const commonGenres = (v.genres || []).filter((g) =>
          (wv.genres || []).includes(g),
        );
        currentScore += commonGenres.length * 2.5;

        // Matching tags
        const commonTags = (v.tags || []).filter((t) =>
          (wv.tags || []).includes(t),
        );
        currentScore += commonTags.length * 1.5;

        // Age category compatibility
        if (v.ageCategory === wv.ageCategory) currentScore += 1;

        if (currentScore > maxScore) {
          maxScore = currentScore;
          coreWv = wv;
        }
      });

      return {
        video: v,
        score: maxScore,
        originalWatched: coreWv,
      };
    });

    // Filter out scores that are zero (meaning no match) and sort by score descending
    return scored
      .filter((item) => item.score > 0 && item.originalWatched !== null)
      .sort((a, b) => b.score - a.score) as {
      video: VideoContent;
      originalWatched: VideoContent;
    }[];
  }, [currentProfile, videos, dbSettings, lang]);

  const getCalculatedStreamUrl = () => {
    if (!currentEpisode) return "";

    // Extract ID configuration dynamically to support IMDb, TMDB, Jikan, TVmaze, etc.
    let searchId: string | number | undefined = undefined;
    let searchType: "tv" | "movie" = "movie";
    let isImdb = false;

    if (resolvedTmdbInfo) {
      searchId = resolvedTmdbInfo.tmdbId;
      searchType = resolvedTmdbInfo.resolvedType as any;
      isImdb = false;
    } else if (activeVideo) {
      if (activeVideo.imdbId) {
        searchId = activeVideo.imdbId;
        searchType =
          activeVideo.type === "series" || activeVideo.type === "anime"
            ? "tv"
            : "movie";
        isImdb = true;
      } else if (activeVideo.id.startsWith("imdb_")) {
        searchId = activeVideo.id.replace("imdb_tv_", "").replace("imdb_", "");
        searchType =
          activeVideo.type === "series" || activeVideo.type === "anime"
            ? "tv"
            : "movie";
        isImdb = true;
      } else if (activeVideo.id.startsWith("tmdb_tv_")) {
        searchId = parseInt(activeVideo.id.replace("tmdb_tv_", ""));
        searchType = "tv";
        isImdb = false;
      } else if (activeVideo.id.startsWith("tmdb_")) {
        searchId = parseInt(activeVideo.id.replace("tmdb_", ""));
        searchType = "movie";
        isImdb = false;
      }
    }

    if (searchId) {
      const isTV = searchType === "tv";
      const season = currentEpisode.seasonId
        ? parseInt(currentEpisode.seasonId) || 1
        : 1;
      const episodeNum = currentEpisode.episodeNumber || 1;

      // Map servers to complete functional mirrors
      if (activeProviderId === "vidsrc-xyz") {
        if (isImdb) {
          return isTV
            ? `https://vidsrc.xyz/embed/tv?imdb=${searchId}&season=${season}&episode=${episodeNum}`
            : `https://vidsrc.xyz/embed/movie?imdb=${searchId}`;
        } else {
          return isTV
            ? `https://vidsrc.xyz/embed/tv?tmdb=${searchId}&season=${season}&episode=${episodeNum}`
            : `https://vidsrc.xyz/embed/movie?tmdb=${searchId}`;
        }
      } else if (activeProviderId === "vidsrc-cc") {
        return isTV
          ? `https://vidsrc.cc/embed/tv/${searchId}/${season}/${episodeNum}`
          : `https://vidsrc.cc/embed/movie/${searchId}`;
      } else if (activeProviderId === "vidsrc-in") {
        return isTV
          ? `https://vidsrc.in/embed/tv/${searchId}/${season}/${episodeNum}`
          : `https://vidsrc.in/embed/movie/${searchId}`;
      } else if (activeProviderId === "vidsrc-pm") {
        return isTV
          ? `https://vidsrc.pm/embed/tv/${searchId}/${season}/${episodeNum}`
          : `https://vidsrc.pm/embed/movie/${searchId}`;
      } else if (activeProviderId === "vidbox-ultra") {
        return isTV
          ? `https://vidsrc.to/embed/tv/${searchId}/${season}/${episodeNum}`
          : `https://vidsrc.to/embed/movie/${searchId}`;
      } else if (activeProviderId === "hls-cyber") {
        return isTV
          ? `https://embed.su/embed/tv/${searchId}/${season}/${episodeNum}`
          : `https://embed.su/embed/movie/${searchId}`;
      } else if (activeProviderId === "super-fast") {
        return isTV
          ? `https://2embed.cc/embed/tv/${searchId}/${season}/${episodeNum}`
          : `https://2embed.cc/embed/${searchId}`;
      } else if (activeProviderId === "vidsrc-pro") {
        return isTV
          ? `https://vidsrc.pro/embed/tv/${searchId}/${season}/${episodeNum}`
          : `https://vidsrc.pro/embed/movie/${searchId}`;
      } else if (activeProviderId === "autoembed-co") {
        if (isImdb) {
          return isTV
            ? `https://autoembed.co/tv/imdb/${searchId}-${season}-${episodeNum}`
            : `https://autoembed.co/movie/imdb/${searchId}`;
        } else {
          return isTV
            ? `https://autoembed.co/tv/tmdb/${searchId}-${season}-${episodeNum}`
            : `https://autoembed.co/movie/tmdb/${searchId}`;
        }
      } else if (activeProviderId === "vidsrc-embed") {
        if (isImdb) {
          return isTV
            ? `https://vidsrc.xyz/embed/tv?imdb=${searchId}&season=${season}&episode=${episodeNum}`
            : `https://vidsrc.xyz/embed/movie?imdb=${searchId}`;
        } else {
          return isTV
            ? `https://vidsrc.xyz/embed/tv?tmdb=${searchId}&season=${season}&episode=${episodeNum}`
            : `https://vidsrc.xyz/embed/movie?tmdb=${searchId}`;
        }
      }
    }

    // Default to the original episode's videoUrl
    return currentEpisode.videoUrl || "";
  };

  return (
    <div
      className="min-h-screen islamic-kids-bg text-white flex flex-col font-sans antialiased overflow-x-hidden relative"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Playful Happy Background Stars */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-12 left-10 w-2 h-2 bg-amber-300 rounded-full animate-star-twinkle" />
        <div className="absolute top-24 left-1/3 w-3 h-3 bg-yellow-200 rounded-full animate-star-twinkle" style={{ animationDelay: "1s" }} />
        <div className="absolute top-48 right-12 w-2 h-2 bg-amber-400 rounded-full animate-star-twinkle" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/3 left-20 w-3 h-3 bg-yellow-300 rounded-full animate-star-twinkle" style={{ animationDelay: "0.5s" }} />
        <div className="absolute top-1/2 right-24 w-2 h-2 bg-amber-200 rounded-full animate-star-twinkle" style={{ animationDelay: "1.5s" }} />
        <div className="absolute bottom-24 left-12 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-star-twinkle" style={{ animationDelay: "2.5s" }} />
        <div className="absolute bottom-12 right-1/3 w-2 h-2 bg-amber-300 rounded-full animate-star-twinkle" style={{ animationDelay: "0.8s" }} />
      </div>

      {/* --- CUTE PLAYFUL ISLAMIC DECORATIONS --- */}
      {/* 1. Left Hanging Lantern (Fanous) */}
      <div className="absolute top-0 left-6 z-10 w-12 pointer-events-none hidden md:flex flex-col items-center animate-fanous-swing">
        <div className="w-[2px] h-20 bg-amber-400/60" />
        {/* Lantern body */}
        <div className="w-10 h-14 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 rounded-b-xl rounded-t-3xl relative shadow-[0_0_15px_rgba(245,158,11,0.6)] flex items-center justify-center border border-amber-500/50">
          {/* Inner candle glow */}
          <div className="w-4 h-6 bg-red-400 rounded-full animate-pulse blur-[1px] absolute top-4 shadow-[0_0_8px_#EF4444]" />
          {/* Dome top arch */}
          <div className="w-5 h-2 bg-amber-600 rounded-full absolute -top-1" />
          {/* Hanging ring */}
          <div className="w-3 h-3 rounded-full border border-amber-600 absolute -top-3" />
          {/* Pattern window */}
          <div className="w-1.5 h-6 bg-emerald-900/40 rounded-full absolute left-2" />
          <div className="w-1.5 h-6 bg-emerald-900/40 rounded-full absolute right-2" />
        </div>
        {/* Little hanging tassel */}
        <div className="w-1 h-3 bg-red-500 rounded-full" />
      </div>

      {/* 2. Right Hanging Lantern (Fanous) */}
      <div className="absolute top-0 right-10 z-10 w-12 pointer-events-none hidden md:flex flex-col items-center animate-fanous-swing" style={{ animationDelay: "1s" }}>
        <div className="w-[2px] h-28 bg-amber-400/60" />
        <div className="w-8 h-12 bg-gradient-to-b from-teal-300 via-teal-400 to-teal-500 rounded-b-xl rounded-t-3xl relative shadow-[0_0_15px_rgba(20,184,166,0.6)] flex items-center justify-center border border-teal-500/50">
          <div className="w-3 h-5 bg-amber-200 rounded-full animate-pulse blur-[1px] absolute top-3 shadow-[0_0_8px_#F59E0B]" />
          <div className="w-4 h-1.5 bg-teal-600 rounded-full absolute -top-1" />
          <div className="w-2.5 h-2.5 rounded-full border border-teal-600 absolute -top-2.5" />
        </div>
        <div className="w-1 h-2 bg-amber-500 rounded-full" />
      </div>

      {/* 3. Smiling Crescent Moon with Sleepy/Happy Eyes */}
      <div className="absolute top-8 right-24 z-0 pointer-events-none select-none hidden lg:block animate-cloud-float">
        <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">
          <path d="M30 15C45 15 75 25 75 60C75 80 55 90 35 90C60 90 85 75 85 50C85 25 55 15 30 15Z" fill="url(#moon-grad)" />
          {/* Sleepy eye */}
          <path d="M54 44C56 46 59 46 61 44" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
          {/* Smiley rosy cheek */}
          <circle cx="65" cy="52" r="4" fill="#F87171" opacity="0.8" />
          {/* Smiling mouth */}
          <path d="M57 52C59 55 61 55 63 52" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
          <defs>
            <linearGradient id="moon-grad" x1="30" y1="15" x2="85" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="50%" stopColor="#FDE68A" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 4. Playful Happy Little Clouds & Stars scattered around */}
      <div className="absolute top-20 left-1/4 z-0 pointer-events-none opacity-40 animate-cloud-float hidden xl:block" style={{ animationDelay: "1.5s" }}>
        <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/5 flex items-center gap-1.5 shadow-md">
          <span className="text-amber-300 text-xs">✨</span>
          <span className="text-[10px] font-bold text-teal-100">بِسْمِ اللَّهِ</span>
          <span className="text-amber-300 text-xs">⭐</span>
        </div>
      </div>

      <div className="absolute bottom-20 right-1/3 z-0 pointer-events-none opacity-40 animate-cloud-float hidden xl:block" style={{ animationDelay: "3s" }}>
        <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/5 flex items-center gap-1.5 shadow-md">
          <span className="text-amber-300 text-xs">🌙</span>
          <span className="text-[10px] font-bold text-teal-100">Alhamdulillah!</span>
          <span className="text-amber-300 text-xs">✨</span>
        </div>
      </div>

      {/* Top Professional Marquee Notification / Active Banner Ads */}
      {ads
        .filter((ad) => ad.isActive && ad.type === "banner")
        .map((ad) => (
          <div
            key={ad.id}
            className="w-full bg-gradient-to-r from-purple-900/90 via-[#0F0F15] to-cyan-950/90 border-b border-purple-500/30 text-center py-2 px-4 flex items-center justify-center gap-3 text-xs font-semibold z-40 relative"
          >
            <span className="bg-[#FF0080] text-white font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-widest">
              AD SPONSOR
            </span>
            <span className="text-pink-100">{ad.title}</span>
            <a
              href={ad.targetUrl}
              className="underline text-cyan-400 hover:text-cyan-300 transition-colors ml-4"
            >
              {t("subscribeNow")} →
            </a>
            <button
              className="text-white/40 hover:text-white ml-auto text-[9px]"
              onClick={() => handleToggleAd(ad.id)}
            >
              ×
            </button>
          </div>
        ))}

      {/* Outer wrapper holding sidebar and main screen */}
      <div className="flex flex-1 relative z-10">
        {/* SIDE BAR NAVIGATION - Sophisticated styling */}
        <aside className="w-24 md:w-28 flex-shrink-0 bg-[#0F0F15]/95 border-r border-white/5 flex flex-col items-center py-6 gap-8 z-30 select-none backdrop-blur-md">
          {/* Logo Brand Icon with modern gradients from the theme HTML */}
          <div
            onClick={() => {
              setActiveTab("home");
            }}
            className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-tr from-amber-400 via-emerald-400 to-emerald-600 rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-emerald-500/30 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 border border-amber-300/40 relative overflow-hidden"
            title={t("brandName")}
          >
            <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center relative shadow-inner">
              <span className="text-xl animate-bounce" style={{ animationDuration: '2.5s' }}>🌙</span>
              <span className="text-[9px] absolute -top-1 -right-1 animate-pulse">⭐</span>
            </div>
          </div>

          {/* Connected Children Profiles Selector Widget */}
          <div className="flex flex-col items-center gap-4 w-full px-2">
            <span className="text-[9px] text-white/30 uppercase font-bold tracking-wider">
              {t("switchProfile")}
            </span>
            <div className="flex flex-col gap-3 items-center w-full">
              {profiles.map((p) => {
                const isSelected = currentProfile?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProfile(p)}
                    className={`relative w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br ${p.color} p-[2px] transition-transform duration-300 ${isSelected ? "scale-110 shadow-lg shadow-cyan-400/30 ring-2 ring-[#00F2FF]" : "hover:scale-105 opacity-60 hover:opacity-100"}`}
                    title={p.name}
                  >
                    <div className="w-full h-full bg-[#12121e] rounded-2xl flex items-center justify-center overflow-hidden">
                      {p.customAvatar ? (
                        <CustomAvatarRenderer
                          config={p.customAvatar}
                          className="w-8 h-8 md:w-10 md:h-10"
                        />
                      ) : (
                        <span className="text-lg md:text-xl">{p.avatar}</span>
                      )}
                    </div>
                    {isSelected && (
                      <span className="absolute -bottom-1 right-0 bg-cyan-400 text-black text-[8px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Language Toggle - Dynamic translated UI */}
          <div className="flex flex-col items-center gap-2 mt-2">
            <Globe className="w-4 h-4 text-white/30" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as SupportedLanguage)}
              className="bg-white/5 border border-white/10 text-white text-[11px] py-1 px-1 rounded-md outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer"
            >
              <option value="ar" className="bg-[#0F0F15]">
                العربية
              </option>
              <option value="en" className="bg-[#0F0F15]">
                English
              </option>
              <option value="fr" className="bg-[#0F0F15]">
                Français
              </option>
              <option value="de" className="bg-[#0F0F15]">
                Deutsch
              </option>
              <option value="es" className="bg-[#0F0F15]">
                Español
              </option>
              <option value="it" className="bg-[#0F0F15]">
                Italiano
              </option>
            </select>
          </div>

          {/* Parental Area Lock Key */}
          <div className="mt-auto pt-4 border-t border-white/5 flex flex-col items-center gap-2 w-full px-2">
            <button
              onClick={handleParentTabClick}
              className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all text-xs font-bold ${
                activeTab === "parent-portal"
                  ? "bg-gradient-to-br from-red-500 to-amber-500 text-white shadow-md shadow-red-500/20"
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
              }`}
              title={t("parentsMode")}
            >
              <Shield className="w-4 h-4 text-amber-400" />
              <span className="text-[8px] font-black tracking-tighter uppercase">
                PORTAL
              </span>
            </button>
          </div>
        </aside>

        {/* MAIN VIEW CONTROLLER */}
        <main className="flex-1 flex flex-col min-w-0 transition-all duration-300">
          {/* HEADER BAR - Glow & Advanced search, voice matching the design */}
          <header className="flex flex-col lg:flex-row lg:h-20 border-b border-white/5 py-4 px-4 lg:py-0 lg:px-10 z-20 bg-[#050508]/80 backdrop-blur-md relative gap-4 lg:gap-0 justify-between w-full overflow-hidden">
            <div className="flex w-full lg:w-auto items-center overflow-x-auto scrollbar-hide pb-2 lg:pb-0">
              <nav className="flex gap-4 md:gap-7 text-[11px] md:text-sm font-bold tracking-wider uppercase text-white/60 whitespace-nowrap px-1">
                <button
                  onClick={() => {
                    setActiveTab("home");
                  }}
                  className={`pb-1 transition-all ${activeTab === "home" ? "text-white border-b-2 border-[#00F2FF]" : "hover:text-white"}`}
                >
                  {t("home")}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("movies");
                  }}
                  className={`pb-1 transition-all ${activeTab === "movies" ? "text-white border-b-2 border-[#00F2FF]" : "hover:text-white"}`}
                >
                  {t("movies")}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("series");
                  }}
                  className={`pb-1 transition-all ${activeTab === "series" ? "text-white border-b-2 border-[#00F2FF]" : "hover:text-white"}`}
                >
                  {t("series")}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("anime");
                  }}
                  className={`pb-1 transition-all ${activeTab === "anime" ? "text-white border-b-2 border-[#00F2FF]" : "hover:text-white"}`}
                >
                  {t("anime")}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("educational");
                  }}
                  className={`pb-1 transition-all ${activeTab === "educational" ? "text-white border-b-2 border-[#00F2FF]" : "hover:text-white"}`}
                >
                  {t("educational")}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("favorites");
                  }}
                  className={`pb-1 transition-all ${activeTab === "favorites" ? "text-white border-b-2 border-red-500" : "hover:text-white text-rose-300"}`}
                >
                  {t("myFavorites")}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("downloads");
                  }}
                  className={`pb-1 transition-all ${activeTab === "downloads" ? "text-white border-b-2 border-pink-500" : "hover:text-pink-400/80 text-pink-300"}`}
                >
                  {lang === "ar" ? "التنزيلات ⬇️" : "Downloads ⬇️"}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("open-resources");
                  }}
                  className={`pb-1 transition-all ${activeTab === "open-resources" ? "text-white border-b-2 border-emerald-450 font-extrabold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-lg" : "hover:text-emerald-300 text-emerald-400/80"}`}
                >
                  {lang === "ar" ? "البث المفتوح 🌐" : "Open Resources 🌐"}
                </button>
              </nav>
            </div>

            {/* Smart search input & AI Companion Launcher */}
            <div className="flex items-center gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-1 w-full lg:w-auto justify-between lg:justify-end shrink-0">
              <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2 text-xs text-white/80 shrink-0 w-36 md:w-64 focus-within:ring-2 focus-within:ring-cyan-400 transition-all">
                <Search className="w-3.5 h-3.5 text-white/40" />
                <input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-white placeholder-white/30 outline-none w-full text-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-white/40 hover:text-white text-[10px]"
                  >
                    &times;
                  </button>
                )}
              </div>

              {/* Voice Navigation Speech Recognition trigger button with pulsing visual */}
              <button
                type="button"
                onClick={toggleVoiceNavigation}
                disabled={!speechSupported}
                className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border shrink-0 ${
                  isVoiceActive
                    ? "bg-red-500/10 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] text-red-400"
                    : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                }`}
                title={
                  speechSupported
                    ? "Voice Navigation Controls 🎙️"
                    : "Speech Recognition not supported 🔇"
                }
                id="voice-mic-trigger"
              >
                {isVoiceActive ? (
                  <>
                    <Mic className="w-3.5 h-3.5 animate-pulse" />
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                  </>
                ) : (
                  <Mic
                    className={`w-3.5 h-3.5 ${speechSupported ? "text-cyan-400" : "text-white/20"}`}
                  />
                )}
              </button>

              {/* Bot Sajid the Happy Star Action Sparkler */}
              <button
                onClick={() => setShowAiModal(true)}
                className="bg-gradient-to-r from-amber-400 to-emerald-500 text-emerald-950 text-[11px] font-black px-3.5 py-1.5 rounded-full hover:shadow-lg hover:shadow-amber-400/20 active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-100" />
                <span className="hidden sm:inline-block">
                  {t("aiSearchBtn")}
                </span>
              </button>

              {/* Active Profile Pill */}
              {currentProfile && (
                <div className="flex items-center gap-2 pl-2 border-l border-white/10 shrink-0">
                  <span className="hidden lg:inline text-xs font-black tracking-widest text-[#00F2FF]">
                    {currentProfile.name.toUpperCase()}
                  </span>
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-br ${currentProfile.color} flex items-center justify-center overflow-hidden border border-white/20 shrink-0`}
                  >
                    {currentProfile.customAvatar ? (
                      <CustomAvatarRenderer
                        config={currentProfile.customAvatar}
                        className="w-7 h-7"
                      />
                    ) : (
                      <span className="font-bold text-lg text-white">
                        {currentProfile.avatar}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* PAGE CONTENT SWITCHER */}
          <div className="flex-1 overflow-y-auto px-4 md:px-10 py-6 z-10 flex flex-col gap-8">
            {/* 1. HOME & CATEGORY CHANNELS VIEW */}
            {activeTab !== "parent-portal" &&
              activeTab !== "subscriptions" &&
              activeTab !== "downloads" &&
              activeTab !== "open-resources" && (
                <>
                  {/* HERO BANNER SLIDER (Sophisticated design background with "Cosmic Buddies" feeling based on user active pick) */}
                  {activeVideo && (
                    <div className="relative min-h-[360px] md:h-[400px] rounded-[40px] overflow-hidden border border-white/10 shadow-2xl flex flex-col justify-end p-6 md:p-12">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-all duration-700 opacity-60 bg-blend-multiply"
                        style={{
                          backgroundImage: `linear-gradient(90deg, #050508 40%, rgba(5, 5, 8, 0.4) 100%), url(${activeVideo.banner})`,
                        }}
                      />

                      {/* Floating top indicators */}
                      <div className="absolute top-6 left-6 md:top-8 md:left-12 flex gap-2">
                        <span className="bg-[#00F2FF]/20 text-[#00F2FF] text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-[#00F2FF]/30">
                          {activeVideo.type.toUpperCase()}
                        </span>
                        <span className="bg-purple-500/20 text-purple-300 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-purple-500/30">
                          {t("allAges")} • {activeVideo.ageCategory}
                        </span>
                        <span className="bg-amber-400/20 text-amber-300 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-amber-400/30">
                          ⭐ {activeVideo.rating}
                        </span>
                      </div>

                      <div className="relative max-w-2xl flex flex-col gap-4">
                        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter leading-none uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-white">
                          {activeVideo.title[lang] || activeVideo.title.en}
                        </h1>
                        <p className="text-white/70 text-sm leading-relaxed max-w-lg">
                          {activeVideo.description[lang] ||
                            activeVideo.description.en}
                        </p>

                        {/* Video Player Action controls inside hero */}
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                          <button
                            onClick={() => {
                              setIsPlaying(true);
                              // Scroll to player smooth
                              document
                                .getElementById("video-arena")
                                ?.scrollIntoView({ behavior: "smooth" });
                            }}
                            className="bg-white text-black px-8 py-3.5 rounded-2xl font-black flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/10"
                          >
                            <Play className="w-4 h-4 fill-current text-black" />
                            <span>{t("playNow")}</span>
                          </button>

                          <button
                            onClick={() => handleToggleFavorite(activeVideo.id)}
                            className={`px-5 py-3.5 rounded-2xl font-bold border flex items-center gap-2 transition-all ${
                              favorites.includes(activeVideo.id)
                                ? "bg-rose-600/20 text-rose-300 border-rose-500/40"
                                : "bg-white/10 text-white border-white/10 hover:bg-white/20"
                            }`}
                          >
                            <Heart
                              className={`w-4 h-4 ${favorites.includes(activeVideo.id) ? "fill-current text-rose-400" : ""}`}
                            />
                            <span>
                              {favorites.includes(activeVideo.id)
                                ? t("favourite")
                                : "+ My List"}
                            </span>
                          </button>

                          <span className="text-xs text-white/40">
                            {activeVideo.views.toLocaleString()}{" "}
                            {t("viewsCount")} • {activeVideo.releaseYear}
                          </span>
                        </div>
                      </div>

                      {/* Banner slider indicators */}
                      <div className="absolute bottom-6 right-6 md:right-12 flex gap-2">
                        {videos.slice(0, 4).map((v, i) => (
                          <button
                            key={v.id}
                            onClick={() => setActiveVideo(v)}
                            className={`h-1.5 transition-all rounded-full ${activeVideo.id === v.id ? "w-8 bg-[#00F2FF]" : "w-2 bg-white/20"}`}
                            title={v.title.en}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AGE & GENRE FILTER RAILS FOR THE LITTLE AUDIENCE */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0F0F15]/60 p-4 rounded-3xl border border-white/5">
                    <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                      <span className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-1">
                        <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                        {t("ageFilterTitle")}
                      </span>
                      <button
                        onClick={() => setAgeFilter("all")}
                        className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${ageFilter === "all" ? "bg-[#00F2FF] text-black" : "bg-white/5 hover:bg-white/10 text-white/80"}`}
                      >
                        {t("allAges")}
                      </button>
                      <button
                        onClick={() => setAgeFilter("3-5")}
                        className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${ageFilter === "3-5" ? "bg-[#00F2FF] text-black shadow-md shadow-cyan-400/20" : "bg-white/5 hover:bg-white/10 text-white/80"}`}
                      >
                        {t("ages3_5")} 🧸 (3-5)
                      </button>
                      <button
                        onClick={() => setAgeFilter("6-8")}
                        className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${ageFilter === "6-8" ? "bg-[#00F2FF] text-black shadow-md shadow-cyan-400/20" : "bg-white/5 hover:bg-white/10 text-white/80"}`}
                      >
                        {t("ages6_8")} 🦄 (6-8)
                      </button>
                      <button
                        onClick={() => setAgeFilter("9-12")}
                        className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${ageFilter === "9-12" ? "bg-[#00F2FF] text-black shadow-md shadow-cyan-400/20" : "bg-white/5 hover:bg-white/10 text-white/80"}`}
                      >
                        {t("ages9_12")} 🐲 (9-12)
                      </button>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                      <span className="text-xs font-bold text-white/40 uppercase tracking-widest">
                        {t("genresTitle")}
                      </span>
                      {[
                        "all",
                        "adventure",
                        "learning",
                        "comedy",
                        "science",
                        "sports",
                        "art",
                      ].map((gen) => (
                        <button
                          key={gen}
                          onClick={() => setSelectedGenre(gen)}
                          className={`text-xs px-3 py-1 rounded-lg transition-all capitalize ${selectedGenre === gen ? "bg-[#FF0080]/30 text-pink-400 border border-pink-500/50" : "bg-white/5 hover:bg-white/10 text-white/60"}`}
                        >
                          {gen}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* THE MOVIE / ANIME ARENA & PLAYER INTEGRATION (Durable interactive UI) */}
                  <AnimatePresence>
                    {isTheaterMode && activeVideo && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsTheaterMode(false)}
                        className="fixed inset-0 bg-[#020205]/95 backdrop-blur-md z-[60] cursor-pointer"
                        title={
                          lang === "ar"
                            ? "انقر هنا لإغلاق نمط السينما"
                            : "Click to dismiss Theater Mode"
                        }
                      />
                    )}
                    {isAutoDimEnabled &&
                      isPlaying &&
                      activeVideo &&
                      !isTheaterMode && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.85 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.8, ease: "easeInOut" }}
                          className="fixed inset-0 bg-[#020205]/90 z-40 pointer-events-none"
                        />
                      )}
                  </AnimatePresence>

                  <AnimatePresence mode="wait">
                    {activeVideo && (
                      <motion.div
                        key={activeVideo.id}
                        id="video-arena"
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -30, scale: 0.95 }}
                        whileHover={
                          isGlowEnabled && !isScrolling && !isTheaterMode
                            ? { scale: 1.01 }
                            : { scale: 1 }
                        }
                        onMouseEnter={() => {
                          if (hoverTimerRef.current)
                            clearTimeout(hoverTimerRef.current);
                          hoverTimerRef.current = setTimeout(() => {
                            setShowArenaTooltip(true);
                          }, 500);
                        }}
                        onMouseLeave={() => {
                          if (hoverTimerRef.current)
                            clearTimeout(hoverTimerRef.current);
                          setShowArenaTooltip(false);
                        }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className={`grid grid-cols-1 ${isCinematicMode || isTheaterMode ? "lg:grid-cols-1" : "lg:grid-cols-3"} gap-8 p-6 md:p-8 rounded-[35px] border scroll-mt-24 transition-all duration-500 
                        ${
                          isTheaterMode
                            ? "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] md:w-[90vw] max-w-7xl h-auto max-h-[90vh] z-[65] bg-[#0A0A10]/95 border-cyan-500/30 shadow-[0_0_100px_rgba(0,0,0,0.95)] overflow-y-auto backdrop-blur-3xl"
                            : `bg-[#0F0F14]/65 backdrop-blur-xl border-white/10 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${isAutoDimEnabled && isPlaying ? "z-50 border-cyan-400/30 shadow-[0_0_60px_rgba(34,211,238,0.2)]" : ""}`
                        }
                        ${isGlowEnabled ? "glow-enabled hover:border-cyan-400/25 hover:shadow-[0_0_40px_rgba(34,211,238,0.12)]" : ""} ${isScrolling ? "scroll-paused" : ""}`}
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl" />

                        {/* Delayed hover tooltip showing current active video title */}
                        <AnimatePresence>
                          {showArenaTooltip && (
                            <motion.div
                              initial={{ opacity: 0, y: -10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.95 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                              className="absolute top-4 right-4 z-50 bg-[#07070A]/95 border border-cyan-400/40 text-cyan-300 font-bold px-4 py-2 rounded-2xl text-[11px] md:text-xs shadow-[0_12px_24px_rgba(0,0,0,0.8)] backdrop-blur-md pointer-events-none select-none flex items-center gap-2 max-w-xs md:max-w-md"
                            >
                              <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              <span className="truncate">
                                {lang === "ar"
                                  ? "العرض الحالي: "
                                  : "Now Arena: "}
                                {activeVideo.title[lang] ||
                                  activeVideo.title.en}
                              </span>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Interactive Simulated Streaming Player */}
                        <div
                          className={`${isCinematicMode || isTheaterMode ? "lg:col-span-1" : "lg:col-span-2"} flex flex-col gap-4`}
                        >
                          {/* --- WATCH PARTY HUD --- */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-cyan-950/20 via-purple-950/20 to-pink-950/20 p-4 rounded-3xl border border-white/5 shadow-inner">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/15">
                                <Users className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-2">
                                  {lang === "ar"
                                    ? "حفلة مشاهدة جماعية"
                                    : "Watch Party Hub"}
                                  {watchPartyId && (
                                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                                  )}
                                </h4>
                                <p className="text-[10px] text-white/50">
                                  {watchPartyId
                                    ? lang === "ar"
                                      ? `أنت تشاهد الآن بث مباشر مع أصدقائك! 🥳`
                                      : `Streaming synchronously with your friends! 🥳`
                                    : lang === "ar"
                                      ? "شاهد أحلا كرتون جماعياً وصوتياً مع رفقاتك في نفس اللحظة!"
                                      : "Watch your favorite cartoons synchronized real-time with friends!"}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {/* Glow Toggle Button */}
                              <button
                                onClick={() => setIsGlowEnabled(!isGlowEnabled)}
                                className={`px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${isGlowEnabled ? "bg-cyan-400/10 border-cyan-400/30 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.15)] hover:bg-cyan-400/20" : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white"}`}
                                title={
                                  isGlowEnabled
                                    ? "Disable Arena Glow Animation"
                                    : "Enable Arena Glow Animation"
                                }
                              >
                                <Sparkles
                                  className={`w-3.5 h-3.5 ${isGlowEnabled ? "animate-pulse text-cyan-400" : "text-white/40"}`}
                                />
                                <span>
                                  {lang === "ar"
                                    ? isGlowEnabled
                                      ? "إضاءة متحركة: تشغيل"
                                      : "إضاءة متحركة: إيقاف"
                                    : isGlowEnabled
                                      ? "Glow: On"
                                      : "Glow: Off"}
                                </span>
                              </button>

                              {/* Cinematic Toggle Button */}
                              <button
                                onClick={() => {
                                  setIsCinematicMode(!isCinematicMode);
                                  if (isTheaterMode) setIsTheaterMode(false);
                                }}
                                className={`px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${isCinematicMode ? "bg-[#FF0080]/15 border-[#FF0080]/30 text-pink-300 shadow-[0_0_12px_rgba(255,0,128,0.15)] hover:bg-[#FF0080]/25" : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white"}`}
                                title={
                                  isCinematicMode
                                    ? "Standard View Grid"
                                    : "Cinematic Mode (Full-Width)"
                                }
                              >
                                {isCinematicMode ? (
                                  <>
                                    <Minimize className="w-3.5 h-3.5 text-pink-400" />
                                    <span>
                                      {lang === "ar"
                                        ? "عرض سينمائي: تشغيل"
                                        : "Cinematic: On"}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Maximize className="w-3.5 h-3.5 text-white/50" />
                                    <span>
                                      {lang === "ar"
                                        ? "عرض سينمائي: إيقاف"
                                        : "Cinematic: Off"}
                                    </span>
                                  </>
                                )}
                              </button>

                              {/* Theater Mode Toggle Button */}
                              <button
                                onClick={() => {
                                  setIsTheaterMode(!isTheaterMode);
                                  if (isCinematicMode)
                                    setIsCinematicMode(false);
                                }}
                                className={`px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${isTheaterMode ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)] hover:bg-cyan-500/30" : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white"}`}
                                title={
                                  isTheaterMode
                                    ? "Standard View Mode"
                                    : "Theater Mode (Dark Backdrop & Centered)"
                                }
                              >
                                <Film
                                  className={`w-3.5 h-3.5 ${isTheaterMode ? "text-cyan-400 animate-pulse" : "text-white/50"}`}
                                />
                                <span>
                                  {lang === "ar"
                                    ? isTheaterMode
                                      ? "نمط المسرح: تشغيل"
                                      : "نمط المسرح: إيقاف"
                                    : isTheaterMode
                                      ? "Theater: On"
                                      : "Theater: Off"}
                                </span>
                              </button>

                              {/* If in a watch party */}
                              {watchPartyId ? (
                                <div className="flex flex-wrap items-center gap-2">
                                  {/* Room ID Badge */}
                                  <div className="px-3.5 py-1.5 rounded-xl bg-black/60 border border-cyan-500/30 text-xs font-extrabold text-[#00F2FF] font-mono tracking-wide flex items-center gap-1.5">
                                    <span className="text-[10px] text-white/40 font-sans uppercase font-black">
                                      {lang === "ar" ? "غرفة:" : "Room:"}
                                    </span>
                                    {watchPartyId}
                                  </div>

                                  {/* Copy Link */}
                                  <button
                                    onClick={() => {
                                      const link = `${window.location.origin}${window.location.pathname}?room=${watchPartyId}`;
                                      navigator.clipboard.writeText(link);
                                      const isAr = lang === "ar";
                                      setWatchPartyToast(
                                        isAr
                                          ? "📋 تم نسخ رابط الدعوة بنجاح! شاركه مع رفقاتك!"
                                          : "📋 Invite link copied! Send it to your friends!",
                                      );
                                      setTimeout(
                                        () => setWatchPartyToast(null),
                                        3000,
                                      );
                                    }}
                                    className="px-3.5 py-1.5 rounded-xl bg-cyan-400 text-black hover:bg-cyan-300 transition-all font-bold text-xs flex items-center gap-1 active:scale-95 shadow-lg shadow-cyan-400/10 cursor-pointer"
                                  >
                                    <Link className="w-3.5 h-3.5" />
                                    <span>
                                      {lang === "ar"
                                        ? "دعوة صديق 🔗"
                                        : "Invite Friend"}
                                    </span>
                                  </button>

                                  {/* Leave */}
                                  <button
                                    onClick={leaveWatchParty}
                                    className="px-3 py-1.5 rounded-xl bg-red-600/20 border border-red-500/35 text-red-300 hover:bg-red-600/30 font-bold text-xs flex items-center gap-1 active:scale-95 cursor-pointer"
                                  >
                                    <LogOut className="w-3.5 h-3.5" />
                                    <span>
                                      {lang === "ar"
                                        ? "مغادرة 🚪"
                                        : "Leave Party"}
                                    </span>
                                  </button>
                                </div>
                              ) : (
                                /* If NOT in a watch party */
                                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                                  {/* Join Input Toggle Button */}
                                  {showJoinPartyInput ? (
                                    <form
                                      onSubmit={(e) => {
                                        e.preventDefault();
                                        joinWatchParty(joinCodeInput);
                                      }}
                                      className="flex items-center gap-1 w-full sm:w-auto"
                                    >
                                      <input
                                        type="text"
                                        placeholder={
                                          lang === "ar"
                                            ? "أدخل كود الحفلة..."
                                            : "Enter party code..."
                                        }
                                        value={joinCodeInput}
                                        onChange={(e) =>
                                          setJoinCodeInput(e.target.value)
                                        }
                                        className="bg-black/60 border border-white/10 text-white text-xs px-3 py-1.5 rounded-xl max-w-[150px] outline-none focus:border-cyan-400 transition-colors"
                                      />
                                      <button
                                        type="submit"
                                        className="px-3 py-1.5 rounded-xl bg-cyan-500 text-black text-xs font-bold font-mono transition-all hover:bg-cyan-400 inline-flex items-center"
                                      >
                                        <ArrowRight className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setShowJoinPartyInput(false)
                                        }
                                        className="p-1 px-2 rounded-xl bg-red-500/10 text-red-400 text-xs border border-red-500/20"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </form>
                                  ) : (
                                    <>
                                      <button
                                        onClick={startWatchParty}
                                        className="px-4 py-2 rounded-xl bg-[#FF0080]/15 hover:bg-[#FF0080]/25 border border-[#FF0080]/30 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg active:scale-95 cursor-pointer"
                                      >
                                        <Users className="w-3.5 h-3.5 text-pink-400" />
                                        <span>
                                          {lang === "ar"
                                            ? "ابدأ حفلة مشاهدة 🍿"
                                            : "Start Watch Party 🍿"}
                                        </span>
                                      </button>

                                      <button
                                        onClick={() =>
                                          setShowJoinPartyInput(true)
                                        }
                                        className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                                      >
                                        <Link className="w-3.5 h-3.5" />
                                        <span>
                                          {lang === "ar"
                                            ? "انضم برمز 🔑"
                                            : "Join Party Code 🔑"}
                                        </span>
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Video Container viewport */}
                          <div className="relative aspect-video">
                            {/* Dynamic backdrop-filter & blurred ambient aura matching active poster for an ultra-immersive cinema feel */}
                            {activeVideo?.poster && (
                              <div
                                className="absolute -inset-6 md:-inset-10 saturate-[2.2] pointer-events-none select-none z-0 overflow-hidden rounded-[45px] transition-all duration-700"
                                style={{ opacity: ambientBlurOpacity / 100 }}
                              >
                                {/* Blur ambient glow source */}
                                <img
                                  src={activeVideo.poster}
                                  alt=""
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover scale-150 origin-center animate-pulse"
                                  style={{
                                    filter: `blur(${ambientBlurIntensity}px)`,
                                  }}
                                  loading="lazy"
                                  decoding="async"
                                  onError={handleImgError}
                                />
                                {/* Multi-gradient color dodge mesh layer to enhance animation */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-pink-500/10 mix-blend-color-dodge" />
                                {/* Smooth glass transition vignette */}
                                <div className="absolute inset-0 backdrop-blur-3xl bg-black/25" />
                              </div>
                            )}

                            <div
                              className={`transition-all duration-300 origin-bottom-right z-50 ${isMiniPlayer ? "fixed bottom-6 right-6 w-80 shadow-2xl rounded-2xl border-2 border-cyan-400 overflow-hidden bg-black cursor-pointer" : "absolute inset-0 bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl group"}`}
                              onClick={() => {
                                if (isMiniPlayer) {
                                  window.scrollTo({
                                    top: 0,
                                    behavior: "smooth",
                                  });
                                }
                              }}
                              onTouchStart={handleTouchStart}
                              onTouchMove={handleTouchMove}
                              onTouchEnd={handleTouchEnd}
                            >
                              {/* Stats for Nerds floating diagnostic HUD overlay */}
                              {showStatsForNerds && videoTechnicalMeta && (
                                <div className="absolute top-4 left-4 z-[61] w-72 md:w-80 p-3.5 bg-black/95 backdrop-blur-md border border-[#00F2FF]/20 rounded-2xl text-[9px] font-mono text-emerald-400 text-left flex flex-col gap-2.5 shadow-[0_15px_40px_rgba(0,0,0,0.85)] pointer-events-auto select-all">
                                  <div className="flex items-center justify-between border-b border-white/15 pb-1.5 text-zinc-400 font-sans text-[10px]/none font-black tracking-widest uppercase">
                                    <span className="flex items-center gap-1.5 font-bold text-[#00F2FF]">
                                      <Terminal className="w-3.5 h-3.5 animate-pulse" />
                                      Vidbox Diagnostics
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setShowStatsForNerds(false);
                                      }}
                                      className="text-white hover:text-red-400 transition-colors pointer-events-auto font-sans text-xs font-bold font-mono px-1 rounded bg-white/5 active:scale-90"
                                    >
                                      ×
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[9px]">
                                    <span className="text-white/40 font-semibold font-sans">
                                      Video ID / Content:
                                    </span>
                                    <span className="text-white font-bold text-right truncate">
                                      {activeVideo?.id || "unknown"}
                                    </span>

                                    <span className="text-white/40 font-semibold font-sans">
                                      Mime Type / Codec:
                                    </span>
                                    <span
                                      className="text-pink-300 font-bold text-right truncate"
                                      title={videoTechnicalMeta.codec}
                                    >
                                      {videoTechnicalMeta.codec.split(" ")[0]}
                                    </span>

                                    <span className="text-white/40 font-semibold font-sans">
                                      Current Resolution:
                                    </span>
                                    <span className="text-white font-bold text-right font-mono">
                                      {videoTechnicalMeta.resolution} @{" "}
                                      {videoTechnicalMeta.fps}fps
                                    </span>

                                    <span className="text-white/40 font-semibold font-sans">
                                      Simulated Speed:
                                    </span>
                                    <span className="text-[#00F2FF] font-bold text-right font-mono">
                                      {(
                                        bandwidthData[
                                          bandwidthData.length - 1
                                        ] * 820
                                      ).toLocaleString()}{" "}
                                      Kbps
                                    </span>

                                    <span className="text-white/40 font-semibold font-sans">
                                      Mirror Host / CDN:
                                    </span>
                                    <span className="text-purple-400 font-bold text-right max-w-[120px] truncate">
                                      {activeProviderId.toUpperCase()}
                                    </span>

                                    <span className="text-white/40 font-semibold font-sans">
                                      Buffer Ahead / Health:
                                    </span>
                                    <span className="text-emerald-400 font-bold text-right font-mono">
                                      {isPlaying
                                        ? (
                                            10 +
                                            Math.sin(playerCurrentTime / 10) * 3
                                          ).toFixed(1)
                                        : "12.4"}
                                      s
                                    </span>

                                    <span className="text-white/40 font-semibold font-sans">
                                      Dropped Frames:
                                    </span>
                                    <span className="text-emerald-400 font-bold text-right font-mono">
                                      0 / 2380
                                    </span>

                                    <span className="text-white/40 font-semibold font-sans">
                                      Spatial Audio Mode:
                                    </span>
                                    <span className="text-yellow-400 font-bold text-right uppercase font-bold">
                                      {spatialAudioMode}
                                    </span>
                                  </div>

                                  {/* Sparkline Canvas / SVG representing bandwidth burst */}
                                  <div className="flex flex-col gap-1 border-t border-white/10 pt-2 pointer-events-none">
                                    <div className="flex items-center justify-between text-[8px] text-zinc-500">
                                      <span>BANDWIDTH GRAPH (15S BURST)</span>
                                      <span className="text-[#00F2FF] font-semibold">
                                        {
                                          bandwidthData[
                                            bandwidthData.length - 1
                                          ]
                                        }{" "}
                                        MB/s
                                      </span>
                                    </div>
                                    <div className="h-10 w-full mt-1">
                                      <svg
                                        className="w-full h-full overflow-visible"
                                        viewBox="0 0 100 30"
                                        preserveAspectRatio="none"
                                      >
                                        <defs>
                                          <linearGradient
                                            id="glowGrad"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                          >
                                            <stop
                                              offset="0%"
                                              stopColor="#00F2FF"
                                              stopOpacity="0.3"
                                            />
                                            <stop
                                              offset="100%"
                                              stopColor="#00F2FF"
                                              stopOpacity="0.0"
                                            />
                                          </linearGradient>
                                        </defs>
                                        {(() => {
                                          const min = Math.min(
                                            ...bandwidthData,
                                          );
                                          const max = Math.max(
                                            ...bandwidthData,
                                          );
                                          const range = max - min || 1;
                                          const points = bandwidthData
                                            .map((val, i) => {
                                              const x =
                                                (i /
                                                  (bandwidthData.length - 1)) *
                                                100;
                                              const y =
                                                30 -
                                                (((val - min) / range) * 20 +
                                                  5);
                                              return `${x},${y}`;
                                            })
                                            .join(" ");

                                          const areaPoints = `0,30 ${points} 100,30`;

                                          return (
                                            <>
                                              <polygon
                                                points={areaPoints}
                                                fill="url(#glowGrad)"
                                              />
                                              <polyline
                                                fill="none"
                                                stroke="#00F2FF"
                                                strokeWidth="1.2"
                                                points={points}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                              />
                                              {bandwidthData.length > 0 && (
                                                <circle
                                                  cx="100"
                                                  cy={
                                                    30 -
                                                    (((bandwidthData[
                                                      bandwidthData.length - 1
                                                    ] -
                                                      min) /
                                                      range) *
                                                      20 +
                                                      5)
                                                  }
                                                  r="2"
                                                  fill="#FF0080"
                                                />
                                              )}
                                            </>
                                          );
                                        })()}
                                      </svg>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Lock indicator display */}
                              {isPlayerLocked && (
                                <div className="absolute top-4 right-4 z-[61] bg-black/80 border border-red-500/30 p-2 rounded-xl text-red-400 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1.5 pointer-events-none shadow-[0_0_15px_rgba(239,68,68,0.3)] select-none">
                                  <Lock className="w-3.5 h-3.5 animate-pulse text-red-500" />
                                  <span>
                                    {lang === "ar"
                                      ? "أزرار مغلَقة"
                                      : "Controls Locked [L]"}
                                  </span>
                                </div>
                              )}

                              {/* Swipe Gesture Toast */}
                              {showSwipeToast.visible && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-md px-6 py-4 rounded-3xl z-[100] flex items-center justify-center animate-fade-in pointer-events-none shadow-[0_0_30px_rgba(34,211,238,0.3)] border border-cyan-400/30">
                                  <span className="text-white font-black text-2xl tracking-widest">
                                    {showSwipeToast.message}
                                  </span>
                                </div>
                              )}

                              {/* Miniplayer close button */}
                              {isMiniPlayer && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsPlaying(false);
                                    setIsMiniPlayer(false);
                                    setActiveVideo(null);
                                  }}
                                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-2 hover:bg-red-500 z-[60]"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              )}

                              {/* Fallback custom visualizer with anime dynamic patterns */}
                              {!isPlaying || !currentEpisode ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none bg-gradient-to-tr from-purple-950/70 via-black to-slate-950">
                                  {/* Watermark brand */}
                                  <span className="absolute top-4 left-4 text-[10px] font-bold text-amber-400/50 tracking-widest">
                                    NOOR KIDS CINEMA 4K 🕌🌟
                                  </span>
                                  {!activeVideo?.videoUrl &&
                                  episodes.length === 0 ? (
                                    <div className="flex flex-col items-center">
                                      <img
                                        src={activeVideo?.poster}
                                        alt="Poster"
                                        className="h-48 rounded-xl opacity-50 mb-4 object-cover"
                                        loading="lazy"
                                        decoding="async"
                                        onError={handleImgError}
                                      />
                                      <span className="text-sm text-yellow-400 font-bold bg-yellow-400/10 px-4 py-2 rounded-full">
                                        {lang === "ar"
                                          ? "لا يوجد سيرفر متاح بعد"
                                          : "No server available yet"}
                                      </span>
                                    </div>
                                  ) : (
                                    <>
                                      <div
                                        className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-xl shadow-purple-500/10"
                                        onClick={handlePlayPauseToggle}
                                      >
                                        <Play className="w-8 h-8 fill-current text-[#00F2FF] translate-x-0.5" />
                                      </div>
                                      <span className="text-xs text-white/60 mt-4 font-semibold">
                                        {currentEpisode
                                          ? `${t("playNow")} E${currentEpisode.episodeNumber}: ${currentEpisode.title[lang] || currentEpisode.title.en}`
                                          : "Select an Episode below"}
                                      </span>
                                    </>
                                  )}
                                </div>
                              ) : (
                                <div
                                  className="absolute inset-0 w-full h-full bg-slate-950 flex items-center justify-center"
                                  style={{
                                    filter: `brightness(${videoBrightness}%) grayscale(${videoGrayscale ? 100 : 0}%)`,
                                  }}
                                >
                                  {/* Realistic cartoon stream element with BigBuckBunny falling links */}
                                  {(() => {
                                    const activeUrl = getCalculatedStreamUrl();
                                    const isEmbed =
                                      activeUrl.includes("embed") ||
                                      activeUrl.includes("vidsrc") ||
                                      activeUrl.includes("2embed") ||
                                      activeUrl.includes("embed.su");
                                    return isEmbed ? (
                                      <>
                                        <iframe
                                          src={activeUrl}
                                          className={`w-full h-full border-0 ${isMiniPlayer ? "rounded-2xl pointer-events-none" : "rounded-3xl"}`}
                                          allowFullScreen
                                          allow="autoplay; encrypted-media"
                                        />
                                        {/* Clear, elegant button to escape sandbox/frame restrictions */}
                                        <div className="absolute top-3 left-3 z-[45] flex items-center gap-2">
                                          <a
                                            href={activeUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-purple-950/90 hover:bg-purple-900 border border-cyan-400/40 text-cyan-400 hover:text-white text-[10px] font-black tracking-wide py-1.5 px-3 rounded-xl flex items-center gap-1.5 shadow-[0_0_15px_rgba(34,211,238,0.25)] transition-all duration-300 hover:scale-105"
                                            title={
                                              lang === "ar"
                                                ? "افتح البث في نافذة جديدة مباشرة لمعالجة قيود التشغيل"
                                                : "Open stream link in a new browser tab to resolve sandbox/frame restrictions"
                                            }
                                          >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            <span>
                                              {lang === "ar"
                                                ? "تشغيل في نافذة جديدة ↗️"
                                                : "Play in New Tab ↗️"}
                                            </span>
                                          </a>
                                        </div>
                                      </>
                                    ) : (
                                      <video
                                        ref={(el) => {
                                          if (videoRef.current) {
                                            videoRef.current.removeEventListener(
                                              "enterpictureinpicture",
                                              handleEnterPip,
                                            );
                                            videoRef.current.removeEventListener(
                                              "leavepictureinpicture",
                                              handleLeavePip,
                                            );
                                          }
                                          videoRef.current = el;
                                          if (el) {
                                            el.addEventListener(
                                              "enterpictureinpicture",
                                              handleEnterPip,
                                            );
                                            el.addEventListener(
                                              "leavepictureinpicture",
                                              handleLeavePip,
                                            );
                                          }
                                        }}
                                        src={activeUrl}
                                        className="w-full h-full object-contain pointer-events-none"
                                        autoPlay
                                        controls={false}
                                        onLoadedMetadata={() => {
                                          if (videoRef.current) {
                                            // Restore playback rate speed
                                            videoRef.current.playbackRate =
                                              playerSpeed;

                                            // Restore progress
                                            if (
                                              videoProgress > 0 &&
                                              videoProgress < 100
                                            ) {
                                              const restoreTime =
                                                (videoProgress / 100) *
                                                videoRef.current.duration;
                                              videoRef.current.currentTime =
                                                restoreTime || 0;
                                            }

                                            const w =
                                              videoRef.current.videoWidth ||
                                              1920;
                                            const h =
                                              videoRef.current.videoHeight ||
                                              1080;
                                            const isAnime =
                                              activeVideo?.type === "anime";
                                            const fps = isAnime
                                              ? 23.976
                                              : 29.97;
                                            let codec =
                                              "avc1.64002a (H.264 / AAC)";
                                            if (
                                              currentEpisode?.videoUrl?.includes(
                                                ".webm",
                                              )
                                            ) {
                                              codec =
                                                "vp09.00.51.08 (VP9) / opus (Opus)";
                                            }
                                            let bitrate = "3.4 Mbps";
                                            if (w >= 3840)
                                              bitrate = "15.4 Mbps";
                                            else if (w >= 1920)
                                              bitrate = "6.2 Mbps";
                                            else if (w >= 1280)
                                              bitrate = "2.8 Mbps";
                                            else bitrate = "1.2 Mbps";

                                            setVideoTechnicalMeta({
                                              resolution: `${w}x${h}`,
                                              fps,
                                              codec,
                                              bitrate,
                                            });

                                            setPlayerDuration(
                                              videoRef.current.duration || 0,
                                            );
                                            setPlayerCurrentTime(
                                              videoRef.current.currentTime || 0,
                                            );
                                          }
                                        }}
                                        onTimeUpdate={() => {
                                          if (videoRef.current) {
                                            const ct =
                                              videoRef.current.currentTime || 0;
                                            const dur =
                                              videoRef.current.duration || 0;
                                            setPlayerCurrentTime(ct);
                                            setPlayerDuration(dur);
                                            const pct = (ct / dur) * 100;
                                            setVideoProgress(
                                              Math.min(pct || 0, 100),
                                            );

                                            // Auto-play trigger: when reaching the very end and nextUpEpisode is present
                                            if (
                                              dur > 0 &&
                                              ct >= dur - 0.5 &&
                                              nextUpEpisode &&
                                              !autoplayCancelled &&
                                              isPersistentAutoplayEnabled
                                            ) {
                                              handlePlayNextEpisode();
                                            }
                                          }
                                        }}
                                        onEnded={() => {
                                          if (
                                            nextUpEpisode &&
                                            !autoplayCancelled &&
                                            isPersistentAutoplayEnabled
                                          ) {
                                            handlePlayNextEpisode();
                                          } else {
                                            setIsPlaying(false);
                                          }
                                        }}
                                      />
                                    );
                                  })()}

                                  {/* Skip Intro Overlay */}
                                  {(activeVideo?.type === "series" ||
                                    activeVideo?.type === "anime") &&
                                    playerCurrentTime >= 5 &&
                                    playerCurrentTime <= 30 && (
                                      <button
                                        type="button"
                                        onClick={handleSkipIntro}
                                        className="absolute bottom-20 left-4 z-40 bg-[#0F0F15]/95 hover:bg-[#151522] border-2 border-amber-400/80 text-white font-black text-xs py-2.5 px-4 rounded-2xl flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all duration-300 hover:scale-105 active:scale-95 animate-fade-in"
                                      >
                                        <FastForward className="w-4 h-4 text-amber-400 fill-current animate-pulse" />
                                        <span>
                                          {lang === "ar"
                                            ? "تخطي المقدمة 🚀"
                                            : "Skip Intro 🚀"}
                                        </span>
                                      </button>
                                    )}

                                  {/* Skip Intro Toast Alert */}
                                  {showSkipIntroToast && (
                                    <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-emerald-500/95 text-white font-black text-xs px-4 py-2.5 rounded-2xl border border-emerald-400/30 shadow-lg z-50 flex items-center gap-1.5 animate-bounce">
                                      <span>
                                        🚀{" "}
                                        {lang === "ar"
                                          ? "تم تخطي المقدمة بنجاح!"
                                          : "Intro successfully skipped!"}
                                      </span>
                                    </div>
                                  )}

                                  {/* Next Episode Autoplay Countdown Timer overlay */}
                                  {nextUpEpisode &&
                                    playerDuration > 0 &&
                                    playerDuration - playerCurrentTime <= 10 &&
                                    !autoplayCancelled &&
                                    isPersistentAutoplayEnabled && (
                                      <div className="absolute bottom-20 right-4 z-40 bg-[#0F0F15]/95 backdrop-blur-md border border-cyan-400/40 p-4 rounded-3xl flex flex-col gap-3 shadow-[0_10px_30px_rgba(0,242,255,0.15)] max-w-xs animate-fade-in text-left">
                                        <span className="text-[10px] text-cyan-400 font-extrabold tracking-widest uppercase">
                                          {lang === "ar"
                                            ? "الحلقة القادمة تبدأ في"
                                            : "Next Episode In"}
                                        </span>
                                        <div className="flex items-center gap-3">
                                          {/* Circular or pill-like countdown indicator */}
                                          <div className="w-10 h-10 rounded-full bg-cyan-400/10 flex items-center justify-center border-2 border-cyan-400 text-cyan-200 font-black text-sm select-none animate-pulse">
                                            {Math.max(
                                              1,
                                              Math.ceil(
                                                playerDuration -
                                                  playerCurrentTime,
                                              ),
                                            )}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <h4 className="text-xs font-black text-white truncate">
                                              {nextUpEpisode.title[lang] ||
                                                nextUpEpisode.title.en}
                                            </h4>
                                            <span className="text-[9px] text-white/50 font-mono">
                                              {lang === "ar"
                                                ? `حلقة رقم ${nextUpEpisode.episodeNumber}`
                                                : `Episode ${nextUpEpisode.episodeNumber}`}
                                            </span>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2 mt-1">
                                          <button
                                            type="button"
                                            onClick={handlePlayNextEpisode}
                                            className="flex-1 bg-gradient-to-r from-cyan-400 to-[#FF0080] hover:from-cyan-300 hover:to-pink-500 text-white font-black text-[10px] py-1.5 px-3 rounded-xl shadow-md transition-all hover:scale-102 active:scale-98 flex items-center justify-center gap-1"
                                          >
                                            <Play className="w-3 h-3 fill-current text-white" />
                                            <span>
                                              {lang === "ar"
                                                ? "تشغيل الآن"
                                                : "Play Now"}
                                            </span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setAutoplayCancelled(true)
                                            }
                                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-bold text-[10px] rounded-xl transition-all"
                                          >
                                            {lang === "ar"
                                              ? "إلغاء الاستمرار"
                                              : "Cancel"}
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                  {/* Casting Simulation Overlay */}
                                  {isCasting && (
                                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3 z-30 animate-pulse text-center p-4">
                                      <Tv className="w-16 h-16 text-[#00F2FF]" />
                                      <span className="text-sm font-bold text-cyan-200">
                                        Streaming live on KidsLivingRoom
                                        Chromecast 📡
                                      </span>
                                      <span className="text-[10px] text-white/50">
                                        Keep this preview tab active as primary
                                        transmitter
                                      </span>
                                    </div>
                                  )}

                                  {/* Watermark logo */}
                                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-[9px] text-amber-300 font-black tracking-widest py-1 px-2.5 rounded-full border border-amber-500/30 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                    NOOR KIDS PRO 🌟🕌
                                  </div>
                                </div>
                              )}

                              {/* Interactive Player Controls overlay hud */}
                              {!currentEpisode?.videoUrl?.includes("embed") && (
                                <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-3xl flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-40 hover:opacity-100">
                                  {/* Seek bar */}
                                  <div
                                    className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer relative"
                                    onClick={handleProgressClick}
                                    onMouseMove={(e) => {
                                      const rect =
                                        e.currentTarget.getBoundingClientRect();
                                      const x = e.clientX - rect.left;
                                      const percentage = x / rect.width;
                                      setHoverX(x);

                                      let dur = playerDuration;
                                      if (
                                        videoRef.current &&
                                        videoRef.current.duration
                                      ) {
                                        dur = videoRef.current.duration;
                                      }

                                      if (dur) {
                                        setHoveredTime(percentage * dur);
                                      } else {
                                        setHoveredTime(percentage * 1200); // 20 mins fallback
                                      }
                                    }}
                                    onMouseLeave={() => {
                                      setHoveredTime(null);
                                      setHoverX(null);
                                    }}
                                  >
                                    <div
                                      className="h-full bg-gradient-to-r from-cyan-400 to-[#FF0080] rounded-full relative"
                                      style={{ width: `${videoProgress}%` }}
                                    >
                                      <div className="absolute -right-1 -top-1 w-3.5 h-3.5 bg-white rounded-full shadow border-2 border-[#FF0080]" />
                                    </div>

                                    {/* Floating Thumbnail Preview */}
                                    {hoveredTime !== null &&
                                      hoverX !== null && (
                                        <div
                                          className="absolute bottom-5 z-50 p-1 bg-[#0F0F15] border-2 border-[#FF0080] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex flex-col items-center gap-1 pointer-events-none"
                                          style={{
                                            left: `${hoverX}px`,
                                            transform: "translateX(-50%)",
                                          }}
                                        >
                                          <div className="w-[140px] h-[78px] bg-black rounded-lg overflow-hidden relative">
                                            {currentEpisode?.videoUrl ? (
                                              <video
                                                ref={previewVideoRef}
                                                src={currentEpisode.videoUrl}
                                                muted
                                                playsInline
                                                className="absolute inset-0 w-full h-full object-cover"
                                              />
                                            ) : (
                                              <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-[10px] text-white/50">
                                                No preview
                                              </div>
                                            )}

                                            {/* Absolute timestamp label overlay */}
                                            <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded font-mono text-[9px] text-white font-bold border border-white/10">
                                              {(() => {
                                                const m = Math.floor(
                                                  hoveredTime / 60,
                                                );
                                                const s = Math.floor(
                                                  hoveredTime % 60,
                                                );
                                                return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
                                              })()}
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                    {/* Render small tick marks for Bookmarks / Chapter markers */}
                                    {bookmarks.map((b) => {
                                      const realPct =
                                        playerDuration > 0
                                          ? (b.time / playerDuration) * 100
                                          : 0;
                                      if (realPct < 0 || realPct > 100)
                                        return null;
                                      return (
                                        <div
                                          key={b.id}
                                          className="absolute top-0 w-1.5 h-1.5 bg-cyan-300 rounded-full border border-black/65 hover:bg-yellow-300 transition-all hover:scale-150 z-20 group/tick cursor-pointer"
                                          style={{
                                            left: `${realPct}%`,
                                            transform: "translateX(-50%)",
                                          }}
                                          onClick={(e) => {
                                            e.stopPropagation(); // Prevent normal timeline click
                                            if (videoRef.current) {
                                              videoRef.current.currentTime =
                                                b.time;
                                              setVideoProgress(realPct);
                                              setPlayerCurrentTime(b.time);
                                            }
                                          }}
                                        >
                                          {/* Custom Tooltip on Hover */}
                                          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-black/95 text-[10px] text-white font-black px-2.5 py-1.5 rounded-xl border border-cyan-400/50 shadow-[0_4px_20px_rgba(0,0,0,0.8)] opacity-0 pointer-events-none group-hover/tick:opacity-100 transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 z-[75]">
                                            <Tag className="w-3 h-3 text-cyan-400 animate-pulse" />
                                            <span>{b.title}</span>
                                            <span className="text-zinc-400 font-mono font-normal">
                                              ({formatMinSec(b.time)})
                                            </span>

                                            {/* Delete icon/button for custom bookmarks */}
                                            {!b.id.startsWith("def") && (
                                              <button
                                                type="button"
                                                className="ml-1 text-red-400 hover:text-red-300 pointer-events-auto transition-colors font-bold text-xs"
                                                title={
                                                  lang === "ar"
                                                    ? "حذف العلامة"
                                                    : "Delete chapter marker"
                                                }
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleDeleteBookmark(b.id);
                                                }}
                                              >
                                                ×
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                      <button
                                        onClick={handlePlayPauseToggle}
                                        className="text-white hover:text-cyan-400 transition-colors"
                                      >
                                        {isPlaying ? (
                                          <Pause className="w-4 h-4 fill-current" />
                                        ) : (
                                          <Play className="w-4 h-4 fill-current" />
                                        )}
                                      </button>

                                      <button
                                        onClick={() => setVideoProgress(0)}
                                        className="text-white hover:text-cyan-400 transition-colors"
                                      >
                                        <RotateCcw className="w-4 h-4" />
                                      </button>

                                      {/* Simulated remaining dynamic clock */}
                                      <span className="text-[10px] text-white/40 font-bold">
                                        {currentEpisode
                                          ? `E${currentEpisode.episodeNumber} • ${Math.round(videoProgress)}% completed`
                                          : "No file loaded"}
                                      </span>

                                      {/* Interactive Chapter Bookmark Addition Bar */}
                                      {currentEpisode && (
                                        <div className="flex items-center gap-2 border-l border-white/10 pl-3">
                                          {showAddBookmark ? (
                                            <div className="flex items-center gap-1.5 animate-fadeIn">
                                              <input
                                                type="text"
                                                placeholder={
                                                  lang === "ar"
                                                    ? "عنوان الفصل..."
                                                    : "Chapter title..."
                                                }
                                                value={newBookmarkTitle}
                                                onChange={(e) =>
                                                  setNewBookmarkTitle(
                                                    e.target.value,
                                                  )
                                                }
                                                className="bg-black/85 text-[10px] text-white px-2.5 py-1 rounded-lg border border-cyan-400/50 w-32 placeholder:text-white/30 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
                                                onKeyDown={(e) => {
                                                  if (e.key === "Enter")
                                                    handleAddBookmark(
                                                      newBookmarkTitle,
                                                    );
                                                  if (e.key === "Escape") {
                                                    setShowAddBookmark(false);
                                                    setNewBookmarkTitle("");
                                                  }
                                                }}
                                                autoFocus
                                              />
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  handleAddBookmark(
                                                    newBookmarkTitle,
                                                  )
                                                }
                                                className="bg-cyan-500 hover:bg-cyan-400 text-black px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-colors"
                                              >
                                                {lang === "ar"
                                                  ? "إضافة"
                                                  : "Add"}
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setShowAddBookmark(false);
                                                  setNewBookmarkTitle("");
                                                }}
                                                className="text-white/40 hover:text-white px-1.5 py-1 text-sm font-bold transition-colors"
                                              >
                                                ×
                                              </button>
                                            </div>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setShowAddBookmark(true)
                                              }
                                              className="text-[10px] text-white/50 hover:text-cyan-400 font-extrabold flex items-center gap-1.5 transition-all bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-full cursor-pointer"
                                              title={
                                                lang === "ar"
                                                  ? "إضافة فصل أو علامة زمنية"
                                                  : "Add chapter / bookmark at current time"
                                              }
                                            >
                                              <Bookmark className="w-3 h-3 text-[#FF0080]" />
                                              <span>
                                                {lang === "ar"
                                                  ? "علامة فصل"
                                                  : "+ Chapter"}
                                              </span>
                                            </button>
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                      {/* SPEED SWITCHER BUTTONS */}
                                      <div className="flex items-center gap-2 bg-black/60 border border-white/10 rounded-full px-2 py-1">
                                        <span className="text-[9px] text-white/40 uppercase font-extrabold">
                                          {t("speed")}
                                        </span>
                                        <button
                                          onClick={() => {
                                            const nextSpeed = Math.max(
                                              0.25,
                                              Number(
                                                (playerSpeed - 0.25).toFixed(2),
                                              ),
                                            );
                                            setPlayerSpeed(nextSpeed);
                                            if (videoRef.current)
                                              videoRef.current.playbackRate =
                                                nextSpeed;
                                          }}
                                          className="text-white hover:text-cyan-400 transition-colors disabled:opacity-50"
                                          disabled={playerSpeed <= 0.25}
                                        >
                                          -
                                        </button>
                                        <span className="text-[10px] text-white font-bold min-w-[32px] text-center">
                                          {playerSpeed.toFixed(2)}x
                                        </span>
                                        <button
                                          onClick={() => {
                                            const nextSpeed = Math.min(
                                              3.0,
                                              Number(
                                                (playerSpeed + 0.25).toFixed(2),
                                              ),
                                            );
                                            setPlayerSpeed(nextSpeed);
                                            if (videoRef.current)
                                              videoRef.current.playbackRate =
                                                nextSpeed;
                                          }}
                                          className="text-white hover:text-cyan-400 transition-colors disabled:opacity-50"
                                          disabled={playerSpeed >= 3}
                                        >
                                          +
                                        </button>
                                      </div>

                                      {/* AUDIO SELECTOR */}
                                      <div className="flex items-center gap-1">
                                        <span className="text-[9px] text-cyan-400 font-extrabold">
                                          🔊 DUB
                                        </span>
                                        <select
                                          value={selectedAudio}
                                          onChange={(e) =>
                                            setSelectedAudio(e.target.value)
                                          }
                                          className="bg-black/60 border border-white/10 text-white text-[10px] py-0.5 px-1 rounded"
                                        >
                                          {activeVideo.languageOptions?.dubbed?.map(
                                            (d) => (
                                              <option key={d} value={d}>
                                                {d.toUpperCase()}
                                              </option>
                                            ),
                                          )}
                                        </select>
                                      </div>

                                      {/* SUBTITLE SELECTOR */}
                                      <div className="flex items-center gap-1">
                                        <span className="text-[9px] text-pink-400 font-bold">
                                          💬 CC
                                        </span>
                                        <select
                                          value={selectedSubtitle}
                                          onChange={(e) =>
                                            setSelectedSubtitle(e.target.value)
                                          }
                                          className="bg-black/60 border border-white/10 text-white text-[10px] py-0.5 px-1 rounded"
                                        >
                                          <option value="none">
                                            {t("noSubtitles")}
                                          </option>
                                          {activeVideo.languageOptions?.subtitled?.map(
                                            (s) => (
                                              <option key={s} value={s}>
                                                {s.toUpperCase()}
                                              </option>
                                            ),
                                          )}
                                        </select>
                                      </div>

                                      {/* QUALITY SELECTOR */}
                                      <select
                                        value={playerQuality}
                                        onChange={(e) =>
                                          setPlayerQuality(e.target.value)
                                        }
                                        className="bg-black/60 border border-white/10 text-white text-[10px] py-0.5 px-1 rounded font-bold"
                                      >
                                        <option value="480p">480p</option>
                                        <option value="720p">720p HD</option>
                                        <option value="1080p">1080p FHD</option>
                                        <option value="4k">2160p 4K</option>
                                      </select>

                                      {/* PIP Screen Trigger */}
                                      <button
                                        onClick={() => setIsPip(!isPip)}
                                        className={`p-1 rounded transition-colors ${isPip ? "bg-cyan-500 text-black" : "hover:bg-white/10 text-white"}`}
                                        title={t("pipMode")}
                                      >
                                        <Monitor className="w-3.5 h-3.5" />
                                      </button>

                                      {/* Chromecast Emulator toggle */}
                                      <button
                                        onClick={() => setIsCasting(!isCasting)}
                                        className={`p-1 rounded transition-colors ${isCasting ? "bg-amber-500 text-black" : "hover:bg-white/10 text-white"}`}
                                        title={t("castSim")}
                                      >
                                        <Tv className="w-3.5 h-3.5" />
                                      </button>

                                      {/* Stats for Nerds Toggle */}
                                      <button
                                        onClick={() =>
                                          setShowStatsForNerds(
                                            !showStatsForNerds,
                                          )
                                        }
                                        className={`p-1 rounded transition-colors ${showStatsForNerds ? "bg-emerald-500 text-black shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "hover:bg-white/10 text-white"}`}
                                        title={
                                          lang === "ar"
                                            ? "إحصائيات المطورين [N]"
                                            : "Stats for Nerds [N]"
                                        }
                                      >
                                        <Terminal className="w-3.5 h-3.5" />
                                      </button>

                                      {/* Keyboard Shortcuts Reference Toggle */}
                                      <button
                                        onClick={() =>
                                          setShowHotkeysModal(!showHotkeysModal)
                                        }
                                        className={`p-1 rounded transition-colors hover:bg-white/10 text-white`}
                                        title={
                                          lang === "ar"
                                            ? "اختصارات لوحة المفاتيح [H]"
                                            : "Keyboard Shortcuts [H]"
                                        }
                                      >
                                        <Keyboard className="w-3.5 h-3.5" />
                                      </button>

                                      {/* Control Lock Button */}
                                      <button
                                        onClick={() => {
                                          setIsPlayerLocked(!isPlayerLocked);
                                          showSwipeMessage(
                                            lang === "ar"
                                              ? !isPlayerLocked
                                                ? "🔒 تم قفل أزرار التحكم"
                                                : "🔓 تم إلغاء القفل"
                                              : !isPlayerLocked
                                                ? "🔒 Player Controls Locked"
                                                : "🔓 Player Controls Unlocked",
                                          );
                                        }}
                                        className={`p-1 rounded transition-colors ${isPlayerLocked ? "bg-red-500 text-white hover:bg-red-600" : "hover:bg-white/10 text-white"}`}
                                        title={
                                          lang === "ar"
                                            ? "قفل التحكم لوحة [L]"
                                            : "Lock Interface Controls [L]"
                                        }
                                      >
                                        {isPlayerLocked ? (
                                          <Lock className="w-3.5 h-3.5" />
                                        ) : (
                                          <Unlock className="w-3.5 h-3.5" />
                                        )}
                                      </button>

                                      {/* Theater Mode Action Button */}
                                      <button
                                        onClick={() => {
                                          setIsTheaterMode(!isTheaterMode);
                                          if (isCinematicMode)
                                            setIsCinematicMode(false);
                                        }}
                                        className={`p-1 rounded transition-colors ${isTheaterMode ? "bg-cyan-400 text-black shadow-[0_0_8px_rgba(34,211,238,0.4)]" : "hover:bg-white/10 text-white"}`}
                                        title={
                                          lang === "ar"
                                            ? "نمط المسرح"
                                            : "Theater Mode"
                                        }
                                      >
                                        <Film className="w-3.5 h-3.5" />
                                      </button>

                                      {/* Settings Popover Button */}
                                      <div className="relative">
                                        <button
                                          onClick={() =>
                                            setShowSettingsPopover(
                                              !showSettingsPopover,
                                            )
                                          }
                                          className={`p-1 rounded transition-colors ${showSettingsPopover ? "bg-[#FF0080] text-white" : "hover:bg-white/10 text-white"}`}
                                          title={
                                            lang === "ar"
                                              ? "الإعدادات"
                                              : "Play Settings"
                                          }
                                        >
                                          <Settings className="w-3.5 h-3.5" />
                                        </button>

                                        <AnimatePresence>
                                          {showSettingsPopover && (
                                            <motion.div
                                              initial={{
                                                opacity: 0,
                                                y: 10,
                                                scale: 0.95,
                                              }}
                                              animate={{
                                                opacity: 1,
                                                y: 0,
                                                scale: 1,
                                              }}
                                              exit={{
                                                opacity: 0,
                                                y: 10,
                                                scale: 0.95,
                                              }}
                                              transition={{ duration: 0.2 }}
                                              className="absolute bottom-8 right-0 z-[70] w-64 p-4 rounded-2xl bg-[#0F0F15]/95 backdrop-blur-md border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col gap-3 font-sans text-xs text-white"
                                            >
                                              {/* Header */}
                                              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                                <span className="font-bold text-cyan-400 flex items-center gap-1">
                                                  <Settings className="w-3.5 h-3.5" />
                                                  {lang === "ar"
                                                    ? "إعدادات التشغيل"
                                                    : "Playback Settings"}
                                                </span>
                                                <button
                                                  onClick={() =>
                                                    setShowSettingsPopover(
                                                      false,
                                                    )
                                                  }
                                                  className="text-white/40 hover:text-white"
                                                >
                                                  <X className="w-3.5 h-3.5" />
                                                </button>
                                              </div>

                                              {/* Playback speed */}
                                              <div className="flex flex-col gap-1.5 align-start text-left">
                                                <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">
                                                  {lang === "ar"
                                                    ? "سرعة التشغيل"
                                                    : "Playback Speed"}
                                                </span>
                                                <div className="grid grid-cols-5 gap-1">
                                                  {[
                                                    0.5, 1.0, 1.25, 1.5, 2.0,
                                                  ].map((speed) => (
                                                    <button
                                                      key={speed}
                                                      onClick={() => {
                                                        setPlayerSpeed(speed);
                                                        if (videoRef.current)
                                                          videoRef.current.playbackRate =
                                                            speed;
                                                      }}
                                                      className={`py-1 rounded font-mono text-[10px] text-center transition-all ${
                                                        Math.abs(
                                                          playerSpeed - speed,
                                                        ) < 0.05
                                                          ? "bg-[#FF0080] text-white font-extrabold"
                                                          : "bg-white/5 hover:bg-white/10 text-white/75"
                                                      }`}
                                                    >
                                                      {speed}x
                                                    </button>
                                                  ))}
                                                </div>
                                              </div>

                                              {/* Quality Preferences */}
                                              <div className="flex flex-col gap-1.5 align-start text-left">
                                                <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">
                                                  {lang === "ar"
                                                    ? "الجودة"
                                                    : "Video Quality"}
                                                </span>
                                                <div className="grid grid-cols-4 gap-1">
                                                  {[
                                                    {
                                                      label: "480p",
                                                      val: "480p",
                                                    },
                                                    {
                                                      label: "720p",
                                                      val: "720p",
                                                    },
                                                    {
                                                      label: "1080p",
                                                      val: "1080p",
                                                    },
                                                    { label: "4K", val: "4k" },
                                                  ].map((qual) => (
                                                    <button
                                                      key={qual.val}
                                                      onClick={() =>
                                                        setPlayerQuality(
                                                          qual.val,
                                                        )
                                                      }
                                                      className={`py-1 rounded text-[10px] text-center transition-all ${
                                                        playerQuality ===
                                                        qual.val
                                                          ? "bg-cyan-500 text-black font-extrabold"
                                                          : "bg-white/5 hover:bg-white/10 text-white/75"
                                                      }`}
                                                    >
                                                      {qual.label}
                                                    </button>
                                                  ))}
                                                </div>
                                              </div>

                                              {/* Audio Track Option */}
                                              <div className="flex flex-col gap-1.5 align-start text-left">
                                                <div className="flex items-center justify-between">
                                                  <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">
                                                    {lang === "ar"
                                                      ? "المسار الصوتي"
                                                      : "Audio Track"}
                                                  </span>
                                                  <button
                                                    type="button"
                                                    id="btn-detect-audio-lang"
                                                    onClick={() => {
                                                      if (
                                                        !activeVideo
                                                          ?.languageOptions
                                                          ?.dubbed?.length
                                                      )
                                                        return;
                                                      const browserLanguages =
                                                        navigator.languages
                                                          ? navigator.languages.map(
                                                              (l) =>
                                                                l.toLowerCase(),
                                                            )
                                                          : [
                                                              navigator.language.toLowerCase(),
                                                            ];

                                                      // Profile interface/app language starts first
                                                      const preferredCodes = [
                                                        lang.toLowerCase(),
                                                        ...browserLanguages,
                                                      ];

                                                      const langMap: Record<
                                                        string,
                                                        string[]
                                                      > = {
                                                        ar: ["arabic", "ar"],
                                                        en: ["english", "en"],
                                                        fr: ["french", "fr"],
                                                        de: ["german", "de"],
                                                        es: ["spanish", "es"],
                                                        it: ["italian", "it"],
                                                        ja: [
                                                          "japanese",
                                                          "ja",
                                                          "jp",
                                                        ],
                                                      };

                                                      let matchedTrack:
                                                        | string
                                                        | null = null;
                                                      for (const code of preferredCodes) {
                                                        const baseCode =
                                                          code.split("-")[0];
                                                        const targetNames =
                                                          langMap[baseCode] || [
                                                            baseCode,
                                                          ];
                                                        matchedTrack =
                                                          activeVideo.languageOptions.dubbed.find(
                                                            (track) => {
                                                              const tLower =
                                                                track.toLowerCase();
                                                              return (
                                                                targetNames.includes(
                                                                  tLower,
                                                                ) ||
                                                                tLower ===
                                                                  baseCode
                                                              );
                                                            },
                                                          ) || null;
                                                        if (matchedTrack) break;
                                                      }

                                                      if (
                                                        !matchedTrack &&
                                                        activeVideo
                                                          .languageOptions
                                                          .dubbed.length > 0
                                                      ) {
                                                        matchedTrack =
                                                          activeVideo
                                                            .languageOptions
                                                            .dubbed[0];
                                                      }

                                                      if (matchedTrack) {
                                                        setSelectedAudio(
                                                          matchedTrack,
                                                        );
                                                        const label =
                                                          {
                                                            en:
                                                              lang === "ar"
                                                                ? "الإنجليزية"
                                                                : "English",
                                                            ar:
                                                              lang === "ar"
                                                                ? "العربية"
                                                                : "Arabic",
                                                            fr:
                                                              lang === "ar"
                                                                ? "الفرنسية"
                                                                : "French",
                                                            es:
                                                              lang === "ar"
                                                                ? "الإسبانية"
                                                                : "Spanish",
                                                            de:
                                                              lang === "ar"
                                                                ? "الألمانية"
                                                                : "German",
                                                            it:
                                                              lang === "ar"
                                                                ? "الإيطالية"
                                                                : "Italian",
                                                            ja:
                                                              lang === "ar"
                                                                ? "اليابانية"
                                                                : "Japanese",
                                                          }[
                                                            matchedTrack.toLowerCase()
                                                          ] ||
                                                          matchedTrack.toUpperCase();

                                                        showSwipeMessage(
                                                          lang === "ar"
                                                            ? `🎙️ الكشف التلقائي عن اللغة: ${label}`
                                                            : `🎙️ Auto-detected audio track: ${label}`,
                                                        );
                                                      }
                                                    }}
                                                    className="text-[9px] text-cyan-400 font-bold hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer bg-transparent border-none outline-none"
                                                    title={
                                                      lang === "ar"
                                                        ? "الكشف التلقائي والمطابقة للغة الصوت المفضلة"
                                                        : "Auto-detect best audio track language"
                                                    }
                                                  >
                                                    <Globe className="w-2.5 h-2.5" />
                                                    <span>
                                                      {lang === "ar"
                                                        ? "كشف تلقائي"
                                                        : "Detect Language"}
                                                    </span>
                                                  </button>
                                                </div>
                                                <select
                                                  value={selectedAudio}
                                                  onChange={(e) =>
                                                    setSelectedAudio(
                                                      e.target.value,
                                                    )
                                                  }
                                                  className="w-full bg-[#151520]/80 hover:bg-[#1C1C2A]/80 border border-white/10 text-white text-[10px] py-1.5 px-2.5 rounded-lg focus:outline-none focus:border-cyan-500 transition-all cursor-pointer font-medium"
                                                >
                                                  {activeVideo?.languageOptions?.dubbed?.map(
                                                    (audio) => {
                                                      const label =
                                                        {
                                                          en:
                                                            lang === "ar"
                                                              ? "الإنجليزية (EN)"
                                                              : "English (EN)",
                                                          ar:
                                                            lang === "ar"
                                                              ? "العربية (AR)"
                                                              : "Arabic (AR)",
                                                          fr:
                                                            lang === "ar"
                                                              ? "الفرنسية (FR)"
                                                              : "French (FR)",
                                                          es:
                                                            lang === "ar"
                                                              ? "الإسبانية (ES)"
                                                              : "Spanish (ES)",
                                                          de:
                                                            lang === "ar"
                                                              ? "الألمانية (DE)"
                                                              : "German (DE)",
                                                          it:
                                                            lang === "ar"
                                                              ? "الإيطالية (IT)"
                                                              : "Italian (IT)",
                                                          ja:
                                                            lang === "ar"
                                                              ? "اليابانية (JA)"
                                                              : "Japanese (JA)",
                                                        }[
                                                          audio.toLowerCase()
                                                        ] ||
                                                        audio.toUpperCase();
                                                      return (
                                                        <option
                                                          key={audio}
                                                          value={audio}
                                                          className="bg-[#0F0F15] text-white"
                                                        >
                                                          {label}
                                                        </option>
                                                      );
                                                    },
                                                  )}
                                                </select>
                                              </div>

                                              {/* Subtitles Option */}
                                              <div className="flex flex-col gap-1.5 align-start text-left">
                                                <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">
                                                  {lang === "ar"
                                                    ? "الترجمة المصاحبة"
                                                    : "Subtitles / CC"}
                                                </span>
                                                <div className="flex flex-wrap gap-1">
                                                  <button
                                                    onClick={() =>
                                                      setSelectedSubtitle(
                                                        "none",
                                                      )
                                                    }
                                                    className={`px-2.5 py-1 rounded text-[10px] transition-all ${
                                                      selectedSubtitle ===
                                                      "none"
                                                        ? "bg-purple-500 text-white font-extrabold"
                                                        : "bg-white/5 hover:bg-white/10 text-white/75"
                                                    }`}
                                                  >
                                                    {lang === "ar"
                                                      ? "إيقاف"
                                                      : "Off"}
                                                  </button>
                                                  {activeVideo?.languageOptions?.subtitled?.map(
                                                    (sub) => (
                                                      <button
                                                        key={sub}
                                                        onClick={() =>
                                                          setSelectedSubtitle(
                                                            sub,
                                                          )
                                                        }
                                                        className={`px-2.5 py-1 rounded text-[10px] uppercase transition-all ${
                                                          selectedSubtitle ===
                                                          sub
                                                            ? "bg-purple-500 text-white font-extrabold"
                                                            : "bg-white/5 hover:bg-white/10 text-white/75"
                                                        }`}
                                                      >
                                                        {sub}
                                                      </button>
                                                    ),
                                                  )}
                                                </div>
                                              </div>

                                              {/* Ambient Glow Aura Customizer */}
                                              <div className="flex flex-col gap-2 align-start text-left border-t border-white/10 pt-2">
                                                <span className="text-[10px] text-pink-400 uppercase font-bold tracking-wider flex items-center gap-1">
                                                  <Sparkles className="w-3.5 h-3.5" />
                                                  {lang === "ar"
                                                    ? "تخصيص الهالة الخلفية"
                                                    : "Ambient glow overlay"}
                                                </span>
                                                <div className="flex flex-col gap-1.5 text-[9px] text-white/70">
                                                  <div className="flex items-center justify-between">
                                                    <span>
                                                      {lang === "ar"
                                                        ? "الشفافية:"
                                                        : "Glow Opacity:"}
                                                    </span>
                                                    <span className="font-mono font-bold text-pink-300">
                                                      {ambientBlurOpacity}%
                                                    </span>
                                                  </div>
                                                  <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={ambientBlurOpacity}
                                                    onChange={(e) =>
                                                      setAmbientBlurOpacity(
                                                        Number(e.target.value),
                                                      )
                                                    }
                                                    className="w-full accent-pink-500 bg-white/10 h-1 rounded cursor-pointer"
                                                  />

                                                  <div className="flex items-center justify-between mt-1">
                                                    <span>
                                                      {lang === "ar"
                                                        ? "قوة التمويه:"
                                                        : "Glow Softness:"}
                                                    </span>
                                                    <span className="font-mono font-bold text-pink-300">
                                                      {ambientBlurIntensity}px
                                                    </span>
                                                  </div>
                                                  <input
                                                    type="range"
                                                    min="20"
                                                    max="150"
                                                    value={ambientBlurIntensity}
                                                    onChange={(e) =>
                                                      setAmbientBlurIntensity(
                                                        Number(e.target.value),
                                                      )
                                                    }
                                                    className="w-full accent-pink-500 bg-white/10 h-1 rounded cursor-pointer"
                                                  />
                                                </div>
                                              </div>

                                              {/* Brightness Control slider */}
                                              <div className="flex flex-col gap-2 align-start text-left border-t border-white/10 pt-2">
                                                <span className="text-[10px] text-yellow-400 uppercase font-bold tracking-wider flex items-center gap-1">
                                                  <Sun className="w-3.5 h-3.5" />
                                                  {lang === "ar"
                                                    ? "تحكم في السطوع"
                                                    : "Brightness Control"}
                                                </span>
                                                <div className="flex flex-col gap-1.5 text-[9px] text-white/70">
                                                  <div className="flex items-center justify-between">
                                                    <span>
                                                      {lang === "ar"
                                                        ? "مستوى السطوع:"
                                                        : "Level:"}
                                                    </span>
                                                    <span className="font-mono font-bold text-yellow-300">
                                                      {videoBrightness}%
                                                    </span>
                                                  </div>
                                                  <input
                                                    type="range"
                                                    min="30"
                                                    max="170"
                                                    value={videoBrightness}
                                                    onChange={(e) =>
                                                      setVideoBrightness(
                                                        Number(e.target.value),
                                                      )
                                                    }
                                                    className="w-full accent-yellow-400 bg-white/10 h-1 rounded cursor-pointer"
                                                    title={
                                                      lang === "ar"
                                                        ? "مستوى السطوع"
                                                        : "Brightness level"
                                                    }
                                                  />
                                                </div>
                                              </div>

                                              {/* Grayscale Mode toggle */}
                                              <div className="flex flex-col gap-2 align-start text-left border-t border-white/10 pt-2">
                                                <span className="text-[10px] text-purple-400 uppercase font-bold tracking-wider flex items-center gap-1">
                                                  <Contrast className="w-3.5 h-3.5" />
                                                  {lang === "ar"
                                                    ? "نمط التدرج الرمادي"
                                                    : "Grayscale accessibility"}
                                                </span>
                                                <div className="flex items-center justify-between text-[9px] text-white/70">
                                                  <span>
                                                    {lang === "ar"
                                                      ? "لتقليل التحفيز البصري:"
                                                      : "Reduce visual stimulation:"}
                                                  </span>
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      const next =
                                                        !videoGrayscale;
                                                      setVideoGrayscale(next);
                                                      showSwipeMessage(
                                                        lang === "ar"
                                                          ? next
                                                            ? "⚫ نمط الرمادي نشط"
                                                            : "⚪ نمط الألوان نشط"
                                                          : next
                                                            ? "⚫ Grayscale mode ON"
                                                            : "⚪ Grayscale mode OFF",
                                                      );
                                                    }}
                                                    className={`px-3 py-1 rounded-xl text-[9px] font-bold transition-all border outline-none active:scale-95 cursor-pointer ${
                                                      videoGrayscale
                                                        ? "bg-purple-500/20 border-purple-400/40 text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.2)] font-extrabold"
                                                        : "bg-white/5 border-white/10 hover:bg-white/10 text-white/60"
                                                    }`}
                                                  >
                                                    {videoGrayscale
                                                      ? lang === "ar"
                                                        ? "مفعّل"
                                                        : "Active"
                                                      : lang === "ar"
                                                        ? "غير مفعّل"
                                                        : "Disabled"}
                                                  </button>
                                                </div>
                                              </div>

                                              {/* Auto-Dim Lights toggle */}
                                              <div className="flex flex-col gap-2 align-start text-left border-t border-white/10 pt-2">
                                                <span className="text-[10px] text-pink-500 uppercase font-bold tracking-wider flex items-center gap-1">
                                                  <Moon className="w-3.5 h-3.5" />
                                                  {lang === "ar"
                                                    ? "تعتيم تلقائي للأضواء"
                                                    : "Auto-Dim Lights"}
                                                </span>
                                                <div className="flex items-center justify-between text-[9px] text-white/70">
                                                  <span>
                                                    {lang === "ar"
                                                      ? "تعتيم الواجهة أثناء التشغيل:"
                                                      : "Dim interface during playback:"}
                                                  </span>
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      const next =
                                                        !isAutoDimEnabled;
                                                      setIsAutoDimEnabled(next);
                                                      showSwipeMessage(
                                                        lang === "ar"
                                                          ? next
                                                            ? "🌙 تعتيم الأضواء نشط"
                                                            : "☀️ تعتيم الأضواء معطل"
                                                          : next
                                                            ? "🌙 Auto-Dim lights ON"
                                                            : "☀️ Auto-Dim lights OFF",
                                                      );
                                                    }}
                                                    className={`px-3 py-1 rounded-xl text-[9px] font-bold transition-all border outline-none active:scale-95 cursor-pointer ${
                                                      isAutoDimEnabled
                                                        ? "bg-pink-500/20 border-pink-400/40 text-pink-300 shadow-[0_0_8px_rgba(236,72,153,0.2)] font-extrabold"
                                                        : "bg-white/5 border-white/10 hover:bg-white/10 text-white/60"
                                                    }`}
                                                  >
                                                    {isAutoDimEnabled
                                                      ? lang === "ar"
                                                        ? "مفعّل"
                                                        : "Active"
                                                      : lang === "ar"
                                                        ? "غير مفعّل"
                                                        : "Disabled"}
                                                  </button>
                                                </div>
                                              </div>

                                              {/* Picture in Picture Switch */}
                                              <div className="flex flex-col gap-2 align-start text-left border-t border-white/10 pt-2">
                                                <span className="text-[10px] text-teal-400 uppercase font-bold tracking-wider flex items-center gap-1">
                                                  <PictureInPicture2 className="w-3.5 h-3.5" />
                                                  {lang === "ar"
                                                    ? "صورة داخل صورة (PIP)"
                                                    : "Picture-in-Picture"}
                                                </span>
                                                <div className="flex items-center justify-between text-[9px] text-white/70 font-sans">
                                                  <span>
                                                    {lang === "ar"
                                                      ? "تشغيل الفيديو المصغر:"
                                                      : "Activate PIP floating player:"}
                                                  </span>
                                                  <button
                                                    type="button"
                                                    onClick={async () => {
                                                      if (!videoRef.current)
                                                        return;
                                                      try {
                                                        if (
                                                          document.pictureInPictureElement
                                                        ) {
                                                          await document.exitPictureInPicture();
                                                        } else {
                                                          await videoRef.current.requestPictureInPicture();
                                                        }
                                                      } catch (err: any) {
                                                        console.error(
                                                          "Failed to toggle PiP:",
                                                          err,
                                                        );
                                                        showSwipeMessage(
                                                          lang === "ar"
                                                            ? "❌ PIP غير مدعوم في هذا المتصفح"
                                                            : "❌ PIP not supported in this browser",
                                                        );
                                                      }
                                                    }}
                                                    className={`px-3 py-1 rounded-xl text-[9px] font-bold transition-all border outline-none active:scale-95 cursor-pointer ${
                                                      isPipActive
                                                        ? "bg-teal-500/20 border-teal-400/40 text-teal-300 shadow-[0_0_8px_rgba(20,184,166,0.2)] font-extrabold"
                                                        : "bg-white/5 border-white/10 hover:bg-white/10 text-white/60"
                                                    }`}
                                                  >
                                                    {isPipActive
                                                      ? lang === "ar"
                                                        ? "نشط"
                                                        : "Active"
                                                      : lang === "ar"
                                                        ? "تفعيل"
                                                        : "Activate"}
                                                  </button>
                                                </div>
                                              </div>

                                              {/* Persistent Autoplay toggle */}
                                              <div className="flex flex-col gap-2 align-start text-left border-t border-white/10 pt-2">
                                                <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider flex items-center gap-1">
                                                  <PlayCircle className="w-3.5 h-3.5" />
                                                  {lang === "ar"
                                                    ? "التشغيل التلقائي المستمر"
                                                    : "Persistent Autoplay"}
                                                </span>
                                                <div className="flex items-center justify-between text-[9px] text-white/70 font-sans">
                                                  <span>
                                                    {lang === "ar"
                                                      ? "تشغيل المقطع التالي تلقائياً:"
                                                      : "Autoplay next video automatically:"}
                                                  </span>
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      const next =
                                                        !isPersistentAutoplayEnabled;
                                                      setIsPersistentAutoplayEnabled(
                                                        next,
                                                      );
                                                      localStorage.setItem(
                                                        "persistentAutoplayEnabled",
                                                        String(next),
                                                      );
                                                      showSwipeMessage(
                                                        lang === "ar"
                                                          ? next
                                                            ? "🔁 تشغيل تلقائي مستمر مفعّل"
                                                            : "⏸️ تشغيل تلقائي مستمر معطل"
                                                          : next
                                                            ? "🔁 Persistent Autoplay ON"
                                                            : "⏸️ Persistent Autoplay OFF",
                                                      );
                                                    }}
                                                    className={`px-3 py-1 rounded-xl text-[9px] font-bold transition-all border outline-none active:scale-95 cursor-pointer ${
                                                      isPersistentAutoplayEnabled
                                                        ? "bg-amber-500/20 border-amber-400/40 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.2)] font-extrabold"
                                                        : "bg-white/5 border-white/10 hover:bg-white/10 text-white/60"
                                                    }`}
                                                  >
                                                    {isPersistentAutoplayEnabled
                                                      ? lang === "ar"
                                                        ? "مفعّل"
                                                        : "Active"
                                                      : lang === "ar"
                                                        ? "غير مفعّل"
                                                        : "Disabled"}
                                                  </button>
                                                </div>
                                              </div>

                                              {/* Simulated Audiospatial Filters */}
                                              <div className="flex flex-col gap-1.5 align-start text-left border-t border-white/10 pt-2">
                                                <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider flex items-center gap-1">
                                                  <AudioLines className="w-3.5 h-3.5" />
                                                  {lang === "ar"
                                                    ? "محاكي الصوت المحيطي"
                                                    : "Spatial acoustics EQ"}
                                                </span>
                                                <div className="grid grid-cols-4 gap-1 text-[9px]">
                                                  {[
                                                    {
                                                      label: "Bypass",
                                                      val: "off",
                                                    },
                                                    {
                                                      label: "Bass",
                                                      val: "boost",
                                                    },
                                                    {
                                                      label: "Theater",
                                                      val: "theater",
                                                    },
                                                    {
                                                      label: "Vocals",
                                                      val: "vocals",
                                                    },
                                                  ].map((mode) => (
                                                    <button
                                                      key={mode.val}
                                                      onClick={() => {
                                                        setSpatialAudioMode(
                                                          mode.val as any,
                                                        );
                                                        showSwipeMessage(
                                                          lang === "ar"
                                                            ? `الصوت المحيطي: ${mode.label}`
                                                            : `Spatial Audio Profile: ${mode.label}`,
                                                        );
                                                      }}
                                                      className={`py-1 px-1 rounded text-[8px] truncate text-center font-bold transition-all ${
                                                        spatialAudioMode ===
                                                        mode.val
                                                          ? "bg-cyan-500 text-black font-extrabold"
                                                          : "bg-white/5 hover:bg-white/10 text-white/70"
                                                      }`}
                                                    >
                                                      {mode.label}
                                                    </button>
                                                  ))}
                                                </div>
                                              </div>

                                              {/* Technical Stats Section */}
                                              <div className="flex flex-col gap-1.5 border-t border-white/10 pt-2.5 items-start text-left">
                                                <span className="text-[10px] text-cyan-400 uppercase font-black tracking-wider flex items-center gap-1">
                                                  <Info className="w-3 h-3" />
                                                  {lang === "ar"
                                                    ? "البيانات الفنية للبث"
                                                    : "Technical Metadata"}
                                                </span>
                                                {videoTechnicalMeta ? (
                                                  <div className="w-full bg-black/40 rounded-xl p-2.5 border border-white/5 flex flex-col gap-1 font-mono text-[9px] text-white/70">
                                                    <div className="flex justify-between gap-4">
                                                      <span>
                                                        {lang === "ar"
                                                          ? "الأبعاد:"
                                                          : "Resolution:"}
                                                      </span>
                                                      <span className="text-white font-bold">
                                                        {
                                                          videoTechnicalMeta.resolution
                                                        }
                                                      </span>
                                                    </div>
                                                    <div className="flex justify-between gap-4">
                                                      <span>
                                                        {lang === "ar"
                                                          ? "الإطارات:"
                                                          : "Frame Rate:"}
                                                      </span>
                                                      <span className="text-white font-bold">
                                                        {videoTechnicalMeta.fps}{" "}
                                                        fps
                                                      </span>
                                                    </div>
                                                    <div className="flex justify-between gap-4">
                                                      <span>
                                                        {lang === "ar"
                                                          ? "الترميز:"
                                                          : "Codec:"}
                                                      </span>
                                                      <span
                                                        className="text-white font-bold truncate max-w-[110px]"
                                                        title={
                                                          videoTechnicalMeta.codec
                                                        }
                                                      >
                                                        {
                                                          videoTechnicalMeta.codec
                                                        }
                                                      </span>
                                                    </div>
                                                    <div className="flex justify-between gap-4">
                                                      <span>
                                                        {lang === "ar"
                                                          ? "معدل البت:"
                                                          : "Bitrate:"}
                                                      </span>
                                                      <span className="text-cyan-300 font-bold">
                                                        {
                                                          videoTechnicalMeta.bitrate
                                                        }
                                                      </span>
                                                    </div>
                                                  </div>
                                                ) : (
                                                  <span className="text-[10px] text-white/40 italic">
                                                    {lang === "ar"
                                                      ? "جاري تحميل البيانات..."
                                                      : "Loading media specs..."}
                                                  </span>
                                                )}
                                              </div>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 📡 STREAM METRICS & PROVIDER STATUS (VIDBOX STYLE) */}
                          {currentEpisode && (
                            <div className="bg-[#0A0A10]/90 backdrop-blur-strong border border-cyan-500/15 p-5 md:p-6 rounded-[30px] flex flex-col gap-5 text-left font-sans transition-all duration-300 shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
                              {/* Header section with ping action */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                                <div>
                                  <div className="flex items-center gap-2.5">
                                    <span className="flex h-2.5 w-2.5 relative">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F2FF] opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
                                    </span>
                                    <h4 className="text-sm font-black uppercase tracking-wider text-[#00F2FF] flex items-center gap-2">
                                      <span>
                                        {lang === "ar"
                                          ? "بوابات البث ومزودي الخدمة"
                                          : "📡 Connected Video Providers & Mirrors"}
                                      </span>
                                    </h4>
                                  </div>
                                  <p className="text-[11px] text-white/50 mt-1">
                                    {lang === "ar"
                                      ? "تغيير خادم البث لمعالجة انقطاع الاتصال ومراقبة الاستجابة وسرعة التحميل"
                                      : "Switch streaming server to resolve buffers, test response delay, and toggle proxy lanes"}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={runProviderPingTest}
                                  disabled={isPinging}
                                  className={`text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl border transition-all duration-300 flex items-center gap-1.5 ${
                                    isPinging
                                      ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 animate-pulse"
                                      : "bg-white/5 border-white/10 text-white hover:border-[#FF0080]/60 hover:text-[#FF0080]"
                                  }`}
                                >
                                  <FastForward
                                    className={`w-3 h-3 ${isPinging ? "animate-spin" : ""}`}
                                  />
                                  <span>
                                    {isPinging
                                      ? lang === "ar"
                                        ? "جاري الفحص..."
                                        : "Testing..."
                                      : lang === "ar"
                                        ? "فحص البنج العالمي"
                                        : "Validate Pings"}
                                  </span>
                                </button>
                              </div>

                              {/* Grid of providers as seen in vidbox.dev */}
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                                {[
                                  {
                                    id: "vidsrc-xyz",
                                    nameEn: "Vidbox Premium [XYZ]",
                                    nameAr: "سيرفر ويدبوكس فائق الجودة [XYZ]",
                                    tagline:
                                      "Reconfigured primary cloud network",
                                    quality: "4K Ultra",
                                    speed: "138 MB/s",
                                    type: "M3U8",
                                    ssl: true,
                                    subs: true,
                                    status: "online",
                                  },
                                  {
                                    id: "vidsrc-cc",
                                    nameEn: "VidSrc CC Fast",
                                    nameAr: "سيرفر ويدسورس CC السريع",
                                    tagline: "Decentralized high speed mirror",
                                    quality: "1080p Web",
                                    speed: "126 MB/s",
                                    type: "Adaptive",
                                    ssl: true,
                                    subs: true,
                                    status: "online",
                                  },
                                  {
                                    id: "vidsrc-in",
                                    nameEn: "VidSrc IN Domain",
                                    nameAr: "سيرفر ويدسورس IN المباشر",
                                    tagline:
                                      "Optimized high-bitrate latency pipeline",
                                    quality: "1080p Ultra",
                                    speed: "118 MB/s",
                                    type: "MP4 Live",
                                    ssl: true,
                                    subs: true,
                                    status: "online",
                                  },
                                  {
                                    id: "vidsrc-pm",
                                    nameEn: "VidSrc PM Multi",
                                    nameAr: "مسار ويدسورس PM المتعدد",
                                    tagline:
                                      "Encrypted geo-distributed stream lane",
                                    quality: "1080p HDR",
                                    speed: "110 MB/s",
                                    type: "Secure TS",
                                    ssl: true,
                                    subs: true,
                                    status: "online",
                                  },
                                  {
                                    id: "vidbox-ultra",
                                    nameEn: "VidSrc TO Standard",
                                    nameAr: "سيرفر ويدسورس TO القياسي",
                                    tagline:
                                      "Standard high-capacity server node",
                                    quality: "1080p Web",
                                    speed: "104 MB/s",
                                    type: "Adaptive",
                                    ssl: true,
                                    subs: true,
                                    status: "online",
                                  },
                                  {
                                    id: "hls-cyber",
                                    nameEn: "CyberCloud VIP Mirror",
                                    nameAr: "مسار الغيمة السيبرانية الرقمية",
                                    tagline:
                                      "Multi-subtitle secure proxy lanes",
                                    quality: "1080p Fast",
                                    speed: "98 MB/s",
                                    type: "HLS Live",
                                    ssl: true,
                                    subs: true,
                                    status: "online",
                                  },
                                  {
                                    id: "super-fast",
                                    nameEn: "Direct Transcode Core",
                                    nameAr: "نواة المعالجة المباشرة والترجمة",
                                    tagline: "High speed direct stream tunnel",
                                    quality: "720p Std",
                                    speed: "92 MB/s",
                                    type: "Direct TS",
                                    ssl: true,
                                    subs: true,
                                    status: "online",
                                  },
                                  {
                                    id: "vidsrc-pro",
                                    nameEn: "VidSrc PRO Secure",
                                    nameAr: "سيرفر ويدسورس المحمي PRO",
                                    tagline:
                                      "Premium redundant secondary gateway",
                                    quality: "1080p HDR",
                                    speed: "88 MB/s",
                                    type: "M3U8",
                                    ssl: true,
                                    subs: true,
                                    status: "online",
                                  },
                                  {
                                    id: "autoembed-co",
                                    nameEn: "AutoEmbed Backup",
                                    nameAr: "سيرفر أوتوإمبيد الاحتياطي",
                                    tagline:
                                      "Global proxy fallback proxy mirror",
                                    quality: "720p Std",
                                    speed: "81 MB/s",
                                    type: "HTTP TS",
                                    ssl: true,
                                    subs: false,
                                    status: "online",
                                  },
                                ].map((p) => {
                                  const isActive = activeProviderId === p.id;
                                  const latency = providerPings[p.id] || 999;
                                  const isFast = latency < 40;
                                  const isMedium =
                                    latency >= 40 && latency < 100;

                                  return (
                                    <div
                                      key={p.id}
                                      onClick={() =>
                                        handleSelectProvider(p.id, p.nameEn)
                                      }
                                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-300 relative select-none flex flex-col justify-between gap-3 text-left ${
                                        isActive
                                          ? "bg-gradient-to-br from-cyan-950/40 to-black border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.15)] scale-[1.02]"
                                          : "bg-[#12121A]/50 border-white/5 hover:border-white/20 hover:bg-[#12121A]/80"
                                      }`}
                                    >
                                      {/* Badge & latency */}
                                      <div className="flex items-center justify-between gap-2">
                                        <span
                                          className={`h-1.5 w-1.5 rounded-full ${p.status === "online" ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`}
                                        />

                                        <div className="flex items-center gap-1.5">
                                          <span
                                            className={`text-[10px] font-black font-mono tracking-tighter ${isFast ? "text-emerald-400" : isMedium ? "text-cyan-400" : "text-amber-500"}`}
                                          >
                                            ⚡ {latency}ms
                                          </span>
                                        </div>
                                      </div>

                                      {/* Server name */}
                                      <div>
                                        <h5 className="text-[11px] font-black font-sans text-white uppercase tracking-wide leading-tight group-hover:text-cyan-300">
                                          {lang === "ar" ? p.nameAr : p.nameEn}
                                        </h5>
                                        <p className="text-[9px] text-white/40 mt-1 line-clamp-1">
                                          {p.tagline}
                                        </p>
                                      </div>

                                      {/* Metrics parameters */}
                                      <div className="flex items-center justify-between gap-1 border-t border-white/5 pt-2 text-[9px]">
                                        <div className="flex items-center gap-1">
                                          <span className="bg-white/5 px-1 py-0.5 rounded text-white/60 font-mono font-bold">
                                            {p.quality}
                                          </span>
                                          <span className="bg-white/5 px-1 py-0.5 rounded text-cyan-300 font-mono">
                                            {p.speed}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px]/none">
                                          {p.ssl && (
                                            <span title="SSL Secure Connection">
                                              🔒
                                            </span>
                                          )}
                                          {p.subs && (
                                            <span title="Softcoded Subtitles Embedded">
                                              💬
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Connected indicator tag */}
                                      {isActive && (
                                        <div className="absolute top-2 right-2 bg-gradient-to-r from-cyan-500 to-[#FF0080] text-black text-[7px] font-black uppercase tracking-wider px-1 rounded">
                                          {lang === "ar" ? "نشط" : "ACTIVE"}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Connection Logs Panel / Terminal */}
                              <div className="bg-black/95 rounded-2xl border border-white/10 p-3.5 flex flex-col gap-2">
                                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                  <span className="text-[10px] text-zinc-400 font-black tracking-widest uppercase font-mono flex items-center gap-1.5">
                                    <span className="flex h-1.5 w-1.5 rounded-full bg-red-500"></span>
                                    <span className="flex h-1.5 w-1.5 rounded-full bg-yellow-500"></span>
                                    <span className="flex h-1.5 w-1.5 rounded-full bg-green-500"></span>
                                    <span className="ml-1">
                                      {lang === "ar"
                                        ? "منصة فحص أداء المزود وتفاصيل التجزئة"
                                        : "🖥️ Vidbox Core Dev Logs & Streaming Chunk Engine"}
                                    </span>
                                  </span>

                                  <span className="text-[9px] text-cyan-400 font-mono">
                                    HLS.js 1.4.15 •{" "}
                                    {activeProviderId.toUpperCase()}
                                  </span>
                                </div>

                                <div className="h-[90px] overflow-y-auto font-mono text-[9px] text-emerald-400 flex flex-col gap-1 text-left custom-scrollbar leading-relaxed">
                                  {activeLogs.map((log, idx) => (
                                    <div
                                      key={idx}
                                      className="hover:bg-white/5 px-1 rounded transition-colors"
                                    >
                                      {log}
                                    </div>
                                  ))}
                                  {isPinging && (
                                    <div className="text-cyan-400 animate-pulse">
                                      {
                                        "[>>>] ICMP pinging all nodes to optimize content packet loss buffers..."
                                      }
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Download and Offline action button bar */}
                          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#1A1A2E]/60 p-4 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-white/50">
                                {t("videoSource")}:
                              </span>
                              <span className="text-xs font-mono text-cyan-300 break-all select-all bg-black/40 px-3 py-1 rounded">
                                {currentEpisode?.videoUrl
                                  ? activeProviderId === "vidbox-ultra"
                                    ? currentEpisode.videoUrl
                                    : `${currentEpisode.videoUrl.split("?")[0]}?provider=${activeProviderId}&secure=true`
                                  : "Fallback player stream active"}
                              </span>
                            </div>

                            <button
                              onClick={handleDownloadOfflineSimulation}
                              className={`text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                                downloadState === "done"
                                  ? "bg-emerald-600 text-white"
                                  : downloadState === "loading"
                                    ? "bg-[#FF0080] text-white animate-pulse"
                                    : "bg-white/5 border border-white/10 text-cyan-400 hover:bg-white/10"
                              }`}
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>
                                {downloadState === "done"
                                  ? t("downloadComplete")
                                  : downloadState === "loading"
                                    ? t("downloading")
                                    : t("offlineDownload")}
                              </span>
                            </button>
                          </div>

                          {/* EPISODES DISCOVERY CAROUSEL */}
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-purple-950/20 to-cyan-950/20 p-4 rounded-2xl border border-white/5">
                              <h3 className="text-md font-black italic tracking-wide text-[#00F2FF]">
                                {t("series")} - {t("latest")}
                              </h3>
                              {episodes.length > 0 && (
                                <button
                                  onClick={handleBatchDownloadSeasonAnimation}
                                  className={`text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95 ${
                                    seriesDownloadState === "done"
                                      ? "bg-emerald-600 text-white shadow-emerald-700/20"
                                      : seriesDownloadState === "loading"
                                        ? "bg-gradient-to-r from-[#FF0080] to-purple-800 text-white shadow-[#FF0080]/20 animate-pulse"
                                        : "bg-[#FF0080]/20 border border-[#FF0080]/30 hover:bg-[#FF0080]/30 text-pink-300"
                                  }`}
                                >
                                  <Download
                                    className={`w-3.5 h-3.5 ${seriesDownloadState === "loading" ? "animate-bounce" : ""}`}
                                  />
                                  <span>
                                    {seriesDownloadState === "done"
                                      ? {
                                          ar: "تم تنزيل الموسم بالكامل! 🤩🏕️",
                                          en: "Complete Season Downloaded! 🤩🏕️",
                                          fr: "Saison complète téléchargée ! 🤩🏕️",
                                          de: "Komplette Staffel heruntergeladen! 🤩🏕️",
                                          es: "¡Temporada completa descargada! 🤩🏕️",
                                          it: "Stagione completa scaricata! 🤩🏕️",
                                        }[lang] ||
                                        "Complete Season Downloaded! 🤩🏕️"
                                      : seriesDownloadState === "loading"
                                        ? `${
                                            {
                                              ar: "جاري التحميل كحزمة واحدة",
                                              en: "Batch Downloading Season",
                                              fr: "Téléchargement en lot de la saison",
                                              de: "Staffel wird heruntergeladen",
                                              es: "Descargando temporada",
                                              it: "Scaricando la stagione",
                                            }[lang] || "Batch Downloading..."
                                          } (${seriesDownloadProgress}%)`
                                        : {
                                            ar: "تنزيل السلسلة (الموسم بالكامل) 📥",
                                            en: "Download Series (Full Season) 📥",
                                            fr: "Télécharger la série (Saison complète) 📥",
                                            de: "Serie herunterladen (Ganze Staffel) 📥",
                                            es: "Descargar serie (Temporada completa) 📥",
                                            it: "Scarica la serie (Stagione completa) 📥",
                                          }[lang] ||
                                          "Download Series (Full Season) 📥"}
                                  </span>
                                </button>
                              )}
                            </div>

                            {/* KID-FRIENDLY BATCH DOWNLOAD DETAILED PROGRESS WINDOW */}
                            {seriesDownloadState === "loading" && (
                              <div className="bg-[#1A1A2E]/90 border border-[#FF0080]/30 rounded-3xl p-5 flex flex-col gap-3 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF0080]/5 rounded-full blur-xl pointer-events-none" />

                                <div className="flex items-center justify-between gap-4 z-10">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-[#FF0080]/20 rounded-xl text-pink-400">
                                      <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="font-extrabold text-xs text-white">
                                        {lang === "ar"
                                          ? "رحلة حفظ الموسم أوفلاين! 🎒✨"
                                          : "Saving Season to Offline Backpack! 🎒✨"}
                                      </span>
                                      <span className="text-[10px] text-pink-300 font-bold">
                                        {getOfflineCuteStepMessage(
                                          seriesDownloadProgress,
                                          lang,
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                  <span className="text-sm font-black text-[#00F2FF]">
                                    {seriesDownloadProgress}%
                                  </span>
                                </div>

                                {/* Outer Progress bar */}
                                <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/10 z-10">
                                  <div
                                    className="h-full bg-gradient-to-r from-[#FF0080] via-purple-500 to-[#00F2FF] rounded-full transition-all duration-300"
                                    style={{
                                      width: `${seriesDownloadProgress}%`,
                                    }}
                                  />
                                </div>

                                <div className="flex justify-between items-center text-[9px] text-white/40 font-mono z-10">
                                  <span>
                                    {lang === "ar"
                                      ? `حلقة ${currentDownloadEpisodeIndex + 1} من ${episodes.length}`
                                      : `Saving ep ${currentDownloadEpisodeIndex + 1} of ${episodes.length}`}
                                  </span>
                                  <span className="text-[#00F2FF] font-semibold truncate max-w-[180px]">
                                    {episodes[currentDownloadEpisodeIndex]
                                      ?.title[lang] ||
                                      episodes[currentDownloadEpisodeIndex]
                                        ?.title.en}
                                  </span>
                                </div>
                              </div>
                            )}

                            {episodes.length === 0 ? (
                              <div className="bg-white/5 rounded-2xl p-6 text-center text-xs text-white/40">
                                No episodes uploaded for this series yet. Add
                                some in the Parent secure portal.
                              </div>
                            ) : (
                              <>
                                {/* EPISODE LIST CONTROLS */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 border-b border-white/5 pb-4">
                                  <div className="flex items-center gap-3">
                                    <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                                      <List className="w-5 h-5 text-purple-400" />
                                      {lang === "ar" ? "الحلقات" : "Episodes"}
                                      <span className="text-white/40 text-xs px-2 py-0.5 bg-white/10 rounded-full">
                                        {episodes.length}
                                      </span>
                                    </h3>
                                    <button
                                      onClick={() =>
                                        setIsEpisodesCollapsed(
                                          !isEpisodesCollapsed,
                                        )
                                      }
                                      className="text-xs font-bold text-cyan-400 bg-cyan-400/10 px-3 py-1.5 rounded-xl hover:bg-cyan-400/20 active:scale-95 transition-all flex items-center gap-1.5 border border-cyan-400/20"
                                      title={
                                        isEpisodesCollapsed
                                          ? "Expand Episode List"
                                          : "Collapse Episode List"
                                      }
                                    >
                                      {isEpisodesCollapsed ? (
                                        <>
                                          <ChevronDown className="w-3.5 h-3.5" />
                                          <span>
                                            {lang === "ar"
                                              ? "عرض الحلقات"
                                              : "Show Episodes"}
                                          </span>
                                        </>
                                      ) : (
                                        <>
                                          <ChevronUp className="w-3.5 h-3.5" />
                                          <span>
                                            {lang === "ar"
                                              ? "إخفاء الحلقات"
                                              : "Hide Episodes"}
                                          </span>
                                        </>
                                      )}
                                    </button>
                                  </div>

                                  {!isEpisodesCollapsed && (
                                    <div className="flex items-center gap-2 bg-[#0F0F1A] border border-white/5 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto scrollbar-hide">
                                      <button
                                        onClick={() => setEpisodeFilter("all")}
                                        className={`flex-1 sm:flex-none text-xs px-4 py-2 rounded-xl transition-all font-bold whitespace-nowrap ${episodeFilter === "all" ? "bg-[#FF0080] text-white shadow-[0_0_15px_rgba(255,0,128,0.3)]" : "text-white/50 hover:text-white hover:bg-white/5"}`}
                                      >
                                        {lang === "ar" ? "الكل" : "All"}
                                      </button>
                                      <button
                                        onClick={() =>
                                          setEpisodeFilter("unwatched")
                                        }
                                        className={`flex-1 sm:flex-none text-xs px-4 py-2 rounded-xl transition-all font-bold whitespace-nowrap ${episodeFilter === "unwatched" ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,242,255,0.3)]" : "text-white/50 hover:text-white hover:bg-white/5"}`}
                                      >
                                        {lang === "ar"
                                          ? "لم تُشاهد"
                                          : "Unwatched"}
                                      </button>
                                      <button
                                        onClick={() =>
                                          setEpisodeFilter("favorites")
                                        }
                                        className={`flex-1 sm:flex-none text-xs px-4 py-2 rounded-xl transition-all font-bold flex items-center justify-center gap-1.5 whitespace-nowrap ${episodeFilter === "favorites" ? "bg-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.3)]" : "text-white/50 hover:text-white hover:bg-white/5"}`}
                                      >
                                        <Heart
                                          className={`w-3 h-3 ${episodeFilter === "favorites" ? "fill-current" : ""}`}
                                        />
                                        {lang === "ar"
                                          ? "المفضلة"
                                          : "Favorites"}
                                      </button>
                                      <button
                                        onClick={() =>
                                          setEpisodeFilter("queue")
                                        }
                                        className={`flex-1 sm:flex-none text-xs px-4 py-2 rounded-xl transition-all font-bold flex items-center justify-center gap-1.5 whitespace-nowrap ${episodeFilter === "queue" ? "bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]" : "text-white/50 hover:text-white hover:bg-white/5"}`}
                                      >
                                        <ListMusic className="w-3.5 h-3.5" />
                                        <span>
                                          {lang === "ar"
                                            ? `الانتظار (${playbackQueue.length})`
                                            : `Queue (${playbackQueue.length})`}
                                        </span>
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {!isEpisodesCollapsed ? (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 transition-all duration-300">
                                    {(() => {
                                      const displayedEpisodes =
                                        episodeFilter === "queue"
                                          ? playbackQueue
                                          : episodes.filter((ep) => {
                                              if (
                                                episodeFilter === "unwatched"
                                              ) {
                                                const pct = currentProfile
                                                  ? episodeProgressMap[
                                                      `${currentProfile.id}_${ep.id}`
                                                    ] || 0
                                                  : 0;
                                                return pct < 90;
                                              }
                                              if (
                                                episodeFilter === "favorites"
                                              ) {
                                                return episodeFavorites.includes(
                                                  ep.id,
                                                );
                                              }
                                              return true;
                                            });

                                      if (displayedEpisodes.length === 0) {
                                        return (
                                          <div className="col-span-full bg-white/5 rounded-2xl p-8 text-center text-xs text-white/40 border border-dashed border-white/15 flex flex-col items-center justify-center gap-3">
                                            <ListMusic className="w-8 h-8 text-amber-500 animate-pulse" />
                                            <span className="font-extrabold text-white text-sm">
                                              {episodeFilter === "queue"
                                                ? lang === "ar"
                                                  ? "قائمة الانتظار فارغة"
                                                  : "Your Playback Queue is Empty"
                                                : episodeFilter === "favorites"
                                                  ? lang === "ar"
                                                    ? "المفضلة فارغة"
                                                    : "No Favorite Episodes yet"
                                                  : lang === "ar"
                                                    ? "لا توجد حلقات للمشاهدة"
                                                    : "No Episodes found"}
                                            </span>
                                            <p className="max-w-xs text-[11px] text-white/40">
                                              {episodeFilter === "queue"
                                                ? lang === "ar"
                                                  ? 'أضف حلقات من القائمة بالضغط على زر "قائمة الانتظار" لتشغيل متتالي تلقائي.'
                                                  : 'Add some episodes using the "Queue" button to watch automatically when the current one ends.'
                                                : lang === "ar"
                                                  ? "انقر على أيقونة القلب على أي حلقة لحفظها في قائمتك المفضلة."
                                                  : "Click the heart button on any episode to list them here."}
                                            </p>
                                          </div>
                                        );
                                      }

                                      return displayedEpisodes.map((ep) => {
                                        const isCurrent =
                                          currentEpisode?.id === ep.id;
                                        const isQueued = playbackQueue.some(
                                          (q) => q.id === ep.id,
                                        );
                                        return (
                                          <div
                                            key={ep.id}
                                            onClick={() => {
                                              setCurrentEpisode(ep);
                                              setIsPlaying(true);
                                              const savedPct = currentProfile
                                                ? episodeProgressMap[
                                                    `${currentProfile.id}_${ep.id}`
                                                  ] || 0
                                                : 0;
                                              setVideoProgress(savedPct);
                                            }}
                                            className={`flex flex-col bg-[#1A1A2E]/80 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden relative group/ep ${
                                              isCurrent
                                                ? "border-cyan-400 scale-[1.02] shadow-xl shadow-cyan-400/20 bg-white/5"
                                                : "border-white/5 hover:border-white/15 hover:bg-white/5"
                                            }`}
                                          >
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleToggleEpisodeFavorite(
                                                  ep.id,
                                                );
                                              }}
                                              className="absolute top-3 right-3 bg-black/50 backdrop-blur-md p-2 rounded-full z-10 hover:bg-black/95 transition-all opacity-0 group-hover/ep:opacity-100 hover:scale-110 shadow-lg border border-white/10"
                                            >
                                              <Heart
                                                className={`w-4 h-4 ${episodeFavorites.includes(ep.id) ? "fill-rose-500 text-rose-500" : "text-white"}`}
                                              />
                                            </button>

                                            {/* Add to Playback Queue Button */}
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                if (isQueued) {
                                                  removeFromQueue(ep.id);
                                                } else {
                                                  addToQueue(ep);
                                                }
                                              }}
                                              className={`absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-xl z-10 hover:bg-black/90 hover:scale-105 transition-all flex items-center gap-1 shadow-lg border border-white/10 ${isQueued ? "opacity-100 border-emerald-500/30 font-black" : "opacity-0 group-hover/ep:opacity-100"}`}
                                            >
                                              {isQueued ? (
                                                <>
                                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                  <span className="text-emerald-400 text-[9px] font-black tracking-wider uppercase">
                                                    {lang === "ar"
                                                      ? "مضاف"
                                                      : "Queued"}
                                                  </span>
                                                </>
                                              ) : (
                                                <>
                                                  <Plus className="w-3.5 h-3.5 text-cyan-400" />
                                                  <span className="text-cyan-300 text-[9px] font-black tracking-wider uppercase">
                                                    {lang === "ar"
                                                      ? "الانتظار"
                                                      : "Queue"}
                                                  </span>
                                                </>
                                              )}
                                            </button>

                                            <div className="relative w-full aspect-video bg-black shrink-0">
                                              <img
                                                src={
                                                  ep.thumbnail ||
                                                  activeVideo?.poster ||
                                                  activeVideo?.banner ||
                                                  "https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=400"
                                                }
                                                alt={
                                                  ep.title[lang] || ep.title.en
                                                }
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover/ep:scale-105"
                                                loading="lazy"
                                                decoding="async"
                                                onError={handleImgError}
                                              />
                                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

                                              {/* Integrated High-Contrast Duration Marker & Icon */}
                                              <span className="absolute bottom-3 right-3 text-[10px] sm:text-xs font-black font-mono text-white bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/15 shadow-xl flex items-center gap-1.5 z-10">
                                                <Watch className="w-3.5 h-3.5 text-cyan-400" />
                                                {ep.duration}
                                              </span>

                                              {isCurrent && (
                                                <div className="absolute inset-0 bg-cyan-400/25 flex items-center justify-center backdrop-blur-[1.5px]">
                                                  <Play className="w-14 h-14 text-white fill-white shadow-2xl drop-shadow-[0_0_20px_rgba(34,211,238,0.7)] animate-pulse" />
                                                </div>
                                              )}
                                              {/* Watched Progress Indicator */}
                                              {(() => {
                                                const epProg = currentProfile
                                                  ? episodeProgressMap[
                                                      `${currentProfile.id}_${ep.id}`
                                                    ] || 0
                                                  : 0;
                                                if (epProg > 0) {
                                                  return (
                                                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
                                                      <div
                                                        className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_12px_rgba(34,211,238,0.9)]"
                                                        style={{
                                                          width: `${Math.min(epProg, 100)}%`,
                                                        }}
                                                      />
                                                    </div>
                                                  );
                                                }
                                                return null;
                                              })()}
                                            </div>
                                            <div className="p-5 flex flex-col gap-2 flex-1 w-full bg-[#111122]/60 bg-gradient-to-b from-[#1A1A2E]/30 to-transparent">
                                              <div className="flex items-center justify-between gap-2 w-full">
                                                <p
                                                  className={`font-black text-base line-clamp-1 flex-1 transition-colors ${isCurrent ? "text-cyan-400 animate-pulse" : "text-white group-hover/ep:text-cyan-400"}`}
                                                >
                                                  E{ep.episodeNumber}:{" "}
                                                  {ep.title[lang] ||
                                                    ep.title.en}
                                                </p>
                                              </div>
                                              <p className="text-[11px] sm:text-xs text-white/50 line-clamp-2 leading-relaxed">
                                                {ep.description[lang] ||
                                                  ep.description.en}
                                              </p>
                                            </div>
                                          </div>
                                        );
                                      });
                                    })()}
                                  </div>
                                ) : (
                                  <div
                                    onClick={() =>
                                      setIsEpisodesCollapsed(false)
                                    }
                                    className="bg-[#111122]/40 backdrop-blur-sm rounded-2xl p-8 text-center text-xs text-white/50 cursor-pointer border border-dashed border-white/15 hover:border-cyan-400/40 hover:bg-[#111122]/80 transition-all duration-300 group flex flex-col items-center justify-center gap-2 shadow-2xl"
                                  >
                                    <List className="w-8 h-8 text-cyan-400 mb-1 animate-bounce" />
                                    <span className="font-extrabold text-white text-sm">
                                      {lang === "ar"
                                        ? "تم طي قائمة الحلقات"
                                        : "Episode List Collapsed"}
                                    </span>
                                    <span className="text-[11px] text-white/40">
                                      {lang === "ar"
                                        ? "انقر هنا لإعادتها أو إظهارها لتعديل حجم الشاشة."
                                        : "Click anywhere on this bar to expand and reveal the episodes grid."}
                                    </span>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {/* CLIENTS REVIEWS, SPONSOR ADS BLOCK - Right sidebar */}
                        {!isTheaterMode && (
                          <div className="flex flex-col gap-6">
                            {/* --- WATCH PARTY TAB SWITCHER --- */}
                            {watchPartyId && (
                              <div className="flex bg-black/60 p-1.5 rounded-2xl border border-white/5 gap-2">
                                <button
                                  onClick={() => setActiveSidebarTab("chat")}
                                  className={`flex-1 py-1.5 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-1.5 ${
                                    activeSidebarTab === "chat"
                                      ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/10 font-bold"
                                      : "text-white/60 hover:text-white hover:bg-white/5 font-bold"
                                  }`}
                                >
                                  <MessageSquare className="w-4 h-4" />
                                  <span>
                                    {lang === "ar"
                                      ? "محادثات الحفلة 🍿"
                                      : "Live Chat 🍿"}
                                  </span>
                                </button>
                                <button
                                  onClick={() => setActiveSidebarTab("reviews")}
                                  className={`flex-1 py-1.5 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-1.5 ${
                                    activeSidebarTab === "reviews"
                                      ? "bg-pink-500 text-white shadow-lg shadow-pink-500/10 font-bold"
                                      : "text-white/60 hover:text-white hover:bg-white/5 font-bold"
                                  }`}
                                >
                                  <Star className="w-4 h-4" />
                                  <span>
                                    {lang === "ar"
                                      ? "التقييمات ⭐"
                                      : "Reviews ⭐"}
                                  </span>
                                </button>
                              </div>
                            )}

                            {/* --- WATCH PARTY LIVE SIDEBAR CHAT PANEL --- */}
                            {watchPartyId && activeSidebarTab === "chat" ? (
                              <div className="flex flex-col gap-4 bg-gradient-to-b from-[#0B0B14] to-[#121226] border border-cyan-500/15 p-5 rounded-[30px] shadow-2xl relative overflow-hidden h-[550px]">
                                {/* Inner soft blur */}
                                <div className="absolute -top-10 -left-10 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

                                {/* Section Title & Presence Bead */}
                                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400">
                                      {lang === "ar"
                                        ? "الأصدقاء في الحفلة"
                                        : "Party Friends"}
                                    </h3>
                                  </div>
                                  <span className="text-[10px] font-mono text-white/50 bg-white/5 px-2 py-0.5 rounded-lg border border-white/10">
                                    {watchPartyRoom?.users?.length || 1}{" "}
                                    {lang === "ar" ? "نشط" : "active"}
                                  </span>
                                </div>

                                {/* Party Active Avatars / Presence */}
                                <div className="flex flex-wrap items-center gap-1.5 bg-black/40 p-3 rounded-2xl border border-white/5 max-h-[85px] overflow-y-auto">
                                  {watchPartyRoom?.users?.map((usr: any) => (
                                    <div
                                      key={usr.id}
                                      className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-xl border border-white/5 hover:bg-white/10 transition-colors"
                                    >
                                      <span className="text-sm">
                                        {usr.avatar || "🐼"}
                                      </span>
                                      <span
                                        className="text-[10px] font-bold text-white/95"
                                        style={{ color: usr.color || "#fff" }}
                                      >
                                        {usr.name}
                                      </span>
                                      {watchPartyRoom?.hostId === usr.id && (
                                        <Crown
                                          className="w-3 h-3 text-amber-400 fill-amber-400/20"
                                          title="Host"
                                        />
                                      )}
                                    </div>
                                  )) || (
                                    <div className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-xl border border-white/5">
                                      <span className="text-sm">
                                        {currentProfile?.avatar || "🐼"}
                                      </span>
                                      <span className="text-[10px] font-bold text-white/95">
                                        {currentProfile?.name}
                                      </span>
                                      <Crown className="w-3 h-3 text-amber-400 fill-amber-400/20" />
                                    </div>
                                  )}
                                </div>

                                {/* Messages Scrollbox */}
                                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 scrollbar-thin scrollbar-thumb-white/10">
                                  {watchPartyRoom?.messages &&
                                  watchPartyRoom.messages.length > 0 ? (
                                    watchPartyRoom.messages.map((msg: any) => {
                                      const isMe =
                                        msg.userId === currentProfile?.id;
                                      if (msg.system) {
                                        return (
                                          <div
                                            key={msg.id}
                                            className="text-center py-1 text-[9px] font-black uppercase tracking-wider text-pink-400 bg-[#FF0080]/10 rounded-lg px-2 border border-pink-500/10"
                                          >
                                            {msg.text}
                                          </div>
                                        );
                                      }
                                      return (
                                        <div
                                          key={msg.id}
                                          className={`flex flex-col max-w-[85%] ${isMe ? "self-end items-end" : "self-start items-start"}`}
                                        >
                                          <div className="flex items-center gap-1 mb-0.5">
                                            <span className="text-sm">
                                              {msg.userAvatar || "🐼"}
                                            </span>
                                            <span className="text-[9px] font-black text-white/50 uppercase">
                                              {msg.userName}
                                            </span>
                                          </div>
                                          <div
                                            className={`px-3 py-2 rounded-2xl text-[11px] leading-relaxed break-words font-semibold ${
                                              isMe
                                                ? "bg-gradient-to-r from-[#00F2FF] to-cyan-500 text-black rounded-tr-none font-bold"
                                                : "bg-white/10 text-white rounded-tl-none border border-white/5"
                                            }`}
                                          >
                                            {msg.text}
                                          </div>
                                          <span className="text-[8px] text-white/30 mt-0.5 px-1">
                                            {new Date(
                                              msg.timestamp,
                                            ).toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </span>
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none bg-black/20 rounded-2xl border border-white/5">
                                      <span className="text-2xl animate-bounce">
                                        🍿
                                      </span>
                                      <p className="text-[11px] font-bold text-white/40 mt-3 capitalize text-center">
                                        {lang === "ar"
                                          ? "لا توجد رسائل بعد! اكتب شيئاً لطيفاً!"
                                          : "No chats yet! Say hello to friends!"}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* Live Chat Form input */}
                                <form
                                  onSubmit={handleSendChatMessage}
                                  className="flex items-center gap-1.5 pt-2 border-t border-[#00F2FF]/10"
                                >
                                  <input
                                    type="text"
                                    value={chatInputText}
                                    onChange={(e) =>
                                      setChatInputText(e.target.value)
                                    }
                                    placeholder={
                                      lang === "ar"
                                        ? "اكتب رسالة لأصدقائك..."
                                        : "Type a message..."
                                    }
                                    className="flex-1 bg-black/60 border border-white/10 text-white text-[11px] px-3.5 py-2 rounded-2xl outline-none focus:border-cyan-400 transition-colors"
                                  />
                                  <button
                                    type="submit"
                                    className="p-2.5 rounded-2xl bg-cyan-500 text-black hover:bg-cyan-400 transition-all font-bold active:scale-95 shadow-lg shadow-cyan-400/15 cursor-pointer"
                                  >
                                    <Send className="w-4 h-4" />
                                  </button>
                                </form>
                              </div>
                            ) : (
                              <>
                                {/* INTERACTIVE COSMIC STAR-RATING COMPONENT */}
                                <div className="bg-gradient-to-br from-[#0B0B14] to-[#121226] border border-cyan-500/15 p-5 rounded-3xl flex flex-col gap-4 relative overflow-hidden group/rating shadow-xl">
                                  {/* Animated background cosmic blur */}
                                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#00F2FF]/5 rounded-full blur-2xl pointer-events-none group-hover/rating:bg-[#00F2FF]/10 transition-colors duration-500" />

                                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                    <div className="flex flex-col">
                                      <h3 className="text-xs font-black uppercase text-pink-400 tracking-wider">
                                        {lang === "ar"
                                          ? "⭐ تقييم المغامرة السحرية"
                                          : "⭐ Cosmic Adventure Rating"}
                                      </h3>
                                      <span className="text-[10px] text-white/50 leading-normal">
                                        {lang === "ar"
                                          ? "صوّت لرأيك في هذا الفيديو الممتع!"
                                          : "How fun was this watch? Vote now!"}
                                      </span>
                                    </div>
                                    <div className="bg-white/5 px-2.5 py-1 rounded-xl border border-white/10 flex items-center gap-1">
                                      <Star className="w-3 h-3 text-amber-400 fill-current" />
                                      <span className="text-[11px] font-mono font-bold text-white">
                                        {(activeVideo.rating || 5.0).toFixed(1)}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Star container */}
                                  <div className="flex flex-col items-center gap-3 bg-black/40 p-3 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-2">
                                      {[1, 2, 3, 4, 5].map((stars) => {
                                        const isStarred =
                                          hoveredStars !== null
                                            ? stars <= hoveredStars
                                            : stars <=
                                              (userRatings[activeVideo.id] ||
                                                0);
                                        const isCurrentAverage =
                                          !hoveredStars &&
                                          !userRatings[activeVideo.id] &&
                                          stars <=
                                            Math.round(activeVideo.rating || 5);

                                        return (
                                          <button
                                            key={stars}
                                            type="button"
                                            onMouseEnter={() =>
                                              setHoveredStars(stars)
                                            }
                                            onMouseLeave={() =>
                                              setHoveredStars(null)
                                            }
                                            onClick={() =>
                                              handleRateVideo(
                                                activeVideo.id,
                                                stars,
                                              )
                                            }
                                            disabled={
                                              ratingSubmitLoading ===
                                              activeVideo.id
                                            }
                                            className="relative p-1 focus:outline-none transition-transform hover:scale-125 duration-200 active:scale-90"
                                            title={`Rate ${stars} Stars`}
                                            id={`star-btn-${stars}`}
                                          >
                                            <Star
                                              className={`w-7 h-7 transition-all duration-300 ${
                                                isStarred
                                                  ? "text-amber-400 fill-current drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                                                  : isCurrentAverage
                                                    ? "text-amber-500/40 fill-current"
                                                    : "text-white/20 hover:text-white/40"
                                              }`}
                                            />
                                          </button>
                                        );
                                      })}
                                    </div>

                                    {/* Mood text response helper */}
                                    <div className="min-h-[16px] text-center">
                                      {hoveredStars ||
                                      userRatings[activeVideo.id] ? (
                                        <span className="text-[10px] font-bold text-cyan-300 animate-pulse">
                                          {getCosmicMoodText(
                                            hoveredStars ||
                                              userRatings[activeVideo.id],
                                            lang,
                                          )}
                                        </span>
                                      ) : (
                                        <span className="text-[9px] text-white/30 italic">
                                          {lang === "ar"
                                            ? "مرر الماوس فوق النجوم لاختيار تقييمك"
                                            : "Hover or tap to adjust rating"}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Feedback Alerts / Message boxes */}
                                  {ratingSuccessMessage === activeVideo.id && (
                                    <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-[10px] font-semibold p-2.5 rounded-xl text-center flex items-center justify-center gap-1.5 animate-scale-up">
                                      <span>🎉</span>
                                      <span>
                                        {lang === "ar"
                                          ? "تم تسجيل تقييمك بنجاح! شكراً لك! ❤️🚀"
                                          : "Cosmic vote registered successfully! ❤️🚀"}
                                      </span>
                                    </div>
                                  )}

                                  {ratingSubmitLoading === activeVideo.id && (
                                    <div className="flex items-center justify-center gap-2 text-white/50 text-[10px] py-1">
                                      <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                                      <span>
                                        {lang === "ar"
                                          ? "جاري الحفظ في الخادم..."
                                          : "Beam-casting rating..."}
                                      </span>
                                    </div>
                                  )}

                                  {/* Rating summary analysis log stats */}
                                  <div className="flex justify-between items-center text-[10px] text-white/40 font-bold px-1 select-none">
                                    <span>
                                      {lang === "ar"
                                        ? "متوسط التقييم العام:"
                                        : "Average Rating:"}
                                    </span>
                                    <span className="text-[#00F2FF] font-mono">
                                      {(activeVideo.rating || 5.0).toFixed(1)} /
                                      5.0
                                    </span>
                                  </div>
                                </div>

                                {/* Sidebar Advert Banner ad */}
                                {ads
                                  .filter(
                                    (ad) =>
                                      ad.isActive && ad.type === "sidebar",
                                  )
                                  .slice(0, 1)
                                  .map((ad) => (
                                    <div
                                      key={ad.id}
                                      className="bg-gradient-to-br from-[#1A1A2E] to-purple-950/40 p-5 rounded-3xl border border-white/5 flex flex-col gap-3 relative overflow-hidden group"
                                    >
                                      <span className="absolute top-3 right-3 bg-[#FF0080]/90 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest">
                                        KIDS ECO FRIENDLY
                                      </span>
                                      <h4 className="text-xs font-extrabold uppercase text-white/50 tracking-wider">
                                        Educational Box Ad
                                      </h4>
                                      <img
                                        src={ad.imageUrl}
                                        alt={ad.title}
                                        className="w-full h-28 object-cover rounded-xl"
                                      />
                                      <p className="text-xs font-bold">
                                        {ad.title}
                                      </p>
                                      <a
                                        href={ad.targetUrl}
                                        className="bg-white/5 hover:bg-white/10 border border-white/10 text-center py-2 text-xs font-bold text-cyan-400 rounded-xl transition-all"
                                      >
                                        {t("subscribeNow")}
                                      </a>
                                    </div>
                                  ))}

                                {/* Related Cosmic Journeys / More Like This */}
                                {(() => {
                                  const related = customRelatedVideos.length > 0
                                    ? customRelatedVideos
                                    : videos
                                      .filter(
                                        (v) =>
                                          v.id !== activeVideo.id &&
                                          !isBlockedByParentFilters(v) &&
                                          (v.genres || []).some((g) =>
                                            (activeVideo.genres || []).includes(
                                              g,
                                            ),
                                          ),
                                      )
                                      .slice(0, 4);
                                  if (related.length === 0) return null;
                                  return (
                                    <div className="bg-[#0F0F15] p-5 rounded-3xl border border-white/5 flex flex-col gap-4 animate-fade-in">
                                      <h3 className="text-sm font-black tracking-tight text-white/90 flex items-center justify-between border-b border-white/5 pb-2">
                                        <div className="flex items-center gap-2">
                                          <Sparkles className="w-4 h-4 text-[#00F2FF]" />
                                          <span>
                                            {{
                                              ar: "مغامرات مشابهة 💫🍿",
                                              en: "More Like This 💫🍿",
                                              fr: "Dans le même style 💫🍿",
                                              de: "Mehr davon 💫🍿",
                                              es: "Más como esto 💫🍿",
                                              it: "Altri simili 💫🍿",
                                            }[lang] || "More Like This 💫🍿"}
                                          </span>
                                        </div>
                                        <button
                                          onClick={handleRefreshRelatedRecommendations}
                                          disabled={isRefreshingRelated}
                                          title={lang === "ar" ? "تحديث المقترحات بالذكاء الاصطناعي" : "Refresh with AI Recommendations"}
                                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 hover:text-cyan-300 transition-all border border-white/5 hover:border-cyan-500/20 disabled:opacity-50 active:scale-95 cursor-pointer flex items-center justify-center"
                                        >
                                          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingRelated ? "animate-spin" : ""}`} />
                                        </button>
                                      </h3>

                                      <div className="flex flex-col gap-3">
                                        {related.map((vid) => (
                                          <div
                                            key={vid.id}
                                            onClick={() => {
                                              setActiveVideo(vid);
                                              setTimeout(() => {
                                                document
                                                  .getElementById("video-arena")
                                                  ?.scrollIntoView({
                                                    behavior: "smooth",
                                                  });
                                              }, 100);
                                            }}
                                            className="group/item relative flex gap-3 p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-500/30 cursor-pointer transition-all duration-300"
                                          >
                                            {/* Thumbnail */}
                                            <div className="w-16 h-20 rounded-xl overflow-hidden relative flex-shrink-0 bg-black">
                                              <img
                                                src={vid.poster}
                                                alt={
                                                  vid.title[lang] ||
                                                  vid.title.en
                                                }
                                                className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500"
                                              />
                                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                <Play className="w-5 h-5 text-cyan-400 fill-current" />
                                              </div>
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 flex flex-col justify-between py-0.5 text-left min-w-0">
                                              <div>
                                                <h4 className="font-extrabold text-xs text-white group-hover/item:text-cyan-300 transition-colors line-clamp-1">
                                                  {vid.title[lang] ||
                                                    vid.title.en}
                                                </h4>
                                                <p className="text-[10px] text-white/40 line-clamp-2 mt-1 leading-snug">
                                                  {vid.description[lang] ||
                                                    vid.description.en}
                                                </p>
                                              </div>

                                              <div className="flex items-center gap-1.5 flex-wrap mt-1">
                                                <span className="text-[8px] font-semibold uppercase bg-pink-500/10 text-pink-400 border border-pink-500/15 py-0.5 px-1.5 rounded-md">
                                                  {vid.type}
                                                </span>
                                                {(vid.genres || [])
                                                  .slice(0, 2)
                                                  .map((g) => (
                                                    <span
                                                      key={g}
                                                      className={`text-[8px] font-semibold py-0.5 px-1.5 rounded-md border ${
                                                        (
                                                          activeVideo.genres ||
                                                          []
                                                        ).includes(g)
                                                          ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                                                          : "bg-white/5 text-white/50 border-white/5"
                                                      }`}
                                                    >
                                                      {g}
                                                    </span>
                                                  ))}
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })()}

                                {/* Interactive Comments system */}
                                <div className="bg-[#0F0F15] p-5 rounded-3xl border border-white/5 flex flex-col gap-4 flex-1 min-h-[300px]">
                                  <h3 className="text-sm font-bold tracking-tight text-white/80 border-b border-white/5 pb-2">
                                    💬 {t("reviews")} ({comments.length})
                                  </h3>

                                  {/* Comment Input */}
                                  <form
                                    onSubmit={handleAddComment}
                                    className="flex flex-col gap-2"
                                  >
                                    <textarea
                                      value={newCommentText}
                                      onChange={(e) =>
                                        setNewCommentText(e.target.value)
                                      }
                                      placeholder={t("addCommentPlaceholder")}
                                      rows={3}
                                      className="bg-black/40 border border-white/10 text-white placeholder-white/20 text-xs p-3 rounded-2xl resize-none focus:ring-1 focus:ring-[#00F2FF] focus:border-transparent outline-none"
                                    />
                                    <button
                                      type="submit"
                                      className="bg-gradient-to-r from-cyan-400 to-purple-500 text-black text-xs font-bold py-1.5 px-4 rounded-xl self-end hover:scale-105 active:scale-95 transition-all"
                                    >
                                      {t("addCommentBtn")}
                                    </button>
                                  </form>

                                  {/* Comment List items */}
                                  <div className="flex-1 overflow-y-auto max-h-[220px] flex flex-col gap-3 pr-1">
                                    {comments.map((c) => (
                                      <div
                                        key={c.id}
                                        className="bg-white/5 p-3 rounded-2xl flex items-start gap-2.5 border border-white/5"
                                      >
                                        <span className="text-lg flex-shrink-0">
                                          {c.userAvatar || "👶"}
                                        </span>
                                        <div className="flex-1">
                                          <span className="text-[10px] font-bold text-cyan-300 block">
                                            {c.userName}
                                          </span>
                                          <p className="text-xs text-white/80 mt-1">
                                            {c.text}
                                          </p>
                                          <span className="text-[8px] text-white/30 block mt-1.5">
                                            {new Date(
                                              c.timestamp,
                                            ).toLocaleDateString()}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* DYNAMIC LIST RAILS (Trending, Recommendation, Anime lists as requested) */}
                  <div className="flex flex-col gap-8">
                    {/* SEARCH RESULTS FEED */}
                    {searchQuery && (
                      <div className="flex flex-col gap-4">
                        {filteredVideos.length > 0 && (
                          <div
                            className="w-full flex-none bg-gradient-to-r from-blue-900 to-purple-900 rounded-3xl overflow-hidden relative cursor-pointer group shadow-2xl mb-4 border border-white/10 hover:border-cyan-400 transition-all"
                            onClick={() => {
                              setActiveVideo(filteredVideos[0]);
                              setActiveTab("home");
                              setSearchQuery("");
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                          >
                            <div className="absolute inset-0 z-0">
                              <img
                                src={
                                  filteredVideos[0].banner ||
                                  filteredVideos[0].poster
                                }
                                alt="cover"
                                className="w-full h-full object-cover opacity-60 mix-blend-overlay group-hover:scale-105 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
                            </div>
                            <div className="relative z-10 p-8 md:p-12 flex flex-col justify-end w-full md:w-2/3 h-full gap-4">
                              <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-black uppercase inline-block max-w-max">
                                Best Match
                              </span>
                              <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter leading-none shadow-black/50 drop-shadow-lg">
                                {filteredVideos[0].title[lang] ||
                                  filteredVideos[0].title.en}
                              </h2>
                              <p className="text-white/70 text-sm line-clamp-2 md:w-3/4">
                                {filteredVideos[0].description[lang] ||
                                  filteredVideos[0].description.en}
                              </p>
                              <div className="flex items-center gap-3 mt-2">
                                <button className="bg-gradient-to-r from-[#00F2FF] to-[#009DFF] text-black rounded-full px-8 py-3 font-black uppercase tracking-wider text-xs flex items-center gap-2 hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all">
                                  <Play className="w-4 h-4 fill-current" />
                                  {t("play")}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        <h3 className="text-xl font-bold tracking-tight italic text-cyan-400">
                          {t("search")} {t("details")} for &quot;{searchQuery}
                          &quot;
                        </h3>
                        {filteredVideos.length === 0 ? (
                          <p className="text-sm text-white/40 bg-white/5 p-8 rounded-2xl text-center">
                            No videos found matching your search. Try adjusting
                            the tags or check spelling.
                          </p>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                            {filteredVideos.map((vid) => (
                              <div
                                key={vid.id}
                                onClick={() => {
                                  setActiveVideo(vid);
                                  document
                                    .getElementById("video-arena")
                                    ?.scrollIntoView({ behavior: "smooth" });
                                }}
                                className="bg-[#1A1A2E]/50 rounded-2xl border border-white/5 overflow-hidden group cursor-pointer hover:border-[#00F2FF]/40 hover:-translate-y-1 transition-all duration-300"
                              >
                                <div className="aspect-[3/4] bg-black relative">
                                  <img
                                    src={vid.poster}
                                    alt={vid.title.en}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                    decoding="async"
                                    onError={handleImgError}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                                  <span className="absolute top-2 left-2 bg-black/60 text-pink-400 text-[9px] px-1.5 py-0.5 rounded font-black uppercase">
                                    {vid.ageCategory} yrs
                                  </span>
                                </div>
                                <div className="p-2.5">
                                  <p className="font-bold text-xs text-white line-clamp-1">
                                    {vid.title[lang] || vid.title.en}
                                  </p>
                                  <span className="text-[9px] text-white/40 block capitalize mt-0.5">
                                    {vid.type} • ⭐ {vid.rating}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* HOME SCREEN FEATURED HERO */}
                    {!searchQuery && videos.length > 0 && (
                      <div
                        className="w-full h-80 md:h-[450px] flex-none bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl overflow-hidden relative cursor-pointer group shadow-2xl mb-8 border border-amber-500/20 hover:border-amber-400 transition-all"
                        onClick={() => {
                          setActiveVideo(videos[0]);
                          setActiveTab("home");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        <div className="absolute inset-0 z-0">
                          <img
                            src={videos[0].banner || videos[0].poster}
                            alt="cover"
                            className="w-full h-full object-cover opacity-65 mix-blend-overlay group-hover:scale-105 transition-transform duration-700"
                            loading="eager"
                            fetchPriority="high"
                            decoding="async"
                            onError={handleImgError}
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#01140E] to-transparent" />
                        </div>
                        <div className="relative z-10 p-8 md:p-12 flex flex-col justify-end w-full md:w-2/3 h-full gap-4">
                          <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-emerald-950 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-block max-w-max">
                            🌟 {lang === "ar" ? "مغامرة جديدة" : "New Adventure"}
                          </span>
                          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none shadow-black/50 drop-shadow-lg !m-0">
                            {videos[0].title[lang] || videos[0].title.en}
                          </h2>
                          <p className="text-white/70 text-sm md:text-base line-clamp-2 md:w-3/4">
                            {videos[0].description[lang] ||
                              videos[0].description.en}
                          </p>
                          <div className="flex items-center gap-3 mt-4">
                            <button className="bg-amber-400 text-emerald-950 rounded-full px-8 py-3.5 font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-amber-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all">
                              <Play className="w-5 h-5 fill-current" />
                              {t("play")}
                            </button>
                            <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full px-8 py-3.5 font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-white/20 transition-all">
                              <Info className="w-5 h-5" />
                              Details
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CONTINUE WATCHING RAIL with customized progress as requested */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-bold tracking-tight">
                          {t("continueWatching")}{" "}
                          <span className="text-[#00F2FF] italic">
                            for {currentProfile?.name || "Kid"}
                          </span>
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {videos.slice(0, 3).map((video, index) => {
                          const progress = [35, 75, 15][index % 3];
                          const leftMin = [8, 4, 14][index % 3];
                          return (
                            <div
                              key={video.id}
                              onClick={() => {
                                setActiveVideo(video);
                                setVideoProgress(progress);
                                setIsPlaying(true);
                              }}
                              className="flex-none flex flex-col gap-3 group cursor-pointer bg-white/[0.02] border border-white/5 rounded-3xl p-2.5 hover:border-cyan-400/40 transition-all"
                            >
                              <div className="h-[140px] bg-[#1A1A2E] rounded-[24px] border border-white/10 relative overflow-hidden bg-gradient-to-br from-blue-900/50 to-purple-900/50">
                                <img
                                  src={video.poster}
                                  className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                                  alt={video.title[lang] || video.title.en}
                                  referrerPolicy="no-referrer"
                                  loading="lazy"
                                  decoding="async"
                                  onError={handleImgError}
                                />
                                <div className="absolute inset-0 bg-black/20" />
                                <div
                                  className="absolute bottom-0 left-0 h-1 bg-[#00F2FF]"
                                  style={{ width: `${progress}%` }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="w-10 h-10 bg-[#00F2FF] text-black rounded-full flex items-center justify-center">
                                    <Play className="w-4 h-4 fill-current ml-0.5" />
                                  </div>
                                </div>
                              </div>
                              <div className="px-1">
                                <p className="font-extrabold text-sm leading-tight text-white group-hover:text-cyan-300">
                                  {video.title[lang] || video.title.en}
                                </p>
                                <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider mt-0.5">
                                  {video.type === "series" ? "S1 • E01" : "Movie"} • {leftMin}m left
                                </p>
                              </div>
                            </div>
                          );
                        })}

                        <div className="flex-none flex flex-col gap-3 opacity-40 bg-white/[0.01] border border-dashed border-white/10 rounded-3xl p-5 items-center justify-center">
                          <Watch className="w-8 h-8 text-white/20" />
                          <span className="text-[10px] uppercase tracking-widest text-center font-bold">
                            More history locked with PIN settings
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* SMART CAROUSEL - "BECAUSE YOU WATCHED" DYNAMIC MATCHES */}
                    {currentProfile &&
                      (() => {
                        const recommendations = smartRecommendations;
                        if (recommendations.length === 0) return null;

                        const becauseYouWatchedHeader =
                          {
                            ar: "لأنك شاهدت",
                            en: "Because You Watched",
                            fr: "Parce que tu as regardé",
                            de: "Weil du geschaut hast",
                            es: "Porque viste",
                            it: "Perché hai guardato",
                          }[lang] || "Because You Watched";

                        const influencedByLabel =
                          {
                            ar: "اقتراحات ذكية مخصصة لك بناءً على تاريخ مشاهدتك كبطل! 🤖✨",
                            en: "Smart recommendations curated just for you based on your recent activity! 🤖✨",
                            fr: "Des recommandations intelligentes sélectionnées juste pour toi sur la base de tes activités ! 🤖✨",
                            de: "Kreative Empfehlungen, die perfekt zu deinen Lieblingssendungen passen! 🤖✨",
                            es: "¡Recomendaciones de Beep-Boop preparadas especialmente para ti! 🤖✨",
                            it: "Consigli intelligenti preparati apposta per te in base alle tue preferenze! 🤖✨",
                          }[lang] ||
                          "Smart recommendations curated just for you based on your recent activity! 🤖✨";

                        return (
                          <div className="flex flex-col gap-4 bg-gradient-to-r from-purple-950/20 via-[#100F22]/40 to-cyan-950/20 p-6 rounded-[35px] border border-cyan-500/25 shadow-xl relative overflow-hidden group/carousel">
                            {/* Ambient glow effects */}
                            <div className="absolute top-0 right-1/4 w-32 h-32 bg-[#00F2FF]/5 rounded-full blur-2xl pointer-events-none" />
                            <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2 z-10">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                                  <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                                    <span>{becauseYouWatchedHeader}</span>
                                  </h3>
                                </div>
                                <p className="text-[11px] text-white/60">
                                  {influencedByLabel}
                                </p>
                              </div>

                              {/* Sliding buttons */}
                              <div className="flex items-center gap-2 self-end sm:self-auto">
                                <button
                                  onClick={() => scrollCarousel("left")}
                                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all text-white/70 hover:text-white"
                                  title="Scroll Left"
                                >
                                  <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => scrollCarousel("right")}
                                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all text-white/70 hover:text-white"
                                  title="Scroll Right"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Horizontal scroll queue */}
                            <div
                              ref={carouselRef}
                              className="flex gap-6 overflow-x-auto pb-4 pr-1 scrollbar-hide scroll-smooth snap-x snap-mandatory z-10"
                            >
                              {recommendations.map(
                                ({ video, originalWatched }) => (
                                  <div
                                    key={video.id}
                                    onClick={() => {
                                      setActiveVideo(video);
                                      document
                                        .getElementById("video-arena")
                                        ?.scrollIntoView({
                                          behavior: "smooth",
                                        });
                                    }}
                                    className="flex-none w-[170px] sm:w-[200px] bg-[#121223]/95 rounded-3xl border border-white/5 overflow-hidden group cursor-pointer hover:border-cyan-400/40 hover:-translate-y-1.5 transition-all duration-300 snap-start shadow-md shadow-black/30"
                                  >
                                    <div className="aspect-[3/4] bg-black relative">
                                      <img
                                        src={video.poster}
                                        alt={
                                          video.title[lang] || video.title.en
                                        }
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        referrerPolicy="no-referrer"
                                        loading="lazy"
                                        decoding="async"
                                        onError={handleImgError}
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A14] via-transparent to-transparent opacity-90" />

                                      <span className="absolute top-2.5 left-2.5 bg-black/60 text-[#00F2FF] text-[9px] px-2 py-0.5 rounded-full font-black uppercase">
                                        {video.ageCategory} yrs
                                      </span>

                                      {/* Hover Play HUD */}
                                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="w-10 h-10 bg-gradient-to-tr from-[#00F2FF] to-[#7928CA] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-400/20">
                                          <Play className="w-4 h-4 fill-current ml-0.5" />
                                        </div>
                                      </div>

                                      <div className="absolute bottom-2 left-2 right-2 text-center">
                                        <span className="text-[8px] bg-white/10 backdrop-blur-md text-white/90 border border-white/10 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                                          {video.type}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="p-3 select-none">
                                      <p className="font-extrabold text-xs text-white line-clamp-1 group-hover:text-[#00F2FF] transition-colors">
                                        {video.title[lang] || video.title.en}
                                      </p>

                                      {/* Multilingual recommendation tag badge */}
                                      <div className="mt-2 flex items-center gap-1 bg-cyan-400/10 text-[9px] text-cyan-300 font-bold py-0.5 px-2 rounded-lg border border-cyan-400/20 line-clamp-1 shrink-0 truncate">
                                        <span className="w-1 h-1 rounded-full bg-cyan-400 shrink-0" />
                                        <span className="truncate">
                                          {lang === "ar"
                                            ? "تشابه مع: "
                                            : "Inspired by: "}
                                          {originalWatched.title[lang] ||
                                            originalWatched.title.en}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        );
                      })()}

                    {/* CARTOONS & ANIME SHOWCASE SHELF */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-bold tracking-tight italic text-rose-400">
                          {t("trending")} - {t("brandName")} Premium
                        </h3>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                        {videos.slice(0, 6).map((vid) => (
                          <div
                            key={vid.id}
                            onClick={() => {
                              setActiveVideo(vid);
                              document
                                .getElementById("video-arena")
                                ?.scrollIntoView({ behavior: "smooth" });
                            }}
                            className={`bg-[#1A1A2E]/50 rounded-3xl border overflow-hidden group cursor-pointer hover:-translate-y-2 transition-all duration-500 ${
                              activeVideo?.id === vid.id
                                ? "border-[#00F2FF] ring-2 ring-[#00F2FF]/20"
                                : "border-white/5 hover:border-[#00F2FF]/30"
                            }`}
                          >
                            <div className="aspect-[3/4] bg-black relative">
                              <img
                                src={vid.poster}
                                alt={vid.title.en}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />

                              <span className="absolute top-3 left-3 bg-[#FF0080] text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                                {vid.ageCategory} yrs
                              </span>

                              <div className="absolute bottom-3 left-3 right-3 text-center z-10">
                                <span className="text-[8px] bg-cyan-400/20 text-[#00F2FF] font-black border border-cyan-400/40 px-2 py-0.5 rounded uppercase">
                                  {vid.type}
                                </span>
                              </div>
                            </div>
                            <div className="p-3">
                              <p className="font-extrabold text-xs text-white line-clamp-1 text-center group-hover:text-[#00F2FF] transition-colors">
                                {vid.title[lang] || vid.title.en}
                              </p>
                              <p className="text-[10px] text-white/40 text-center mt-1">
                                ⭐ {vid.rating} • {vid.releaseYear}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

            {/* 2. FAMILY SUBSCRIPTION PRICING CARDS */}
            {activeTab === "subscriptions" && (
              <div className="max-w-4xl mx-auto py-8 flex flex-col gap-8 animate-fade-in text-center">
                <div className="flex flex-col gap-3">
                  <h1 className="text-4xl font-black italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-400">
                    {t("pricingTitle")}
                  </h1>
                  <p className="text-white/60 text-sm max-w-xl mx-auto">
                    Enjoy completely safe, curated, non-violent animations &
                    interactive edutainment suited perfectly for growing minds.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4 text-left">
                  {/* Free tier */}
                  <div className="bg-[#101017] p-6 rounded-[30px] border border-white/5 flex flex-col justify-between hover:border-white/20 transition-all">
                    <div>
                      <h3 className="text-xl font-bold uppercase text-white/50">
                        {t("freePlan")}
                      </h3>
                      <div className="my-4">
                        <span className="text-3xl font-black">$0</span>
                        <span className="text-xs text-white/40"> / Month</span>
                      </div>
                      <p className="text-xs text-white/70 leading-relaxed mb-6">
                        {t("featuresFree")}
                      </p>
                    </div>
                    <button className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-3 px-4 rounded-xl text-center w-full transition-all">
                      {t("currentPlan")}
                    </button>
                  </div>

                  {/* Premium Tier with Neon dynamic borders */}
                  <div className="bg-[#121225] p-6 rounded-[32px] border-2 border-cyan-400 relative flex flex-col justify-between shadow-xl shadow-cyan-400/5">
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-400 text-black text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                      Most Active Parent Pick
                    </span>
                    <div>
                      <h3 className="text-xl font-bold uppercase text-[#00F2FF]">
                        {t("premiumPlan")}
                      </h3>
                      <div className="my-4">
                        <span className="text-4xl font-black text-white">
                          $4.99
                        </span>
                        <span className="text-xs text-white/40"> / Month</span>
                      </div>
                      <p className="text-xs text-cyan-100 leading-relaxed mb-6">
                        {t("featuresPremium")}
                      </p>
                    </div>
                    <button className="bg-[#00F2FF] hover:bg-cyan-300 text-black text-xs font-black py-3 px-4 rounded-xl text-center w-full transition-all shadow-md shadow-cyan-400/20">
                      {t("subscribeNow")}
                    </button>
                  </div>

                  {/* Family Tier */}
                  <div className="bg-[#101017] p-6 rounded-[30px] border border-white/5 flex flex-col justify-between hover:border-white/20 transition-all">
                    <div>
                      <h3 className="text-xl font-bold uppercase text-purple-400">
                        {t("familyPlan")}
                      </h3>
                      <div className="my-4">
                        <span className="text-3xl font-black">$7.99</span>
                        <span className="text-xs text-white/40"> / Month</span>
                      </div>
                      <p className="text-xs text-white/70 leading-relaxed mb-6">
                        Up to 6 Kids profiles - custom locks - downloaded
                        content does not expire - access via Android/SmartTV app
                        keys.
                      </p>
                    </div>
                    <button className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-3 px-4 rounded-xl text-center w-full transition-all">
                      {t("subscribeNow")}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 4. DOWNLOADS / OFFLINE BACKPACK DASHBOARD PAGE */}
            {activeTab === "downloads" && (
              <div className="max-w-6xl mx-auto py-2 flex flex-col gap-8 animate-fade-in relative z-15">
                {/* Custom Playful Kids Banner */}
                <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-r from-purple-900/40 via-purple-950/20 to-pink-950/20 p-8 border border-white/5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Decorative glowing dots in background */}
                  <div className="absolute -top-10 -left-10 w-40 h-40 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-10 right-10 w-32 h-32 bg-[#00F2FF]/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex flex-col gap-2 z-10 text-left max-w-xl">
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                      <span>
                        {lang === "ar"
                          ? "حقيبة التنزيلات بدون اتصال 🎒🗺️"
                          : "My Offline Backpack 🎒🗺️"}
                      </span>
                    </h1>
                    <p className="text-xs text-white/60 leading-relaxed font-medium">
                      {lang === "ar"
                        ? "شاهد أفلامك وحلقاتك المفضلة في أي مكان، حتى في السيارة أو الطائرة! املأ حقيبتك لتبدأ الرحلة العجيبة! ✈️🚗"
                        : "Watch your favorite movies & episodes anywhere, even in the car or on a plane! Fill your backpack and embark on cosmic journeys! ✈️🚗"}
                    </p>
                  </div>

                  {currentProfile?.downloads &&
                    currentProfile.downloads.length > 0 && (
                      <button
                        onClick={() => {
                          const isConfirmed = window.confirm(
                            lang === "ar"
                              ? "هل تريد تفريغ كل التنزيلات؟ ستفقد القدرة على مشاهدتها بدون إنترنت!"
                              : "Are you sure you want to delete all offline files? You won't be able to view them without connection!",
                          );
                          if (isConfirmed) {
                            handleClearAllDownloads();
                          }
                        }}
                        className="px-5 py-3 rounded-2xl bg-red-600/20 border border-red-500/30 hover:bg-red-600/30 text-red-200 text-xs font-black tracking-wider flex items-center gap-2 transition-all self-start md:self-auto shadow-lg shadow-red-950/20 active:scale-95 shrink-0"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                        <span>
                          {lang === "ar"
                            ? "تفريغ الحقيبة بالكامل 🧹"
                            : "Empty Whole Backpack 🧹"}
                        </span>
                      </button>
                    )}
                </div>

                {/* Storage usage panel withSegmented progress bar */}
                {(() => {
                  const downloadsList = currentProfile?.downloads || [];
                  const totalCapacityMb = 64 * 1024; // 64 GB
                  const otherCapacityMb = 24.5 * 1024; // 24.5 GB
                  const kidsStreamMb = downloadsList.reduce(
                    (acc, item) => acc + (item.sizeMb || 45),
                    0,
                  );
                  const freeCapacityMb = Math.max(
                    0,
                    totalCapacityMb - otherCapacityMb - kidsStreamMb,
                  );

                  // Percentages for bar
                  const kidsPercent = (kidsStreamMb / totalCapacityMb) * 100;
                  const otherPercent =
                    (otherCapacityMb / totalCapacityMb) * 100;
                  const freePercent = Math.max(
                    0,
                    100 - kidsPercent - otherPercent,
                  );

                  const kidsGb = (kidsStreamMb / 1024).toFixed(2);
                  const otherGb = (otherCapacityMb / 1024).toFixed(2);
                  const freeGb = (freeCapacityMb / 1024).toFixed(2);

                  return (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Left Sidebar: STORAGE STATUS PANEL */}
                      <div className="bg-[#0F0F15]/90 border border-white/5 rounded-[32px] p-6 lg:col-span-1 flex flex-col gap-6 relative overflow-hidden backdrop-blur-md">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

                        <div className="flex flex-col gap-1 text-left select-none">
                          <h3 className="text-xs font-black tracking-widest text-[#00F2FF] uppercase">
                            {lang === "ar"
                              ? "مساحة تخزين الجهاز 📱💾"
                              : "Device Storage Breakdown 📱💾"}
                          </h3>
                          <span className="text-[10px] text-white/40 font-semibold">
                            {lang === "ar"
                              ? "إجمالي سعة تخزين التابلت / الآيباد"
                              : "Tablet / iPad total capacity"}
                            : 64.00 GB
                          </span>
                        </div>

                        {/* Visual segmented bar matching elegant-scandic/vibrant design */}
                        <div className="flex flex-col gap-2">
                          <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden flex border border-white/10 p-[1px]">
                            {/* Kids Stream Downloads */}
                            {kidsStreamMb > 0 && (
                              <div
                                className="h-full bg-gradient-to-r from-[#FF0080] to-purple-500 rounded-l-full transition-all duration-300"
                                style={{ width: `${kidsPercent}%` }}
                                title={`Kids Stream: ${kidsGb} GB`}
                              />
                            )}
                            {/* Other apps and system files */}
                            <div
                              className="h-full bg-[#1F1F2E] transition-all duration-300"
                              style={{
                                width: `${otherPercent}%`,
                                borderTopLeftRadius:
                                  kidsStreamMb === 0 ? "9999px" : "0px",
                                borderBottomLeftRadius:
                                  kidsStreamMb === 0 ? "9999px" : "0px",
                              }}
                              title={`Other Files: ${otherGb} GB`}
                            />
                            {/* Free space */}
                            <div
                              className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-r-full transition-all duration-300 flex-1"
                              style={{ width: `${freePercent}%` }}
                              title={`Free Space: ${freeGb} GB`}
                            />
                          </div>

                          <span className="text-[9px] text-white/30 text-center uppercase font-bold tracking-wider">
                            {lang === "ar"
                              ? "مساحة الذاكرة النشطة بالوحدة النيجية"
                              : "Interactive Device Storage Scale"}
                          </span>
                        </div>

                        {/* Segment breakdown cards */}
                        <div className="flex flex-col gap-3 text-left text-xs">
                          {/* Segment: Kids Stream */}
                          <div className="flex items-center justify-between p-3 bg-[#1A1A2E]/50 rounded-2xl border border-pink-500/10">
                            <div className="flex items-center gap-2.5">
                              <span className="w-3 h-3 rounded-md bg-[#FF0080]" />
                              <div>
                                <p className="font-extrabold text-white">
                                  {lang === "ar"
                                    ? "مستخدم بواسطة التطبيق"
                                    : "Used by Kids Stream"}
                                </p>
                                <p className="text-[10px] text-white/40">
                                  {lang === "ar"
                                    ? "مغامراتك المنزلة"
                                    : "Your downloaded contents"}
                                </p>
                              </div>
                            </div>
                            <span className="font-black text-[#FF0080]">
                              {kidsGb} GB
                            </span>
                          </div>

                          {/* Segment: Other Files */}
                          <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5 opacity-80">
                            <div className="flex items-center gap-2.5">
                              <span className="w-3 h-3 rounded-md bg-[#1F1F2E]" />
                              <div>
                                <p className="font-extrabold text-white/80">
                                  {lang === "ar"
                                    ? "الملفات الأخرى ونظام التشغيل"
                                    : "Other Apps & System"}
                                </p>
                                <p className="text-[10px] text-white/40">
                                  {lang === "ar"
                                    ? "الألعاب والصور والملفات"
                                    : "Games, photos & iOS/Android"}
                                </p>
                              </div>
                            </div>
                            <span className="font-bold text-white/70">
                              {otherGb} GB
                            </span>
                          </div>

                          {/* Segment: Free Space */}
                          <div className="flex items-center justify-between p-3 bg-emerald-900/10 rounded-2xl border border-emerald-500/10">
                            <div className="flex items-center gap-2.5">
                              <span className="w-3 h-3 rounded-md bg-emerald-500" />
                              <div>
                                <p className="font-extrabold text-white">
                                  {lang === "ar"
                                    ? "المساحة المتبقية للجهاز"
                                    : "Free Space Available"}
                                </p>
                                <p className="text-[10px] text-white/40">
                                  {lang === "ar"
                                    ? "جاهزة للمزيد من المغامرات!"
                                    : "Ready for more downloads!"}
                                </p>
                              </div>
                            </div>
                            <span className="font-black text-emerald-400">
                              {freeGb} GB
                            </span>
                          </div>
                        </div>

                        {/* Cute kid badge illustration container */}
                        <div className="mt-auto bg-gradient-to-r from-[#FF0080]/10 to-[#00F2FF]/10 p-4 rounded-3xl border border-white/5 text-center flex flex-col items-center gap-2">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-lg shadow-md select-none animate-bounce">
                            🏆
                          </div>
                          <span className="text-[10px] font-black text-amber-200">
                            {lang === "ar"
                              ? "أنت مستكشف ممتاز للمشاهدة بدون إنترنت!"
                              : "You are an awesome Explorer!"}
                          </span>
                          <span className="text-[8px] text-white/40 max-w-[180px]">
                            {lang === "ar"
                              ? "حمّل برامجك والعب بها مباشرة في السيارة أو المعسكر دون الحاجة لباقة البيانات!"
                              : "Load up your backpack and play video cartridges anywhere, anytime without mobile data costs!"}
                          </span>
                        </div>
                      </div>

                      {/* Right Section: DOWNLOADS LIST */}
                      <div className="lg:col-span-2 flex flex-col gap-4">
                        {downloadsList.length === 0 ? (
                          <div className="h-full min-h-[320px] bg-[#0F0F15]/90 border border-white/5 rounded-[32px] p-8 flex flex-col items-center justify-center gap-4 text-center z-10 backdrop-blur-md">
                            <div className="w-16 h-16 rounded-3xl bg-[#FF0080]/10 border border-[#FF0080]/20 flex items-center justify-center text-3xl">
                              🎒
                            </div>
                            <div className="flex flex-col gap-1 max-w-sm">
                              <h4 className="font-black text-white text-md">
                                {lang === "ar"
                                  ? "الحقيبة فارغة تماماً!"
                                  : "Your Offline Backpack is Empty!"}
                              </h4>
                              <p className="text-xs text-white/50 leading-relaxed">
                                {lang === "ar"
                                  ? 'اذهب إلى أي فيلم أو حلقة واضغط على "تنزيل" لتعبئتها مغامرات رائعة! 💫🍿'
                                  : 'Go to any movie or series and click "Offline Download" to pack cartoon episodes inside your traveling bag! 💫🍿'}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {downloadsList.map((item) => (
                              <div
                                key={item.id}
                                className="bg-[#0F0F15]/80 hover:bg-[#0F0F15]/95 border border-white/5 rounded-3xl overflow-hidden p-3 flex gap-4 transition-all hover:border-[#FF0080]/20 hover:-translate-y-1 duration-300"
                              >
                                {/* Left Mini cartoon cartridge poster representation */}
                                <div className="w-24 h-32 flex-shrink-0 relative rounded-2xl overflow-hidden group/item shadow-lg">
                                  <img
                                    src={item.poster}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500 pointer-events-none"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                                  <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md border border-white/10 text-[8px] font-mono text-[#00F2FF] font-bold px-1.5 py-0.5 rounded">
                                    {item.sizeMb || 45} MB
                                  </span>

                                  {/* Cute category tag badge top */}
                                  <span className="absolute top-2 left-2 bg-[#FF0080] text-white text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                                    {item.type}
                                  </span>
                                </div>

                                {/* Right details description block */}
                                <div className="flex-1 flex flex-col justify-between py-1 text-left min-w-0">
                                  <div className="flex flex-col gap-1.5 min-w-0">
                                    <p className="font-extrabold text-white text-xs line-clamp-2 leading-snug">
                                      {item.title}
                                    </p>
                                    <div className="flex items-center gap-1.5 text-[9px] text-white/40">
                                      <Watch className="w-2.5 h-2.5 shrink-0 text-cyan-400" />
                                      <span className="truncate">
                                        {lang === "ar"
                                          ? "فصل في الحقيبة منذ"
                                          : "Packed on"}
                                        :{" "}
                                        {new Date(
                                          item.downloadedAt,
                                        ).toLocaleDateString(lang, {
                                          month: "short",
                                          day: "numeric",
                                        })}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Interaction buttons bar */}
                                  <div className="flex items-center gap-2 pt-2">
                                    {/* Play now button directly within active state */}
                                    <button
                                      onClick={() =>
                                        handlePlayDownloadedItem(item)
                                      }
                                      className="flex-1 px-3 py-2 rounded-xl bg-[#00F2FF]/20 hover:bg-[#00F2FF]/30 border border-[#00F2FF]/40 text-[#00F2FF] text-[10px] font-black flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 shrink-0"
                                    >
                                      <Play className="w-3.5 h-3.5 fill-current text-[#00F2FF]" />
                                      <span>
                                        {lang === "ar"
                                          ? "تشغيل أوفلاين 🚀"
                                          : "Play Offline 🚀"}
                                      </span>
                                    </button>

                                    {/* Trash icon representing Unpack delete option */}
                                    <button
                                      onClick={() =>
                                        handleRemoveDownload(item.id)
                                      }
                                      className="p-2 rounded-xl bg-white/5 hover:bg-red-950/20 hover:text-red-400 border border-white/10 hover:border-red-500/30 text-white/50 transition-all active:scale-95 flex items-center justify-center"
                                      title={
                                        lang === "ar"
                                          ? "إزالة من الحقيبة 🗑️"
                                          : "Unpack Item 🗑️"
                                      }
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 5. UNIVERSAL OPEN RESOURCES STREAM PORTAL */}
            {activeTab === "open-resources" && (
              <div className="max-w-6xl mx-auto py-2 flex flex-col gap-8 animate-fade-in relative z-15">
                {/* Immersive Header Overview Dashboard Panel */}
                <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-r from-emerald-950/40 via-[#0F0F15] to-teal-950/40 p-8 border border-emerald-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-10 right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex flex-col gap-2 z-10 text-left max-w-xl">
                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-emerald-500/30 max-w-max">
                      {lang === "ar"
                        ? "البث المفتوح اللامحدود 🌐"
                        : "Universal Open Resources Streamer 🌐"}
                    </span>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                      <span>
                        {lang === "ar"
                          ? "فضاء مصادر البث المفتوح العجيب"
                          : "Cosmic Open Stream Resolver"}
                      </span>
                    </h1>
                    <p className="text-xs text-white/50 leading-relaxed font-semibold">
                      {lang === "ar"
                        ? "تجاوز حدود المواقع! ابحث واستورد وشغل أي فيلم، مسلسل، كرتون، أو أنمي من مصادر الأرشيف المفتوحة (IMDb ID، TVmaze، Jikan MAL، ومجموعات الأفلام العامة) من خلال 9 خوادم سحابية حديثة!"
                        : "Exceed catalog limits! Directly stream or permanently import any movie, series, cartoon, or anime from tvmaze, Jikan MyAnimeList, Internet Archive, IMDb IDs, or direct streaming URLs."}
                    </p>
                  </div>

                  {openResImportStatus && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-emerald-500/20 border border-emerald-400 text-emerald-200 text-xs py-3 px-5 rounded-2xl flex items-center gap-2 z-10"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{openResImportStatus}</span>
                    </motion.div>
                  )}
                </div>

                {/* Sub-Tabs Selector inside Open Resources */}
                <div className="flex border-b border-white/5 pb-0.5 gap-4">
                  <button
                    onClick={() => setOpenResActiveSubTab("imdb")}
                    className={`pb-3 text-xs uppercase font-black tracking-wider transition-all border-b-2 flex items-center gap-2 ${openResActiveSubTab === "imdb" ? "text-emerald-400 border-emerald-400" : "text-white/40 border-transparent hover:text-white/70"}`}
                  >
                    <Film className="w-4 h-4" />
                    <span>
                      {lang === "ar"
                        ? "معرف IMDb / TMDB"
                        : "IMDb / TMDB Resolvers"}
                    </span>
                  </button>
                  <button
                    onClick={() => setOpenResActiveSubTab("explorer")}
                    className={`pb-3 text-xs uppercase font-black tracking-wider transition-all border-b-2 flex items-center gap-2 ${openResActiveSubTab === "explorer" ? "text-emerald-400 border-emerald-400" : "text-white/40 border-transparent hover:text-white/70"}`}
                  >
                    <Globe className="w-4 h-4" />
                    <span>
                      {lang === "ar"
                        ? "البحث في الأرشيف المفتوح"
                        : "Search Open Repositories"}
                    </span>
                  </button>
                  <button
                    onClick={() => setOpenResActiveSubTab("link")}
                    className={`pb-3 text-xs uppercase font-black tracking-wider transition-all border-b-2 flex items-center gap-2 ${openResActiveSubTab === "link" ? "text-emerald-400 border-emerald-400" : "text-white/40 border-transparent hover:text-white/70"}`}
                  >
                    <Link className="w-4 h-4" />
                    <span>
                      {lang === "ar"
                        ? "رابط بث مباشر / إطار خارجي"
                        : "Direct Link / Embed Frame"}
                    </span>
                  </button>
                </div>

                {/* TAB WINDOWS RENDERING */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* TAB 1: IMDb / TMDB Resolvers */}
                  {openResActiveSubTab === "imdb" && (
                    <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in text-left">
                      {/* IMDb Resolver panel */}
                      <div className="bg-[#0F0F15]/95 border border-white/5 p-6 rounded-[32px] flex flex-col gap-5 relative overflow-hidden backdrop-blur-strong shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 rounded-full blur-2xl pointer-events-none" />
                        <div>
                          <h3 className="text-md font-bold text-yellow-450 flex items-center gap-2">
                            <Film className="w-5 h-5 text-yellow-400" />
                            <span>IMDb ID Multi-server Streamer 🎬📡</span>
                          </h3>
                          <p className="text-white/50 text-[11px] mt-1">
                            Resolve IMDb IDs (e.g.,{" "}
                            <code className="text-yellow-300 bg-yellow-450/10 px-1.5 py-0.5 rounded font-mono">
                              tt0111161
                            </code>{" "}
                            /{" "}
                            <code className="text-yellow-300 bg-yellow-450/10 px-1.5 py-0.5 rounded font-mono">
                              tt0468569
                            </code>
                            ) instantly using all 9 premium providers.
                          </p>
                        </div>

                        <div className="flex flex-col gap-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] text-white/50 uppercase font-black">
                                IMDb ID (required)
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. tt0111161"
                                value={openResImdbId}
                                onChange={(e) =>
                                  setOpenResImdbId(e.target.value.trim())
                                }
                                className="bg-black/50 border border-white/10 text-white text-xs p-3 rounded-xl outline-none font-mono focus:border-yellow-400 transition-all font-semibold"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] text-white/50 uppercase font-black">
                                Type
                              </label>
                              <select
                                value={openResImdbType}
                                onChange={(e) =>
                                  setOpenResImdbType(e.target.value as any)
                                }
                                className="bg-black/50 border border-white/10 text-white text-xs p-3 rounded-xl outline-none font-semibold cursor-pointer"
                              >
                                <option value="movie">Movie 🎬</option>
                                <option value="series">TV Series 📺</option>
                              </select>
                            </div>
                          </div>

                          {openResImdbType === "series" && (
                            <div className="grid grid-cols-2 gap-4 animate-fade-in bg-white/5 p-3.5 rounded-2xl border border-white/5">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] text-white/50 uppercase font-black">
                                  Season Number
                                </label>
                                <input
                                  type="number"
                                  min={1}
                                  value={openResSeason}
                                  onChange={(e) =>
                                    setOpenResSeason(
                                      Math.max(
                                        1,
                                        parseInt(e.target.value) || 1,
                                      ),
                                    )
                                  }
                                  className="bg-black/50 border border-white/10 text-white text-xs p-3 rounded-xl outline-none font-mono font-semibold"
                                />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] text-white/50 uppercase font-black font-sans">
                                  Episode Number
                                </label>
                                <input
                                  type="number"
                                  min={1}
                                  value={openResEpisode}
                                  onChange={(e) =>
                                    setOpenResEpisode(
                                      Math.max(
                                        1,
                                        parseInt(e.target.value) || 1,
                                      ),
                                    )
                                  }
                                  className="bg-black/50 border border-white/10 text-white text-xs p-3 rounded-xl outline-none font-mono font-semibold"
                                />
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] text-white/50 uppercase font-black">
                                Title (ENGLISH)
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Inception"
                                value={openResImdbTitleEn}
                                onChange={(e) =>
                                  setOpenResImdbTitleEn(e.target.value)
                                }
                                className="bg-black/50 border border-white/10 text-white text-xs p-3 rounded-xl outline-none focus:border-yellow-400 font-semibold"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] text-white/50 uppercase font-black">
                                Title (ARABIC)
                              </label>
                              <input
                                type="text"
                                placeholder="..."
                                value={openResImdbTitleAr}
                                onChange={(e) =>
                                  setOpenResImdbTitleAr(e.target.value)
                                }
                                className="bg-black/50 border border-white/10 text-white text-xs p-3 rounded-xl outline-none focus:border-yellow-400 text-right font-semibold"
                              />
                            </div>
                          </div>

                          <div className="flex gap-3 justify-end mt-2">
                            <button
                              onClick={() => {
                                if (!openResImdbId) {
                                  alert(
                                    lang === "ar"
                                      ? "الرجاء إدخال معرف IMDb ID أولاً!"
                                      : "Please insert an IMDb ID first!",
                                  );
                                  return;
                                }

                                const baseId = `imdb_${openResImdbId}`;
                                const titleEnStr =
                                  openResImdbTitleEn ||
                                  `IMDb Stream - ${openResImdbId}`;
                                const titleArStr =
                                  openResImdbTitleAr || titleEnStr;

                                const fakeVid: VideoContent = {
                                  id: baseId,
                                  title: {
                                    en: titleEnStr,
                                    ar: titleArStr,
                                    fr: titleEnStr,
                                    de: titleEnStr,
                                    es: titleEnStr,
                                    it: titleEnStr,
                                  },
                                  description: {
                                    en: "Sourced with high-availability links. Stream from any of the offline redundant mirrors built directly into the video technical dashboard settings.",
                                    ar: "رابط بث سحابي عالي التوافر مدعوم بنظام الخوادم التسعة لتجنب الانقطاع.",
                                  },
                                  poster:
                                    "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=600",
                                  banner:
                                    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200",
                                  type:
                                    openResImdbType === "series"
                                      ? "series"
                                      : "movie",
                                  ageCategory: "all",
                                  views: 89000,
                                  rating: 4.8,
                                  releaseYear: 2026,
                                  genres: ["open resources", "stream solver"],
                                  imdbId: openResImdbId,
                                  languageOptions: {
                                    dubbed: ["english", "arabic"],
                                    subtitled: ["english", "arabic"],
                                  },
                                  tags: [],
                                };

                                setResolvedTmdbInfo(null);
                                setActiveVideo(fakeVid);
                                if (openResImdbType === "series") {
                                  setCurrentEpisode({
                                    id: `imdb_${openResImdbId}_s${openResSeason}e${openResEpisode}`,
                                    seasonId: openResSeason.toString(),
                                    seriesId: baseId,
                                    episodeNumber: openResEpisode,
                                    title: {
                                      en: `Season ${openResSeason} Episode ${openResEpisode}`,
                                      ar: `موسم ${openResSeason} حلقة ${openResEpisode}`,
                                    },
                                    description: { en: "", ar: "" },
                                    duration: "N/A",
                                    videoUrl: "",
                                  });
                                } else {
                                  setCurrentEpisode({
                                    id: `dummy_imdb_${openResImdbId}`,
                                    seasonId: "1",
                                    seriesId: baseId,
                                    episodeNumber: 1,
                                    title: fakeVid.title,
                                    description: fakeVid.description,
                                    duration: "N/A",
                                    videoUrl: "",
                                  });
                                }

                                setIsPlaying(true);
                                document
                                  .getElementById("video-arena")
                                  ?.scrollIntoView({ behavior: "smooth" });
                              }}
                              className="px-5 py-3 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-black flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-yellow-500/20"
                            >
                              <Play className="w-4 h-4 fill-current text-black" />
                              <span>
                                {lang === "ar"
                                  ? "تشغيل البث فوراً 🚀"
                                  : "Stream/Launch Now 🚀"}
                              </span>
                            </button>

                            <button
                              onClick={async () => {
                                if (!openResImdbId) {
                                  alert(
                                    lang === "ar"
                                      ? "الرجاء إدخال معرف IMDb ID والمسمى الانجليزي لحفظه!"
                                      : "Please insert an IMDb ID and English title to import it!",
                                  );
                                  return;
                                }

                                const titleEnStr =
                                  openResImdbTitleEn ||
                                  `IMDb Stream - ${openResImdbId}`;
                                const titleArStr =
                                  openResImdbTitleAr || titleEnStr;
                                const baseId = `imdb_${openResImdbId}`;

                                const newVidPayload: Partial<VideoContent> = {
                                  id: baseId,
                                  title: {
                                    en: titleEnStr,
                                    ar: titleArStr,
                                    fr: titleEnStr,
                                    de: titleEnStr,
                                    es: titleEnStr,
                                    it: titleEnStr,
                                  },
                                  description: {
                                    en: "Resolved on demand via open directories or high-availability stream mirrors.",
                                    ar: "رابط مضاف يدوياً عبر مركز البث المفتوح اللامحدود بدقة فائقة.",
                                  },
                                  poster:
                                    "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=400",
                                  banner:
                                    "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200",
                                  type:
                                    openResImdbType === "series"
                                      ? "series"
                                      : "movie",
                                  views: Math.floor(Math.random() * 4000) + 120,
                                  rating: 4.8,
                                  releaseYear: 2026,
                                  ageCategory: "all",
                                  imdbId: openResImdbId,
                                  genres: ["open resources", "imdb resolver"],
                                  languageOptions: {
                                    dubbed: ["english", "arabic"],
                                    subtitled: ["english", "arabic"],
                                  },
                                };

                                try {
                                  const res = await fetch("/api/videos/add", {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify(newVidPayload),
                                  });
                                  const d = await res.json();
                                  if (d.success) {
                                    setVideos((prev) => [d.video, ...prev]);
                                    setOpenResImportStatus(
                                      `Successfully Imported "${titleEnStr}" 🌟`,
                                    );
                                    setTimeout(
                                      () => setOpenResImportStatus(null),
                                      4000,
                                    );
                                  }
                                } catch (e) {
                                  console.error(e);
                                }
                              }}
                              className="px-5 py-3 rounded-2xl bg-[#1F1F2E]/80 border border-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
                            >
                              <Plus className="w-4 h-4 text-cyan-400" />
                              <span>
                                {lang === "ar"
                                  ? "إضافة للمكتبة لتسهيل المشاهدة 📥"
                                  : "Import to Catalog 📥"}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* TMDB Resolver panel */}
                      <div className="bg-[#0F0F15]/95 border border-white/5 p-6 rounded-[32px] flex flex-col gap-5 relative overflow-hidden backdrop-blur-strong shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00F2FF]/5 rounded-full blur-2xl pointer-events-none" />
                        <div>
                          <h3 className="text-md font-bold text-[#00F2FF] flex items-center gap-2">
                            <Sliders className="w-5 h-5 text-[#00F2FF]" />
                            <span>TMDB ID Custom Streamer 📡⚡</span>
                          </h3>
                          <p className="text-white/50 text-[11px] mt-1">
                            Use a numeric TMDB ID (e.g.,{" "}
                            <code className="text-cyan-300 bg-cyan-450/10 px-1.5 py-0.5 rounded font-mono">
                              27205
                            </code>{" "}
                            /{" "}
                            <code className="text-cyan-300 bg-cyan-450/10 px-1.5 py-0.5 rounded font-mono">
                              550
                            </code>
                            ) to immediately load across 9 stream servers.
                          </p>
                        </div>

                        <div className="flex flex-col gap-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] text-white/50 uppercase font-black">
                                TMDB Movie/TV Numeric ID
                              </label>
                              <input
                                type="number"
                                placeholder="e.g. 27205"
                                value={openResTmdbId}
                                onChange={(e) =>
                                  setOpenResTmdbId(e.target.value.trim())
                                }
                                className="bg-black/50 border border-white/10 text-white text-xs p-3 rounded-xl outline-none font-mono focus:border-cyan-400 transition-all font-semibold shadow-[0_0_10px_rgba(0,242,255,0.02)]"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] text-white/50 uppercase font-black">
                                Type
                              </label>
                              <select
                                value={openResImdbType}
                                onChange={(e) =>
                                  setOpenResImdbType(e.target.value as any)
                                }
                                className="bg-black/50 border border-white/10 text-white text-xs p-3 rounded-xl outline-none font-semibold cursor-pointer"
                              >
                                <option value="movie">Movie 🎬</option>
                                <option value="series">TV Series 📺</option>
                              </select>
                            </div>
                          </div>

                          {openResImdbType === "series" && (
                            <div className="grid grid-cols-2 gap-4 animate-fade-in bg-white/5 p-3.5 rounded-2xl border border-white/5">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] text-white/50 uppercase font-black font-sans">
                                  Season Number
                                </label>
                                <input
                                  type="number"
                                  min={1}
                                  value={openResSeason}
                                  onChange={(e) =>
                                    setOpenResSeason(
                                      Math.max(
                                        1,
                                        parseInt(e.target.value) || 1,
                                      ),
                                    )
                                  }
                                  className="bg-black/50 border border-white/10 text-white text-xs p-3 rounded-xl outline-none font-mono font-semibold"
                                />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] text-white/50 uppercase font-black font-sans">
                                  Episode Number
                                </label>
                                <input
                                  type="number"
                                  min={1}
                                  value={openResEpisode}
                                  onChange={(e) =>
                                    setOpenResEpisode(
                                      Math.max(
                                        1,
                                        parseInt(e.target.value) || 1,
                                      ),
                                    )
                                  }
                                  className="bg-black/50 border border-white/10 text-white text-xs p-3 rounded-xl outline-none font-mono font-semibold"
                                />
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] text-white/50 uppercase font-black">
                                Title (ENGLISH)
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Interstellar"
                                value={openResImdbTitleEn}
                                onChange={(e) =>
                                  setOpenResImdbTitleEn(e.target.value)
                                }
                                className="bg-black/50 border border-white/10 text-white text-xs p-3 rounded-xl outline-none focus:border-cyan-400 font-semibold"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] text-white/50 uppercase font-black">
                                Title (ARABIC)
                              </label>
                              <input
                                type="text"
                                placeholder="..."
                                value={openResImdbTitleAr}
                                onChange={(e) =>
                                  setOpenResImdbTitleAr(e.target.value)
                                }
                                className="bg-black/50 border border-white/10 text-white text-xs p-3 rounded-xl outline-none focus:border-cyan-400 text-right font-semibold"
                              />
                            </div>
                          </div>

                          <div className="flex gap-3 justify-end mt-2">
                            <button
                              onClick={() => {
                                if (!openResTmdbId) {
                                  alert(
                                    lang === "ar"
                                      ? "الرجاء إدخال معرف TMDB ID أولاً!"
                                      : "Please insert a TMDB ID first!",
                                  );
                                  return;
                                }

                                const numericId = parseInt(openResTmdbId);
                                const baseId =
                                  openResImdbType === "series"
                                    ? `tmdb_tv_${numericId}`
                                    : `tmdb_${numericId}`;
                                const titleEnStr =
                                  openResImdbTitleEn ||
                                  `TMDB Stream - ${openResTmdbId}`;
                                const titleArStr =
                                  openResImdbTitleAr || titleEnStr;

                                const fakeVid: VideoContent = {
                                  id: baseId,
                                  title: {
                                    en: titleEnStr,
                                    ar: titleArStr,
                                    fr: titleEnStr,
                                    de: titleEnStr,
                                    es: titleEnStr,
                                    it: titleEnStr,
                                  },
                                  description: {
                                    en: "Sourced through ultra-clean responsive streaming mirrors.",
                                    ar: "رابط مشغل ومقترن تلقائياً بواسطة المعرف الرقمي.",
                                  },
                                  poster:
                                    "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=600",
                                  banner:
                                    "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1200",
                                  type:
                                    openResImdbType === "series"
                                      ? "series"
                                      : "movie",
                                  ageCategory: "all",
                                  views: 125000,
                                  rating: 4.9,
                                  releaseYear: 2026,
                                  genres: ["open resources", "tmdb streamer"],
                                  languageOptions: {
                                    dubbed: ["english", "arabic"],
                                    subtitled: ["english", "arabic"],
                                  },
                                  tags: [],
                                };

                                setResolvedTmdbInfo({
                                  tmdbId: numericId,
                                  resolvedType:
                                    openResImdbType === "series"
                                      ? "tv"
                                      : "movie",
                                  title: titleEnStr,
                                });
                                setActiveVideo(fakeVid);
                                if (openResImdbType === "series") {
                                  setCurrentEpisode({
                                    id: `tmdb_tv_${numericId}_s${openResSeason}e${openResEpisode}`,
                                    seasonId: openResSeason.toString(),
                                    seriesId: baseId,
                                    episodeNumber: openResEpisode,
                                    title: {
                                      en: `Season ${openResSeason} Episode ${openResEpisode}`,
                                      ar: `موسم ${openResSeason} حلقة ${openResEpisode}`,
                                    },
                                    description: { en: "", ar: "" },
                                    duration: "N/A",
                                    videoUrl: "",
                                  });
                                } else {
                                  setCurrentEpisode({
                                    id: `dummy_tmdb_${numericId}`,
                                    seasonId: "1",
                                    seriesId: baseId,
                                    episodeNumber: 1,
                                    title: fakeVid.title,
                                    description: fakeVid.description,
                                    duration: "N/A",
                                    videoUrl: "",
                                  });
                                }

                                setIsPlaying(true);
                                document
                                  .getElementById("video-arena")
                                  ?.scrollIntoView({ behavior: "smooth" });
                              }}
                              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-[#009DFF] text-black text-xs font-black flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-cyan-500/20"
                            >
                              <Play className="w-4 h-4 fill-current text-black" />
                              <span>
                                {lang === "ar"
                                  ? "تشغيل البث فوراً 🚀"
                                  : "Stream/Launch Now 🚀"}
                              </span>
                            </button>

                            <button
                              onClick={async () => {
                                if (!openResTmdbId) {
                                  alert(
                                    lang === "ar"
                                      ? "الرجاء إدخال معرف TMDB ID والمسمى الانجليزي لتسجيله!"
                                      : "Please insert a TMDB ID and English title to import!",
                                  );
                                  return;
                                }

                                const numericId = parseInt(openResTmdbId);
                                const titleEnStr =
                                  openResImdbTitleEn ||
                                  `TMDB Item - ${openResTmdbId}`;
                                const titleArStr =
                                  openResImdbTitleAr || titleEnStr;
                                const baseId =
                                  openResImdbType === "series"
                                    ? `tmdb_tv_${numericId}`
                                    : `tmdb_${numericId}`;

                                const newVidPayload: Partial<VideoContent> = {
                                  id: baseId,
                                  title: {
                                    en: titleEnStr,
                                    ar: titleArStr,
                                    fr: titleEnStr,
                                    de: titleEnStr,
                                    es: titleEnStr,
                                    it: titleEnStr,
                                  },
                                  description: {
                                    en: "Persisted item imported via parent portal stream resolvers.",
                                    ar: "رابط مضاف يدوياً عبر مركز البث المفتوح اللامحدود بدقة فائقة.",
                                  },
                                  poster:
                                    "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=400",
                                  banner:
                                    "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1200",
                                  type:
                                    openResImdbType === "series"
                                      ? "series"
                                      : "movie",
                                  views: Math.floor(Math.random() * 4000) + 120,
                                  rating: 4.8,
                                  releaseYear: 2026,
                                  ageCategory: "all",
                                  genres: ["open resources", "tmdb resolver"],
                                  languageOptions: {
                                    dubbed: ["english", "arabic"],
                                    subtitled: ["english", "arabic"],
                                  },
                                };

                                try {
                                  const res = await fetch("/api/videos/add", {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify(newVidPayload),
                                  });
                                  const d = await res.json();
                                  if (d.success) {
                                    setVideos((prev) => [d.video, ...prev]);
                                    setOpenResImportStatus(
                                      `Successfully Persistent "${titleEnStr}" 🌟`,
                                    );
                                    setTimeout(
                                      () => setOpenResImportStatus(null),
                                      4000,
                                    );
                                  }
                                } catch (e) {
                                  console.error(e);
                                }
                              }}
                              className="px-5 py-3 rounded-2xl bg-[#1F1F2E]/80 border border-cyan-400/30 hover:border-cyan-400/60 text-white text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
                            >
                              <Plus className="w-4 h-4 text-cyan-400" />
                              <span>
                                {lang === "ar"
                                  ? "إضافة للمكتبة لتسهيل المشاهدة 📥"
                                  : "Import to Catalog 📥"}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: Direct Embed/Link Streamer */}
                  {openResActiveSubTab === "link" && (
                    <div className="lg:col-span-12 bg-[#0F0F15]/95 border border-white/5 p-6 rounded-[32px] flex flex-col gap-5 text-left animate-fade-in relative backdrop-blur-strong overflow-hidden shadow-2xl">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/5 rounded-full blur-2xl pointer-events-none" />
                      <div>
                        <h3 className="text-md font-bold text-emerald-400 flex items-center gap-2">
                          <Link className="w-5 h-5 text-emerald-400" />
                          <span>
                            Direct Video URL & iframe embed Loader 🌐📡
                          </span>
                        </h3>
                        <p className="text-white/50 text-[11px] mt-1">
                          Directly load any HLS (
                          <code className="text-emerald-300 font-mono bg-emerald-500/10 px-1 rounded">
                            .m3u8
                          </code>
                          ), public MP4 video, or custom iframe-based streaming
                          URL!
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col gap-1.5 col-span-2">
                            <label className="text-[10px] text-white/50 uppercase font-black">
                              Direct Stream Link or Embed URL (required)
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Direct Video .mp4/.m3u8, or third-party embed / iframe link"
                              value={openResLinkUrl}
                              onChange={(e) =>
                                setOpenResLinkUrl(e.target.value)
                              }
                              className="bg-black/50 border border-white/10 text-white text-xs p-3 rounded-xl outline-none font-mono focus:border-emerald-400 transition-all font-semibold"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] text-white/50 uppercase font-black">
                                Content Category
                              </label>
                              <select
                                value={openResLinkType}
                                onChange={(e) =>
                                  setOpenResLinkType(e.target.value as any)
                                }
                                className="bg-black/50 border border-white/10 text-white text-xs p-3 rounded-xl cursor-copy font-semibold"
                              >
                                <option value="movie">Movie 🎬</option>
                                <option value="series">
                                  Cartoon Series 📺
                                </option>
                                <option value="anime">Anime ⭐</option>
                                <option value="educational">
                                  Educational 🎓
                                </option>
                              </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] text-white/50 uppercase font-black">
                                Age restriction
                              </label>
                              <select className="bg-black/50 border border-white/10 text-white text-xs p-3 rounded-xl font-semibold cursor-pointer">
                                <option value="all">All ages (العائلة)</option>
                                <option value="3-5">3-5 Toddlers</option>
                                <option value="6-8">6-8 Kids</option>
                                <option value="9-12">9-12 Teens</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] text-white/50 uppercase font-black">
                                Title (ENGLISH)
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Vintage Cartoon Classic"
                                value={openResLinkTitleEn}
                                onChange={(e) =>
                                  setOpenResLinkTitleEn(e.target.value)
                                }
                                className="bg-black/50 border border-white/10 text-white text-xs p-3 rounded-xl outline-none focus:border-emerald-400 font-semibold"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] text-white/50 uppercase font-black">
                                Title (ARABIC)
                              </label>
                              <input
                                type="text"
                                placeholder="..."
                                value={openResLinkTitleAr}
                                onChange={(e) =>
                                  setOpenResLinkTitleAr(e.target.value)
                                }
                                className="bg-black/50 border border-white/10 text-white text-xs p-3 rounded-xl outline-none focus:border-emerald-400 text-right font-semibold"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] text-white/50 uppercase font-black font-sans">
                              Summary / description
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Free public domain animation cartoon shared via Internet Archive or open collections."
                              value={openResLinkDesc}
                              onChange={(e) =>
                                setOpenResLinkDesc(e.target.value)
                              }
                              className="bg-black/50 border border-white/10 text-white text-xs p-3 rounded-xl outline-none focus:border-emerald-400 font-semibold"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 justify-end mt-4 border-t border-white/5 pt-4">
                        <button
                          onClick={() => {
                            if (!openResLinkUrl) {
                              alert(
                                lang === "ar"
                                  ? "الرجاء إدخال رابط البث!"
                                  : "Please insert a streaming link URL!",
                              );
                              return;
                            }

                            const customId = `custom_url_${Date.now()}`;
                            const titleEn =
                              openResLinkTitleEn || `Direct Link Playback`;
                            const titleAr = openResLinkTitleAr || titleEn;

                            const customVideo: VideoContent = {
                              id: customId,
                              title: {
                                en: titleEn,
                                ar: titleAr,
                                fr: titleEn,
                                de: titleEn,
                                es: titleEn,
                                it: titleEn,
                              },
                              description: {
                                en:
                                  openResLinkDesc || "Public Open Stream URL.",
                                ar: openResLinkDesc || "رابط بث سحابي مفتوح.",
                              },
                              poster:
                                "https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=400",
                              banner:
                                "https://images.unsplash.com/photo-1574375927938-d5a98e8edd86?q=80&w=1200",
                              type: openResLinkType,
                              ageCategory: "all",
                              views: 3100,
                              rating: 4.7,
                              releaseYear: 2026,
                              videoUrl: openResLinkUrl,
                              genres: ["direct", "custom link"],
                              languageOptions: {
                                dubbed: ["english"],
                                subtitled: ["english"],
                              },
                              tags: [],
                            };

                            setResolvedTmdbInfo(null);
                            setActiveVideo(customVideo);
                            setCurrentEpisode({
                              id: `dummy_${customId}`,
                              seasonId: "1",
                              seriesId: customId,
                              episodeNumber: 1,
                              title: customVideo.title,
                              description: customVideo.description,
                              duration: "N/A",
                              videoUrl: openResLinkUrl,
                            });

                            setIsPlaying(true);
                            document
                              .getElementById("video-arena")
                              ?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-emerald-500/15"
                        >
                          <Play className="w-4 h-4 fill-current text-black" />
                          <span>
                            {lang === "ar"
                              ? "تشغيل وتجربة الرابط الآن 🚀"
                              : "Stream Link Now 🚀"}
                          </span>
                        </button>

                        <button
                          onClick={async () => {
                            if (!openResLinkUrl) {
                              alert(
                                lang === "ar"
                                  ? "الرجاء إدخال رابط البث الخاص بك والمسمى لحفظه!"
                                  : "Please insert stream URL and English title to import!",
                              );
                              return;
                            }

                            const titleEn =
                              openResLinkTitleEn || `Persistent Live Link`;
                            const titleAr = openResLinkTitleAr || titleEn;
                            const customId = `custom_url_${Date.now()}`;

                            const newVidPayload: Partial<VideoContent> = {
                              id: customId,
                              title: {
                                en: titleEn,
                                ar: titleAr,
                                fr: titleEn,
                                de: titleEn,
                                es: titleEn,
                                it: titleEn,
                              },
                              description: {
                                en:
                                  openResLinkDesc || "Public Open Stream URL.",
                                ar: openResLinkDesc || "رابط بث سحابي مفتوح.",
                              },
                              poster:
                                "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400",
                              banner:
                                "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200",
                              type: openResLinkType,
                              ageCategory: "all",
                              views: 120,
                              rating: 4.7,
                              releaseYear: 2026,
                              videoUrl: openResLinkUrl,
                              genres: ["direct", "custom link"],
                              languageOptions: {
                                dubbed: ["english"],
                                subtitled: ["english"],
                              },
                            };

                            try {
                              const res = await fetch("/api/videos/add", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(newVidPayload),
                              });
                              const d = await res.json();
                              if (d.success) {
                                setVideos((prev) => [d.video, ...prev]);
                                setOpenResImportStatus(
                                  `Successfully Persistent Direct Link "${titleEn}" 🌟`,
                                );
                                setTimeout(
                                  () => setOpenResImportStatus(null),
                                  4000,
                                );
                              }
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className="px-5 py-3 rounded-2xl bg-[#1F1F2E]/80 border border-emerald-400/30 hover:border-emerald-400/60 text-white text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
                        >
                          <Plus className="w-4 h-4 text-emerald-400" />
                          <span>
                            {lang === "ar"
                              ? "حفظ الرابط في المكتبة 📥"
                              : "Import Link to Library 📥"}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: Search Open Repositories */}
                  {openResActiveSubTab === "explorer" && (
                    <div className="lg:col-span-12 flex flex-col gap-6 animate-fade-in text-left">
                      {/* Interactive Search Field */}
                      <div className="bg-[#0F0F15]/95 border border-white/5 p-6 rounded-[32px] flex flex-col gap-4 relative backdrop-blur-strong overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00F2FF]/5 rounded-full blur-2xl pointer-events-none" />
                        <div>
                          <h3 className="text-sm font-bold text-[#00F2FF] flex items-center gap-2 mb-1">
                            <Globe className="w-5 h-5 text-cyan-400" />
                            <span>Aggregated Open Repos Search</span>
                          </h3>
                          <p className="text-white/50 text-[10px]">
                            Search TVmaze (TV Catalog), Jikan MAL (Anime
                            catalog), and Internet Archive (Public domain
                            cartoons) simultaneously.
                          </p>
                        </div>

                        <div className="flex gap-3">
                          <input
                            type="text"
                            placeholder="Type anime title or tv show name (e.g. Popeye, Superman, Batman, Naruto)..."
                            value={openResSearchQuery}
                            onChange={(e) =>
                              setOpenResSearchQuery(e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                // Trigger search!
                                (async () => {
                                  if (!openResSearchQuery.trim()) return;
                                  setOpenResSearchLoading(true);
                                  try {
                                    const res = await fetch(
                                      `/api/videos/external?q=${encodeURIComponent(openResSearchQuery.trim())}`,
                                    );
                                    const data = await res.json();
                                    if (data.success && data.videos) {
                                      setOpenResSearchResults(data.videos);
                                    } else {
                                      setOpenResSearchResults([]);
                                    }
                                  } catch (err) {
                                    setOpenResSearchResults([]);
                                  } finally {
                                    setOpenResSearchLoading(false);
                                  }
                                })();
                              }
                            }}
                            className="bg-black/50 border border-white/10 text-white text-xs p-3.5 rounded-2xl outline-none focus:border-cyan-400 transition-all flex-1 font-sans font-semibold"
                          />
                          <button
                            onClick={async () => {
                              if (!openResSearchQuery.trim()) return;
                              setOpenResSearchLoading(true);
                              try {
                                const res = await fetch(
                                  `/api/videos/external?q=${encodeURIComponent(openResSearchQuery.trim())}`,
                                );
                                const data = await res.json();
                                if (data.success && data.videos) {
                                  setOpenResSearchResults(data.videos);
                                } else {
                                  setOpenResSearchResults([]);
                                }
                              } catch (err) {
                                setOpenResSearchResults([]);
                              } finally {
                                setOpenResSearchLoading(false);
                              }
                            }}
                            className="bg-cyan-500 hover:bg-cyan-400 font-extrabold text-black text-xs px-6 py-3.5 rounded-2xl flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-cyan-500/20"
                          >
                            <Search className="w-4 h-4 text-black font-extrabold" />
                            <span>
                              {lang === "ar"
                                ? "ابحث الآن ✨"
                                : "Search Repos ✨"}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Search Results Display List */}
                      {openResSearchLoading ? (
                        <div className="p-12 text-center text-xs text-[#00F2FF]/60 flex flex-col items-center justify-center gap-3 bg-[#0F0F15]/30 border border-white/5 rounded-3xl">
                          <Sliders className="w-8 h-8 text-cyan-400 animate-spin" />
                          <span className="font-bold tracking-widest uppercase">
                            Contacting TVmaze, Jikan MAL, & Public Archives...
                            Please wait
                          </span>
                        </div>
                      ) : openResSearchResults.length === 0 ? (
                        <div className="p-12 text-center text-xs text-white/30 bg-[#0F0F15]/40 border border-white/5 rounded-3xl flex flex-col items-center justify-center gap-3 leading-relaxed">
                          <Globe className="w-8 h-8 text-white/10" />
                          <span>
                            Type a keyword above and hit Enter to pull items
                            from open sources beyond TMDB!
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4">
                          <h4 className="text-xs text-[#00F2FF]/80 uppercase font-black tracking-widest pl-2">
                            Found {openResSearchResults.length} matches across
                            Open Repositories
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {openResSearchResults.map((vid, idx) => {
                              return (
                                <div
                                  key={vid.id || idx}
                                  className="bg-[#0A0A12]/95 border border-white/5 rounded-3xl p-4 flex gap-4 hover:border-cyan-400/30 transition-all group shadow-md"
                                >
                                  {/* Aspect Ratio Poster image wrapper */}
                                  <div className="w-20 h-28 bg-black rounded-2xl overflow-hidden flex-shrink-0 border border-white/5 relative">
                                    <img
                                      src={
                                        vid.poster ||
                                        "https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=200"
                                      }
                                      alt={vid.title.en}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                      referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] bg-black/70 text-pink-400 font-extrabold uppercase">
                                      {vid.source || "Open Repo"}
                                    </div>
                                  </div>

                                  {/* Content info */}
                                  <div className="flex-1 flex flex-col justify-between select-none min-w-0">
                                    <div className="flex flex-col gap-1">
                                      <h5 className="text-xs font-black text-white/95 truncate group-hover:text-cyan-300 transition-colors">
                                        {vid.title[lang] || vid.title.en}
                                      </h5>
                                      <span className="text-[9px] text-[#00F2FF]/60 font-black tracking-wide uppercase">
                                        {vid.type || "Show"} • ⭐{" "}
                                        {vid.rating || "4.5"}
                                      </span>
                                      <p className="text-[10px] text-white/40 line-clamp-2 leading-relaxed">
                                        {vid.description[lang] ||
                                          vid.description.en ||
                                          "No synopsis provided by repo."}
                                      </p>
                                    </div>

                                    {/* Action links */}
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => {
                                          if (vid.id.startsWith("tmdb_")) {
                                            const tmdbIdInt = parseInt(
                                              vid.id
                                                .replace("tmdb_tv_", "")
                                                .replace("tmdb_", ""),
                                            );
                                            setResolvedTmdbInfo({
                                              tmdbId: tmdbIdInt,
                                              resolvedType:
                                                vid.type === "series"
                                                  ? "tv"
                                                  : "movie",
                                              title: vid.title.en,
                                            });
                                          } else {
                                            setResolvedTmdbInfo(null);
                                          }

                                          setActiveVideo(vid);

                                          // Initialize default episode for direct playback
                                          setCurrentEpisode({
                                            id: `dummy_${vid.id}`,
                                            seasonId: "1",
                                            seriesId: vid.id,
                                            episodeNumber: 1,
                                            title: vid.title,
                                            description: vid.description,
                                            duration: vid.duration || "N/A",
                                            videoUrl: vid.videoUrl || "",
                                          });

                                          setIsPlaying(true);
                                          document
                                            .getElementById("video-arena")
                                            ?.scrollIntoView({
                                              behavior: "smooth",
                                            });
                                        }}
                                        className="bg-cyan-500/10 border border-cyan-400/25 hover:bg-cyan-500/25 hover:shadow-md hover:shadow-cyan-400/10 text-cyan-300 font-black text-[9px] px-3 py-1.5 rounded-lg inline-flex items-center gap-1 transition-all"
                                      >
                                        <Play className="w-3 h-3 fill-current text-cyan-300" />
                                        <span>Stream Now</span>
                                      </button>

                                      <button
                                        onClick={async () => {
                                          try {
                                            const res = await fetch(
                                              "/api/videos/add",
                                              {
                                                method: "POST",
                                                headers: {
                                                  "Content-Type":
                                                    "application/json",
                                                },
                                                body: JSON.stringify({
                                                  ...vid,
                                                  views:
                                                    vid.views ||
                                                    Math.floor(
                                                      Math.random() * 4000,
                                                    ) + 120,
                                                  rating: vid.rating || 4.5,
                                                  ageCategory:
                                                    vid.ageCategory || "all",
                                                }),
                                              },
                                            );
                                            const d = await res.json();
                                            if (d.success) {
                                              setVideos((prev) => [
                                                d.video,
                                                ...prev,
                                              ]);
                                              setOpenResImportStatus(
                                                `Successfully Imported "${vid.title.en}" to Catalog!`,
                                              );
                                              setTimeout(
                                                () =>
                                                  setOpenResImportStatus(null),
                                                4000,
                                              );
                                            }
                                          } catch (e) {
                                            console.error(e);
                                          }
                                        }}
                                        className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 font-bold text-[9px] px-3 py-1.5 rounded-lg inline-flex items-center gap-1 transition-all"
                                      >
                                        <Plus className="w-3 h-3 text-[#00F2FF]" />
                                        <span>Import</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. SECURE PARENTAL SETTINGS PORTAL (PIN protected Area) */}
            {activeTab === "parent-portal" && isParentAuthorized && (
              <div className="max-w-5xl mx-auto py-6 flex flex-col gap-8 animate-fade-in">
                {/* Header overview banner for settings */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-red-600/20 via-[#0F0F15] to-cyan-950/20 p-6 rounded-3xl border border-red-500/20">
                  <div className="flex items-center gap-3">
                    <Shield className="w-10 h-10 text-amber-400 fill-current" />
                    <div>
                      <h2 className="text-2xl font-black tracking-tight text-white">
                        {t("parentsMode")}
                      </h2>
                      <p className="text-xs text-white/60">
                        Configure local child catalog, review activities, test
                        PostgreSQL structure models, and handle ads.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsParentAuthorized(false);
                      setActiveTab("home");
                    }}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-400" />
                    <span>Exit Parents Portal</span>
                  </button>
                </div>

                {/* Subsections Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Controls column */}
                  <div className="lg:col-span-7 flex flex-col gap-6">
                    {/* Add content catalog Form */}
                    <div className="bg-[#0F0F15] p-6 rounded-3xl border border-white/5 flex flex-col gap-4">
                      <h3 className="text-md font-bold text-[#00F2FF] flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        {t("addMovieBtn")} (Admin CMS)
                      </h3>

                      <form
                        onSubmit={handleAddVideoSubmit}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
                          <label className="text-[10px] text-white/50 uppercase font-black">
                            Title (ARABIC)
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="مثال: مغامرات ميكي ماوس في الغابة السحرية"
                            value={newVideoTitleAr}
                            onChange={(e) => setNewVideoTitleAr(e.target.value)}
                            className="bg-black/40 border border-white/10 text-white text-xs p-2.5 rounded-xl outline-none"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
                          <label className="text-[10px] text-white/50 uppercase font-black">
                            Title (ENGLISH)
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g., Mickey Magic Forest Expedition"
                            value={newVideoTitleEn}
                            onChange={(e) => setNewVideoTitleEn(e.target.value)}
                            className="bg-black/40 border border-white/10 text-white text-xs p-2.5 rounded-xl outline-none"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5 col-span-2">
                          <label className="text-[10px] text-white/50 uppercase font-black">
                            Description (ARABIC)
                          </label>
                          <textarea
                            placeholder="اكتب وصفاً لطيفاً ومحفزاً للطفل..."
                            value={newVideoDescAr}
                            onChange={(e) => setNewVideoDescAr(e.target.value)}
                            rows={2}
                            className="bg-black/40 border border-white/10 text-white text-xs p-2.5 rounded-xl resize-none outline-none"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5 col-span-2">
                          <label className="text-[10px] text-white/50 uppercase font-black">
                            Description (ENGLISH)
                          </label>
                          <textarea
                            placeholder="Write an encouraging kid-friendly description description..."
                            value={newVideoDescEn}
                            onChange={(e) => setNewVideoDescEn(e.target.value)}
                            rows={2}
                            className="bg-black/40 border border-white/10 text-white text-xs p-2.5 rounded-xl resize-none outline-none"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-white/50 uppercase font-black">
                            Type
                          </label>
                          <select
                            value={newVideoType}
                            onChange={(e) =>
                              setNewVideoType(e.target.value as any)
                            }
                            className="bg-black/40 border border-white/10 text-white text-xs p-2.5 rounded-xl"
                          >
                            <option value="movie">Movie 🎬</option>
                            <option value="series">Cartoon Series 📺</option>
                            <option value="anime">Anime ⭐</option>
                            <option value="educational">
                              Learning Program 🎓
                            </option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-white/50 uppercase font-black">
                            Age Target
                          </label>
                          <select
                            value={newVideoAge}
                            onChange={(e) =>
                              setNewVideoAge(e.target.value as any)
                            }
                            className="bg-black/40 border border-white/10 text-white text-xs p-2.5 rounded-xl"
                          >
                            <option value="all">All ages (العائلة)</option>
                            <option value="3-5">Toddlers (3-5 years)</option>
                            <option value="6-8">Kids (6-8 years)</option>
                            <option value="9-12">Pre-Teen (9-12 years)</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-white/50 uppercase font-black">
                            Poster Unsplash URL
                          </label>
                          <input
                            type="text"
                            placeholder="https://images.unsplash.com/photo-..."
                            value={newVideoPoster}
                            onChange={(e) => setNewVideoPoster(e.target.value)}
                            className="bg-black/40 border border-white/10 text-white text-xs p-2.5 rounded-xl outline-none"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-white/50 uppercase font-black">
                            Banner Unsplash URL
                          </label>
                          <input
                            type="text"
                            placeholder="https://images.unsplash.com/photo-..."
                            value={newVideoBanner}
                            onChange={(e) => setNewVideoBanner(e.target.value)}
                            className="bg-black/40 border border-white/10 text-white text-xs p-2.5 rounded-xl outline-none"
                          />
                        </div>

                        <div className="col-span-2 flex justify-end">
                          <button
                            type="submit"
                            className="bg-gradient-to-r from-emerald-500 to-cyan-400 text-black font-black text-xs py-2.5 px-6 rounded-xl hover:scale-105 active:scale-95 transition-all"
                          >
                            Save Showcase Item 🌟
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Add Episode Form */}
                    <div className="bg-[#0F0F15] p-6 rounded-3xl border border-white/5 flex flex-col gap-4">
                      <h3 className="text-md font-bold text-pink-400 flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        {t("addEpisodeBtn")} (Video Sources)
                      </h3>

                      <form
                        onSubmit={handleAddEpisodeSubmit}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        <div className="flex flex-col gap-1.5 col-span-2">
                          <label className="text-[10px] text-white/50 uppercase font-black font-mono">
                            Assign to Series / Video Parent
                          </label>
                          <select
                            value={newEpSeriesId}
                            onChange={(e) => setNewEpSeriesId(e.target.value)}
                            className="bg-black/40 border border-white/10 text-white text-xs p-2.5 rounded-xl cursor-pointer"
                          >
                            {videos.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.title.en} ({v.type})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-white/50 uppercase font-black">
                            Episode Number
                          </label>
                          <input
                            type="number"
                            required
                            value={newEpNum}
                            onChange={(e) =>
                              setNewEpNum(Number(e.target.value))
                            }
                            className="bg-black/40 border border-white/10 text-white text-xs p-2.5 rounded-xl outline-none"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-white/50 uppercase font-black">
                            Video Stream Link (MP4/HLS)
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="BigBuckBunny or similar safe mp4 link"
                            value={newEpUrl}
                            onChange={(e) => setNewEpUrl(e.target.value)}
                            className="bg-black/40 border border-white/10 text-white text-xs p-2.5 rounded-xl outline-none font-mono"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-white/50 uppercase font-black">
                            Title (ARABIC)
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="الحلقة الممتعة للتعلم"
                            value={newEpTitleAr}
                            onChange={(e) => setNewEpTitleAr(e.target.value)}
                            className="bg-black/40 border border-white/10 text-white text-xs p-2.5 rounded-xl outline-none"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-white/50 uppercase font-black">
                            Title (ENGLISH)
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Episode En title"
                            value={newEpTitleEn}
                            onChange={(e) => setNewEpTitleEn(e.target.value)}
                            className="bg-black/40 border border-white/10 text-white text-xs p-2.5 rounded-xl outline-none"
                          />
                        </div>

                        <div className="col-span-2 flex justify-end">
                          <button
                            type="submit"
                            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-black text-xs py-2.5 px-6 rounded-xl hover:scale-105 active:scale-95 transition-all"
                          >
                            Save Episode Link
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* RELATIONAL DATABASE SCHEMA DOCUMENTATION SYSTEM (🐘 PostgreSQL tabs) */}
                    <div className="bg-[#0F0F15] p-6 rounded-3xl border border-white/5 flex flex-col gap-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
                      <h3 className="text-md font-bold text-purple-300 flex items-center gap-2">
                        <Database className="w-4 h-4 text-purple-400" />
                        {t("dbSchemaDoc")}
                      </h3>
                      <p className="text-[11px] text-white/50">
                        Explore our enterprise relational design. In production,
                        these tables run fully typed with optimized indexing and
                        constraints inside GCP PostgreSQL.
                      </p>

                      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/5">
                        {[
                          "movies",
                          "episodes",
                          "users_profiles",
                          "sub_payments",
                          "logs_analytics",
                        ].map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveSchemaTab(tab)}
                            className={`text-[10px] px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                              activeSchemaTab === tab
                                ? "bg-purple-600 text-white"
                                : "bg-white/5 hover:bg-white/10 text-white/50"
                            }`}
                          >
                            {tab.replace("_", " ")}
                          </button>
                        ))}
                      </div>

                      {/* Schema Tab details */}
                      <div className="bg-black/40 p-3.5 rounded-2xl border border-white/5 text-[11px] font-mono leading-relaxed max-h-[250px] overflow-y-auto">
                        {activeSchemaTab === "movies" && (
                          <pre className="text-pink-300 whitespace-pre-wrap">
                            {`CREATE TABLE Movies (
  id VARCHAR(64) PRIMARY KEY,
  type VARCHAR(20) CHECK (type IN ('movie', 'series', 'anime', 'educational')),
  title_ar VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  poster VARCHAR(512),
  banner VARCHAR(512),
  age_category VARCHAR(10) CHECK (age_category IN ('all', '3-5', '6-8', '9-12')),
  duration VARCHAR(20),
  rating DECIMAL(3, 2) DEFAULT 5.0,
  release_year INT DEFAULT 2026,
  views INT DEFAULT 0
);

CREATE TABLE Genres (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE Movie_Genres (
  movie_id VARCHAR(64) REFERENCES Movies(id) ON DELETE CASCADE,
  genre_id INT REFERENCES Genres(id) ON DELETE CASCADE,
  PRIMARY KEY (movie_id, genre_id)
);`}
                          </pre>
                        )}

                        {activeSchemaTab === "episodes" && (
                          <pre className="text-cyan-300 whitespace-pre-wrap">
                            {`CREATE TABLE Seasons (
  id VARCHAR(64) PRIMARY KEY,
  series_id VARCHAR(64) REFERENCES Movies(id) ON DELETE CASCADE,
  season_number INT NOT NULL,
  title_en VARCHAR(255)
);

CREATE TABLE Episodes (
  id VARCHAR(64) PRIMARY KEY,
  season_id VARCHAR(64) REFERENCES Seasons(id) ON DELETE CASCADE,
  series_id VARCHAR(64) REFERENCES Movies(id) ON DELETE CASCADE,
  episode_number INT NOT NULL,
  title_ar VARCHAR(255),
  title_en VARCHAR(255),
  description_ar TEXT,
  description_en TEXT,
  thumbnail VARCHAR(512),
  duration VARCHAR(255),
  video_url VARCHAR(512) NOT NULL
);`}
                          </pre>
                        )}

                        {activeSchemaTab === "users_profiles" && (
                          <pre className="text-amber-200 whitespace-pre-wrap">
                            {`CREATE TABLE Users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(512) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Profiles (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES Users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  avatar VARCHAR(10),
  age INT CHECK (age >= 2 AND age <= 16),
  is_kids_mode BOOLEAN DEFAULT TRUE,
  pin VARCHAR(4) DEFAULT '1234'
);

CREATE TABLE Favorites (
  profile_id VARCHAR(64) REFERENCES Profiles(id) ON DELETE CASCADE,
  movie_id VARCHAR(64) REFERENCES Movies(id) ON DELETE CASCADE,
  PRIMARY KEY (profile_id, movie_id)
);`}
                          </pre>
                        )}

                        {activeSchemaTab === "sub_payments" && (
                          <pre className="text-blue-300 whitespace-pre-wrap">
                            {`CREATE TABLE Subscriptions (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES Users(id),
  plan_level VARCHAR(32) CHECK (plan_level IN ('Free', 'Premium', 'Family')),
  active BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP
);

CREATE TABLE Payments (
  id VARCHAR(64) PRIMARY KEY,
  subscription_id VARCHAR(64) REFERENCES Subscriptions(id),
  amount NUMERIC(6, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_method VARCHAR(32), -- 'Stripe' / 'PayPal'
  status VARCHAR(20) DEFAULT 'Succeeded'
);`}
                          </pre>
                        )}

                        {activeSchemaTab === "logs_analytics" && (
                          <pre className="text-emerald-300 whitespace-pre-wrap">
                            {`CREATE TABLE Security_Logs (
  id SERIAL PRIMARY KEY,
  type VARCHAR(32) NOT NULL,
  severity VARCHAR(16) DEFAULT 'info',
  message TEXT NOT NULL,
  ip_address VARCHAR(45),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Playback_Reports (
  id SERIAL PRIMARY KEY,
  profile_id VARCHAR(64) NOT NULL,
  episode_id VARCHAR(64) NOT NULL,
  seconds_watched INT NOT NULL,
  device_carrier VARCHAR(64),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column details (System integrity log analyzer and Ads manager) */}
                  <div className="lg:col-span-5 flex flex-col gap-6">
                    {/* DYNAMIC CONTENT FILTERS (As requested by parent restrictions) */}
                    <div className="bg-[#0F0F15] p-6 rounded-3xl border border-white/5 flex flex-col gap-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-xl pointer-events-none" />

                      <h3 className="text-md font-bold text-red-400 flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-red-500" />
                        <span>🔒 Content Restrictions & Themes</span>
                      </h3>

                      <p className="text-[11px] text-white/50 leading-relaxed">
                        Control what your kids can watch. Toggle broad themes or
                        insert custom blacklisted keywords. Blocked content will
                        be instantly hidden from home lists, search results, and
                        AI recommendations.
                      </p>

                      {/* Theme-based Filter toggles */}
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] text-white/40 uppercase font-black tracking-wider">
                          Broad Blocked Themes
                        </span>

                        <div className="grid grid-cols-2 gap-2">
                          {[
                            {
                              id: "no-slapstick",
                              label: "No Slapstick 🤪",
                              desc: "Blocks funny content & comedy genres",
                            },
                            {
                              id: "no-scary",
                              label: "No Scary/Monsters 👻",
                              desc: "Blocks ghosts, monsters & horror",
                            },
                            {
                              id: "no-action",
                              label: "No Action/Ninjas ⚔️",
                              desc: "Blocks martial arts, ninja training & battles",
                            },
                            {
                              id: "no-gadgets",
                              label: "No Gadgets 🤖",
                              desc: "Blocks futuristic gadgets & doraemon",
                            },
                          ].map((theme) => {
                            const isBlocked = (
                              dbSettings?.blockedThemes || []
                            ).includes(theme.id);
                            return (
                              <button
                                key={theme.id}
                                type="button"
                                onClick={async () => {
                                  const currentThemes: string[] =
                                    dbSettings?.blockedThemes || [];
                                  const newThemes = currentThemes.includes(
                                    theme.id,
                                  )
                                    ? currentThemes.filter(
                                        (id) => id !== theme.id,
                                      )
                                    : [...currentThemes, theme.id];

                                  // Server Sync
                                  try {
                                    const res = await fetch(
                                      "/api/settings/update",
                                      {
                                        method: "POST",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                          blockedThemes: newThemes,
                                        }),
                                      },
                                    );
                                    const data = await res.json();
                                    if (data.success) {
                                      setDbSettings(data.settings);
                                    }
                                  } catch (e) {
                                    console.error(
                                      "Error setting blocked themes",
                                      e,
                                    );
                                  }
                                }}
                                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all duration-300 ${
                                  isBlocked
                                    ? "bg-red-500/10 border-red-500/30 text-red-200"
                                    : "bg-white/5 border-white/5 hover:border-white/10 text-white/70"
                                }`}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-xs font-bold">
                                    {theme.label}
                                  </span>
                                  <div
                                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
                                      isBlocked
                                        ? "bg-red-500 text-white animate-pulse"
                                        : "border border-white/20"
                                    }`}
                                  >
                                    {isBlocked && (
                                      <span className="text-[8px] font-bold">
                                        ✓
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className="text-[9px] text-white/40 leading-tight">
                                  {theme.desc}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Custom keyword filter list */}
                      <div className="flex flex-col gap-2.5 mt-2 pt-4 border-t border-white/5">
                        <span className="text-[10px] text-white/40 uppercase font-black tracking-wider">
                          Custom Blacklisted Keywords
                        </span>

                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            if (!customKeywordInput.trim()) return;
                            const word = customKeywordInput
                              .trim()
                              .toLowerCase();
                            const currentKeywords: string[] =
                              dbSettings?.customBlockedKeywords || [];
                            if (currentKeywords.includes(word)) {
                              setCustomKeywordInput("");
                              return;
                            }
                            const newKeywords = [...currentKeywords, word];

                            try {
                              const res = await fetch("/api/settings/update", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  customBlockedKeywords: newKeywords,
                                }),
                              });
                              const data = await res.json();
                              if (data.success) {
                                setDbSettings(data.settings);
                                setCustomKeywordInput("");
                              }
                            } catch (err) {
                              console.error(
                                "Error adding custom blocked keyword",
                                err,
                              );
                            }
                          }}
                          className="flex gap-2"
                        >
                          <input
                            type="text"
                            placeholder="e.g. dragon, space, owl..."
                            value={customKeywordInput}
                            onChange={(e) =>
                              setCustomKeywordInput(e.target.value)
                            }
                            className="bg-black/40 border border-white/10 text-white text-xs p-2.5 rounded-xl outline-none flex-1 focus:border-red-500/30 transition-colors"
                          />
                          <button
                            type="submit"
                            className="bg-red-500 hover:bg-red-400 text-white text-xs font-black py-2 px-4 rounded-xl flex items-center gap-1 transition-all"
                          >
                            Block
                          </button>
                        </form>

                        {/* Display custom keywords badges */}
                        {dbSettings?.customBlockedKeywords &&
                        dbSettings.customBlockedKeywords.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {dbSettings.customBlockedKeywords.map(
                              (word: string) => (
                                <span
                                  key={word}
                                  className="bg-red-500/15 border border-red-500/20 text-red-300 text-[10px] font-bold pl-2.5 pr-1.5 py-1 rounded-lg flex items-center gap-1.5 animate-fade-in"
                                >
                                  <span>{word}</span>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      const currentKeywords: string[] =
                                        dbSettings?.customBlockedKeywords || [];
                                      const newKeywords =
                                        currentKeywords.filter(
                                          (k) => k !== word,
                                        );

                                      try {
                                        const res = await fetch(
                                          "/api/settings/update",
                                          {
                                            method: "POST",
                                            headers: {
                                              "Content-Type":
                                                "application/json",
                                            },
                                            body: JSON.stringify({
                                              customBlockedKeywords:
                                                newKeywords,
                                            }),
                                          },
                                        );
                                        const data = await res.json();
                                        if (data.success) {
                                          setDbSettings(data.settings);
                                        }
                                      } catch (err) {
                                        console.error(
                                          "Error removing custom blocked keyword",
                                          err,
                                        );
                                      }
                                    }}
                                    className="w-4 h-4 rounded hover:bg-red-500/30 flex items-center justify-center transition-all text-red-400 hover:text-red-200"
                                  >
                                    ×
                                  </button>
                                </span>
                              ),
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-white/30 italic">
                            No custom words blacklisted yet.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Create / Manage child profiles widget */}
                    <div className="bg-[#0F0F15] p-6 rounded-3xl border border-white/5 flex flex-col gap-4">
                      <h3 className="text-md font-bold text-amber-300 flex items-center gap-2">
                        <Users className="w-4 h-4 text-amber-400" />
                        {t("manageProfiles")}
                      </h3>

                      <form
                        onSubmit={handleCreateProfile}
                        className="flex flex-col gap-3 pb-4 border-b border-white/5"
                      >
                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            placeholder="Child's Name"
                            value={newProfileName}
                            onChange={(e) => setNewProfileName(e.target.value)}
                            className="bg-black/40 border border-white/10 text-white text-xs p-2.5 rounded-xl outline-none flex-1"
                          />
                          <select
                            value={newProfileAvatar}
                            onChange={(e) =>
                              setNewProfileAvatar(e.target.value)
                            }
                            className="bg-black/40 border border-white/10 text-white text-xs p-2 rounded-xl"
                          >
                            <option value="🦁">🦁 Lion</option>
                            <option value="🦄">🦄 Unicorn</option>
                            <option value="🐲">🐲 Dragon</option>
                            <option value="🐼">🐼 Panda</option>
                            <option value="🐸">🐸 Frog</option>
                            <option value="🦊">🦊 Fox</option>
                          </select>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <div className="flex items-center gap-2 text-xs text-white/60">
                            <span>Age Limit: {newProfileAge} yrs</span>
                            <input
                              type="range"
                              min="3"
                              max="15"
                              value={newProfileAge}
                              onChange={(e) =>
                                setNewProfileAge(Number(e.target.value))
                              }
                              className="accent-amber-400 cursor-pointer w-24"
                            />
                          </div>

                          <button
                            type="submit"
                            className="bg-amber-400 hover:bg-amber-300 text-black text-xs font-black py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add Profile
                          </button>
                        </div>
                      </form>

                      {/* Display profiles list with deletion option */}
                      <div className="flex flex-col gap-2">
                        {profiles.map((p) => (
                          <div
                            key={p.id}
                            className="bg-white/5 p-3 rounded-2xl flex items-center justify-between border border-white/5"
                          >
                            <div className="flex items-center gap-2.5">
                              {p.customAvatar ? (
                                <div
                                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center overflow-hidden border border-white/10`}
                                >
                                  <CustomAvatarRenderer
                                    config={p.customAvatar}
                                    className="w-8 h-8"
                                  />
                                </div>
                              ) : (
                                <span className="text-2xl w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl border border-white/5">
                                  {p.avatar}
                                </span>
                              )}
                              <div>
                                <h4 className="text-xs font-bold text-white">
                                  {p.name}
                                </h4>
                                <span className="text-[10px] text-white/40">
                                  Age Limit: {p.age} years
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedProfileToEdit(p);
                                  setEditingAvatarConfig(
                                    p.customAvatar || {
                                      bodyType: "blob",
                                      color: "#EC4899",
                                      eyes: "sparkle",
                                      mouth: "smile",
                                      accessory: "none",
                                    },
                                  );
                                }}
                                className={`text-[9px] font-black px-2.5 py-1 rounded-lg border transition-all ${
                                  selectedProfileToEdit?.id === p.id
                                    ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black border-amber-400"
                                    : "bg-white/5 text-amber-300 border-amber-500/20 hover:border-amber-400/50 hover:bg-amber-400/10"
                                }`}
                              >
                                {selectedProfileToEdit?.id === p.id
                                  ? "Editing 🎨"
                                  : "Design 🎨"}
                              </button>
                              <button
                                onClick={() => handleDeleteProfile(p.id)}
                                className="text-white/40 hover:text-red-400 p-1 bg-white/5 hover:bg-white/10 rounded-lg"
                                title="Remove profile"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* INTERACTIVE AVATAR BUILDER (KID-FRIENDLY CHARACTER LAB) */}
                    {selectedProfileToEdit && editingAvatarConfig && (
                      <div className="bg-[#0F0F15] p-6 rounded-3xl border border-amber-400/30 flex flex-col gap-5 relative overflow-hidden animate-fade-in shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                          <div>
                            <h3 className="text-md font-black text-amber-300 flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-amber-400 animate-spin-slow" />
                              <span>
                                🎨{" "}
                                {lang === "ar"
                                  ? "صانع الشخصيات السحري"
                                  : "Magic Character Designer Lab"}
                              </span>
                            </h3>
                            <span className="text-[10px] text-white/50">
                              {lang === "ar"
                                ? "تصميم الصورة الرمزية لـ "
                                : "Designing profile avatar for "}{" "}
                              <strong className="text-white">
                                {selectedProfileToEdit.name}
                              </strong>
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProfileToEdit(null);
                              setEditingAvatarConfig(null);
                            }}
                            className="text-white/40 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-lg text-xs"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                          {/* Visual Live Preview Column */}
                          <div className="md:col-span-4 flex flex-col items-center justify-center bg-black/40 p-4 rounded-2xl border border-white/5 relative group/preview">
                            <div
                              className={`w-28 h-28 rounded-full bg-gradient-to-br ${selectedProfileToEdit.color} p-[3px] shadow-lg shadow-amber-500/10 group-hover/preview:scale-105 transition-transform duration-300`}
                            >
                              <div className="w-full h-full bg-[#12121e] rounded-full flex items-center justify-center overflow-hidden">
                                <CustomAvatarRenderer
                                  config={editingAvatarConfig}
                                  className="w-24 h-24"
                                />
                              </div>
                            </div>
                            <span className="text-[10px] text-amber-400 font-bold tracking-widest uppercase mt-3 animate-pulse">
                              {lang === "ar" ? "معاينة حية" : "Live Hologram"}
                            </span>
                          </div>

                          {/* Editor controls column */}
                          <div className="md:col-span-8 flex flex-col gap-4">
                            {/* Style Selector 1: Head Shape */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] uppercase font-black tracking-wider text-white/40">
                                1.{" "}
                                {lang === "ar"
                                  ? "شكل الرأس والجسم"
                                  : "Head Body Shape"}
                              </label>
                              <div className="grid grid-cols-5 gap-1.5">
                                {(
                                  [
                                    "blob",
                                    "box",
                                    "bunny",
                                    "cat",
                                    "star",
                                  ] as const
                                ).map((shape) => (
                                  <button
                                    key={shape}
                                    type="button"
                                    onClick={() =>
                                      setEditingAvatarConfig((prev) =>
                                        prev
                                          ? { ...prev, bodyType: shape }
                                          : null,
                                      )
                                    }
                                    className={`text-[9px] font-black capitalize py-1.5 px-0.5 rounded-lg border transition-all ${
                                      editingAvatarConfig.bodyType === shape
                                        ? "bg-amber-405 bg-amber-400 text-black border-amber-400"
                                        : "bg-white/5 text-white border-white/10 hover:border-white/30"
                                    }`}
                                  >
                                    {shape}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Style Selector 2: Colors Row */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] uppercase font-black tracking-wider text-white/40">
                                2.{" "}
                                {lang === "ar"
                                  ? "لون البشرة"
                                  : "Skin Core Color"}
                              </label>
                              <div className="flex items-center gap-2">
                                {[
                                  { hex: "#EC4899", name: "Pink" },
                                  { hex: "#06B6D4", name: "Cyber Blue" },
                                  { hex: "#10B981", name: "Slime Green" },
                                  { hex: "#F59E0B", name: "Orange Glow" },
                                  { hex: "#8B5CF6", name: "Vibrant Violet" },
                                  { hex: "#FBBF24", name: "Cosmic Yellow" },
                                ].map((col) => (
                                  <button
                                    key={col.hex}
                                    type="button"
                                    onClick={() =>
                                      setEditingAvatarConfig((prev) =>
                                        prev
                                          ? { ...prev, color: col.hex }
                                          : null,
                                      )
                                    }
                                    className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 flex items-center justify-center ${
                                      editingAvatarConfig.color === col.hex
                                        ? "border-amber-400 scale-110 shadow-md ring-2 ring-amber-400/50"
                                        : "border-transparent"
                                    }`}
                                    style={{ backgroundColor: col.hex }}
                                    title={col.name}
                                  />
                                ))}
                              </div>
                            </div>

                            {/* Style Selector 3: Eyes Expression */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] uppercase font-black tracking-wider text-white/40">
                                3.{" "}
                                {lang === "ar"
                                  ? "تعبير العينين"
                                  : "Eyes Expression"}
                              </label>
                              <div className="grid grid-cols-5 gap-1.5">
                                {(
                                  [
                                    "sparkle",
                                    "cool",
                                    "wink",
                                    "joy",
                                    "glasses",
                                  ] as const
                                ).map((eyeKind) => (
                                  <button
                                    key={eyeKind}
                                    type="button"
                                    onClick={() =>
                                      setEditingAvatarConfig((prev) =>
                                        prev
                                          ? { ...prev, eyes: eyeKind }
                                          : null,
                                      )
                                    }
                                    className={`text-[9px] font-black capitalize py-1.5 px-0.5 rounded-lg border transition-all ${
                                      editingAvatarConfig.eyes === eyeKind
                                        ? "bg-amber-400 text-black border-amber-400"
                                        : "bg-white/5 text-white border-white/10 hover:border-white/30"
                                    }`}
                                  >
                                    {eyeKind}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Style Selector 4: Mouth Expression */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] uppercase font-black tracking-wider text-white/40">
                                4.{" "}
                                {lang === "ar"
                                  ? "الفم والضحكة"
                                  : "Mouth & Expression"}
                              </label>
                              <div className="grid grid-cols-5 gap-1.5">
                                {(
                                  [
                                    "smile",
                                    "tongue",
                                    "whiskers",
                                    "vamp",
                                    "mustache",
                                  ] as const
                                ).map((mouthKind) => (
                                  <button
                                    key={mouthKind}
                                    type="button"
                                    onClick={() =>
                                      setEditingAvatarConfig((prev) =>
                                        prev
                                          ? { ...prev, mouth: mouthKind }
                                          : null,
                                      )
                                    }
                                    className={`text-[9px] font-black capitalize py-1.5 px-0.5 rounded-lg border transition-all ${
                                      editingAvatarConfig.mouth === mouthKind
                                        ? "bg-amber-400 text-black border-amber-400"
                                        : "bg-white/5 text-white border-white/10 hover:border-white/30"
                                    }`}
                                  >
                                    {mouthKind}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Style Selector 5: Headwear & Accessories */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] uppercase font-black tracking-wider text-white/40">
                                5.{" "}
                                {lang === "ar"
                                  ? "القبعات والإكسسوارات"
                                  : "Headwear & Accessories"}
                              </label>
                              <div className="grid grid-cols-4 gap-1.5">
                                {(
                                  [
                                    "crown",
                                    "wizard",
                                    "party",
                                    "headphones",
                                    "space",
                                    "flower",
                                    "none",
                                  ] as const
                                ).map((acc) => (
                                  <button
                                    key={acc}
                                    type="button"
                                    onClick={() =>
                                      setEditingAvatarConfig((prev) =>
                                        prev
                                          ? { ...prev, accessory: acc }
                                          : null,
                                      )
                                    }
                                    className={`text-[9px] font-black capitalize py-1.5 px-0.5 rounded-lg border transition-all ${
                                      editingAvatarConfig.accessory === acc
                                        ? "bg-amber-400 text-black border-amber-400"
                                        : "bg-white/5 text-white border-white/10 hover:border-white/30"
                                    }`}
                                  >
                                    {acc}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Saving alerts */}
                        {saveAvatarSuccess && (
                          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs p-3 rounded-2xl text-center font-bold animate-pulse">
                            🚀{" "}
                            {lang === "ar"
                              ? "تم حفظ تصميم الشخصية الخاصة بك في خوادم السحاب بنجاح!"
                              : "Profile custom character design saved to cloud systems!"}
                          </div>
                        )}

                        {/* Actions footer */}
                        <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProfileToEdit(null);
                              setEditingAvatarConfig(null);
                            }}
                            className="px-4 py-2 rounded-xl bg-white/5 text-xs text-white/60 hover:text-white transition-all hover:bg-white/10"
                          >
                            {lang === "ar" ? "إلغاء الأمر" : "Cancel"}
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveCustomAvatar}
                            disabled={saveAvatarLoading}
                            className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-amber-400/15"
                          >
                            {saveAvatarLoading ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                <span>
                                  {lang === "ar"
                                    ? "جاري الإرسال للبث السحابي..."
                                    : "Cast-Transmitting..."}
                                </span>
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                <span>
                                  {lang === "ar"
                                    ? "حفظ تصميم الشخصية"
                                    : "Save Character Design"}
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Integrated custom ads settings toggler */}
                    <div className="bg-[#0F0F15] p-6 rounded-3xl border border-white/5 flex flex-col gap-4">
                      <h3 className="text-md font-bold text-cyan-400 flex items-center gap-2">
                        <Radio className="w-4 h-4 text-cyan-300 animate-pulse" />
                        {t("adsManagement")}
                      </h3>
                      <p className="text-[11px] text-white/50 leading-relaxed">
                        Toggle compliance for kids-friendly promotional
                        campaigns. Advertisements are restricted exclusively to
                        non-invasive academic tools inside the application
                        space.
                      </p>

                      <div className="flex flex-col gap-3">
                        {ads.map((ad) => (
                          <div
                            key={ad.id}
                            className="bg-black/30 p-3 rounded-2xl border border-white/5 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2 max-w-[70%]">
                              <img
                                src={ad.imageUrl}
                                alt=""
                                className="w-10 h-10 object-cover rounded-lg"
                              />
                              <div className="min-w-0">
                                <h4 className="text-xs font-extrabold truncate text-white">
                                  {ad.title}
                                </h4>
                                <span className="text-[9px] uppercase tracking-widest text-[#FF0080] font-bold">
                                  {ad.type} AD
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleToggleAd(ad.id)}
                              className={`text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all ${
                                ad.isActive
                                  ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                                  : "bg-white/5 text-white/40"
                              }`}
                            >
                              {ad.isActive ? "Active ON" : "Deactivated"}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Security Access Monitor Dashboard */}
                    <div className="bg-[#0F0F15] p-6 rounded-3xl border border-white/5 flex flex-col gap-4">
                      <h3 className="text-md font-bold text-rose-400 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-rose-500" />
                        {t("securityAudit")}
                      </h3>

                      <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto">
                        {logs.map((log) => (
                          <div
                            key={log.id}
                            className="bg-black/40 p-3 rounded-xl border border-white/5 text-[10px] flex flex-col gap-1 font-mono"
                          >
                            <div className="flex items-center justify-between font-bold">
                              <span
                                className={`uppercase font-black text-[8px] px-1.5 py-0.5 rounded ${
                                  log.severity === "danger"
                                    ? "bg-red-500/20 text-red-400"
                                    : log.severity === "warning"
                                      ? "bg-amber-500/20 text-amber-400"
                                      : "bg-cyan-500/10 text-cyan-300"
                                }`}
                              >
                                {log.type} - {log.severity}
                              </span>
                              <span className="text-white/30">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-white/80">{log.message}</p>
                            {log.ipAddress && (
                              <span className="text-white/20 text-[8px]">
                                Client IP: {log.ipAddress}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* GLOBAL FOOTER */}
          <footer className="border-t border-white/5 bg-[#0A0A0E] px-6 md:px-12 py-10 mt-auto text-white/60 text-xs text-center md:text-left">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div className="md:col-span-2 flex flex-col gap-3">
                <span className="text-white font-black text-lg italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-[#00F2FF]">
                  {t("brandName").toUpperCase()}
                </span>
                <p className="leading-relaxed max-w-sm">{t("footerAbout")}</p>
              </div>

              <div className="flex flex-col gap-2 font-semibold">
                <h4 className="text-white font-bold uppercase tracking-wider mb-2 text-xs">
                  For Families
                </h4>
                <button
                  onClick={() => {
                    setActiveTab("subscriptions");
                  }}
                  className="hover:text-cyan-400 self-center md:self-start"
                >
                  {t("premiumPlan")}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("movies");
                  }}
                  className="hover:text-cyan-400 self-center md:self-start"
                >
                  {t("movies")}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("series");
                  }}
                  className="hover:text-cyan-400 self-center md:self-start"
                >
                  {t("series")}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("educational");
                  }}
                  className="hover:text-cyan-400 self-center md:self-start"
                >
                  {t("educational")}
                </button>
              </div>

              <div className="flex flex-col gap-2 font-semibold">
                <h4 className="text-white font-bold uppercase tracking-wider mb-2 text-xs">
                  Regulations & Safety
                </h4>
                <a href="#privacy" className="hover:text-cyan-400">
                  {t("privacyPolicy")}
                </a>
                <a href="#terms" className="hover:text-cyan-400">
                  {t("termsOfService")}
                </a>
                <a href="#dmca" className="hover:text-cyan-400">
                  {t("dmcaNotice")} (DMCA)
                </a>
                <a href="#about" className="hover:text-cyan-400">
                  {t("aboutUs")}
                </a>
              </div>
            </div>

            <div className="border-t border-white/5 pt-6 text-center text-[10px] text-white/30 flex flex-wrap justify-between items-center max-w-7xl mx-auto gap-4">
              <span>{t("allRightsReserved")} &copy; 2026.</span>
              <span className="font-mono text-[9px] bg-white/[0.02] py-1 px-3 rounded-full uppercase tracking-widest text-[#00F2FF]/40 border border-white/5">
                PORT 3000 • SANDBOX SECURE ENTRANCE
              </span>
            </div>
          </footer>
        </main>
      </div>

      {/* PARENTAL PASSWORD/PIN ACCESS MODAL */}
      {showParentPinModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F0F15] border border-red-500/20 max-w-md w-full rounded-[30px] p-8 flex flex-col gap-6 shadow-2xl relative animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-500 to-amber-500 flex items-center justify-center shadow-lg shadow-red-500/15">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight">
                  {t("parentPinVerify")}
                </h3>
                <p className="text-[11px] text-white/40">{t("parentPinSub")}</p>
              </div>
            </div>

            {pinError && (
              <div className="bg-red-500/10 border border-red-500/30 text-rose-300 p-3 rounded-2xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{t("parentPinError")}</span>
              </div>
            )}

            <form onSubmit={handlePinSubmit} className="flex flex-col gap-4">
              <input
                type="password"
                required
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••"
                className="bg-black/40 border border-white/10 text-white text-center text-3xl font-black py-4 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 tracking-widest"
              />

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowParentPinModal(false);
                    setPinInput("");
                    setPinError(false);
                  }}
                  className="bg-white/5 hover:bg-white/10 text-white text-xs font-bold py-3 px-4 rounded-xl flex-1 text-center"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-red-500 to-amber-500 text-white text-xs font-black py-3 px-4 rounded-xl flex-1 text-center shadow-lg shadow-red-500/20"
                >
                  {t("submit")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI ROBOT COMPANION "SAJID THE HAPPY STAR" MODAL DIALOG */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div className="bg-[#031c15] border border-amber-400/30 max-w-2xl w-full rounded-[38px] p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden shadow-2xl animate-scale-up">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-tr from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-400/20 animate-pulse border border-amber-300">
                <span className="text-3xl text-white">🌟</span>
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight text-amber-200">
                  {t("aiSearchHeadline")}
                </h3>
                <p className="text-xs text-emerald-300/80 font-bold">
                  {t("aiSearchSub")}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAiModal(false);
                  setAiPrompt("");
                  setAiResponse(null);
                }}
                className="text-white/40 hover:text-white text-2xl ml-auto border border-white/10 w-8 h-8 rounded-full flex items-center justify-center"
              >
                &times;
              </button>
            </div>

            <form
              onSubmit={handleAiSearchSubmit}
              className="flex flex-col gap-3"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder={t("aiPromptLabel")}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="bg-black/55 border border-amber-500/20 text-white text-sm p-4 rounded-2xl outline-none flex-1 focus:ring-2 focus:ring-amber-400 transition-all placeholder-white/30"
                />

                <button
                  type="submit"
                  disabled={aiIsLoading}
                  className="bg-gradient-to-r from-amber-400 to-emerald-500 text-emerald-950 px-6 rounded-2xl font-black text-xs hover:shadow-lg hover:shadow-amber-400/20 duration-300 flex items-center justify-center"
                >
                  {aiIsLoading ? t("downloading") : (lang === "ar" ? "تحدث 🚀" : "TALK 🚀")}
                </button>
              </div>
            </form>

            {/* Response Section */}
            {aiIsLoading && (
              <div className="flex flex-col items-center justify-center py-10 gap-2 font-bold text-xs text-white/40">
                <div className="w-10 h-10 border-2 border-dashed border-amber-400 rounded-full animate-spin mb-3"></div>
                <span className="text-amber-200">
                  {lang === "ar" 
                    ? "سعيد نجمنا المحبوب يبحث لك عن أكثر الأفلام مرحاً وسعادة... 🌟🕌" 
                    : "Sajid the Happy Star is searching for the most joyful and happy movies for you... 🌟🕌"}
                </span>
              </div>
            )}

            {aiResponse && (
              <div className="bg-black/55 border border-amber-500/20 p-5 rounded-2xl flex flex-col gap-4 animate-fade-in relative">
                <div className="absolute top-3 right-3 bg-amber-400 text-emerald-950 text-[8px] font-black px-2 py-0.5 rounded uppercase font-mono">
                  {lang === "ar" ? "مقترحات سعيد 🌟" : "Sajid's Stars ✨"}
                </div>

                <div className="flex gap-2 items-start">
                  <span className="text-xl">🌟</span>
                  <p className="text-xs md:text-sm font-semibold text-amber-100 italic leading-relaxed">
                    &quot;{aiResponse.explanation}&quot;
                  </p>
                </div>

                {/* Recommendations carousel inside robot box */}
                {recList.length > 0 && (
                  <div className="flex flex-col gap-2 mt-2">
                    <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">
                      {t("recForYou")}
                    </span>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {recList.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setActiveVideo(item);
                            setShowAiModal(false);
                            document
                              .getElementById("video-arena")
                              ?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="bg-white/5 border border-white/10 rounded-xl p-2 cursor-pointer hover:border-cyan-400 group transition-all"
                        >
                          <img
                            src={item.poster}
                            alt=""
                            className="w-full h-16 object-cover rounded-lg group-hover:opacity-80"
                          />
                          <h4 className="text-[10px] font-bold line-clamp-1 text-white mt-1.5">
                            {item.title[lang] || item.title.en}
                          </h4>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SPEECH RECOGNITION LIVE VOICE HUD FEEDBACK */}
      <AnimatePresence>
        {isVoiceActive && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className={`fixed bottom-6 right-6 left-6 md:left-auto md:w-[350px] bg-[#0A0A12]/95 border border-cyan-500/30 rounded-[30px] p-5 shadow-2xl z-50 backdrop-blur-md overflow-hidden animate-fade-in ${
              isRtl ? "text-right" : "text-left"
            }`}
          >
            {/* Ambient decorative backdrop glow */}
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-cyan-500/20 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-red-500/10 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-xs font-black tracking-widest text-[#00F2FF] uppercase">
                  {isRtl ? "التحكم الصوتي السحري 🎙️" : "Magic Voice Control 🎙️"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsVoiceActive(false)}
                className="text-white/40 hover:text-white-80 text-xs bg-white/5 hover:bg-white/10 w-6 h-6 rounded-full flex items-center justify-center transition-all"
              >
                &times;
              </button>
            </div>

            {/* Simulated Animated Audio Waveforms */}
            <div className="flex items-center justify-center gap-1.5 my-4 h-6">
              <div
                className="w-1 bg-[#00F2FF] rounded-full animate-[bounce_1s_infinite] min-h-[4px]"
                style={{ animationDelay: "0.1s" }}
              />
              <div
                className="w-1 bg-purple-500 rounded-full animate-[bounce_1s_infinite] min-h-[14px]"
                style={{ animationDelay: "0.3s" }}
              />
              <div
                className="w-1 bg-pink-500 rounded-full animate-[bounce_1s_infinite] min-h-[22px]"
                style={{ animationDelay: "0.5s" }}
              />
              <div
                className="w-1 bg-[#00F2FF] rounded-full animate-[bounce_1s_infinite] min-h-[16px]"
                style={{ animationDelay: "0.2s" }}
              />
              <div
                className="w-1 bg-purple-500 rounded-full animate-[bounce_1s_infinite] min-h-[10px]"
                style={{ animationDelay: "0.4s" }}
              />
              <div
                className="w-1 bg-pink-500 rounded-full animate-[bounce_1s_infinite] min-h-[4px]"
                style={{ animationDelay: "0.1s" }}
              />
            </div>

            {/* Real-time speech transcript indicator */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-3.5 text-center min-h-[64px] flex flex-col items-center justify-center gap-1">
              {voiceTranscript ? (
                <>
                  <span className="text-[10px] uppercase tracking-wider text-pink-400 font-extrabold">
                    {isRtl ? "سمعت للتو:" : "Heard Live:"}
                  </span>
                  <p className="text-xs font-bold text-white italic">
                    &quot;{voiceTranscript}&quot;
                  </p>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <p className="text-xs text-white/50 animate-pulse font-medium">
                    {voiceStatus === "listening"
                      ? isRtl
                        ? "بانتظار أمرك الصوتي... تحدث الآن 💫"
                        : "Listening for your command... Speak now 💫"
                      : isRtl
                        ? "جاري البدء..."
                        : "Ready..."}
                  </p>
                  <span className="text-[9px] text-white/30 italic">
                    {isRtl
                      ? "تحدث بوضوح نحو الميكروفون"
                      : "Speak clearly into your microphone"}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Helper guidelines of voice commands */}
            <div className="mt-4 flex flex-col gap-2">
              <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">
                {isRtl
                  ? "الأوامر الصوتية المدعومة:"
                  : "Try saying these commands:"}
              </span>

              <div className="flex flex-col gap-1.5 text-[11px] text-white/70">
                <div className="flex items-center justify-between bg-white/5 p-1.5 px-3 rounded-xl border border-white/5">
                  <span className="font-extrabold text-[#00F2FF]">
                    {isRtl ? "1. تشغيل / شغله" : '1. "play"'}
                  </span>
                  <span className="text-[10px] text-white/40">
                    {isRtl ? "يبدأ تشغيل الفيديو" : "Starts simulated video"}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white/5 p-1.5 px-3 rounded-xl border border-white/5">
                  <span className="font-extrabold text-pink-400">
                    {isRtl ? "2. إيقاف / قف" : '2. "pause"'}
                  </span>
                  <span className="text-[10px] text-white/40">
                    {isRtl ? "يوقف المشغل مؤقتاً" : "Pauses simulated video"}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white/5 p-1.5 px-3 rounded-xl border border-white/5">
                  <span className="font-extrabold text-[#00F2FF]">
                    {isRtl ? "3. الرئيسية" : '3. "go home"'}
                  </span>
                  <span className="text-[10px] text-white/40">
                    {isRtl ? "العودة للصفحة الرئيسية" : "Returns to home feed"}
                  </span>
                </div>
                <div className="flex flex-col gap-1 bg-white/5 p-2 rounded-xl border border-white/5 text-left">
                  <span className="font-extrabold text-purple-400">
                    {isRtl ? "4. ابحث عن [كلمة]" : '4. "search for [keyword]"'}
                  </span>
                  <p className="text-[9px] text-white/40 leading-tight">
                    {isRtl
                      ? 'مثال: "ابحث عن ديناصورات" للبحث التلقائي السريع'
                      : 'e.g. "search for dinosaurs" or "search for rabbits"'}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-[9px] text-white/30 mt-3 text-center">
              {isRtl
                ? "ملاحظة: يتطلب هذا المتصفح ميزة Speech Recognition."
                : "Supports Firefox, Chrome, Edge and Safari Web Speech API"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Help Sheet */}
      <AnimatePresence>
        {showHotkeysModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setShowHotkeysModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-md p-6 rounded-[30px] bg-[#0E0E14] border border-[#00F2FF]/20 shadow-[0_20px_50px_rgba(0,242,255,0.15)] text-white/90 text-left font-sans relative overflow-hidden cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-transparent blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-cyan-500/15 text-cyan-400 rounded-2xl border border-cyan-400/20">
                    <Keyboard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black tracking-wide text-white">
                      {lang === "ar"
                        ? "أزرار التحكم السريع"
                        : "Keyboard Shortcuts"}
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-medium">
                      {lang === "ar"
                        ? "تحكم بالبث كالمحترفين"
                        : "Cinematic stream hotkeys"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHotkeysModal(false)}
                  className="p-1 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 transition-colors uppercase font-mono text-[9px] font-black border border-white/5 active:scale-95 cursor-pointer"
                >
                  {lang === "ar" ? "إغلاق ×" : "Close [Esc]"}
                </button>
              </div>

              <div className="flex flex-col gap-3 font-medium">
                {[
                  {
                    key: "Space",
                    descAr: "تشغيل / إيقاف مؤقت للفيلم",
                    descEn: "Toggle Video Play & Pause",
                  },
                  {
                    key: "← Left Arrow",
                    descAr: "إرجاع البث 10 ثوانٍ للخلف",
                    descEn: "Seek backward 10 seconds",
                  },
                  {
                    key: "→ Right Arrow",
                    descAr: "تقديم البث 10 ثوانٍ للأمام",
                    descEn: "Seek forward 10 seconds",
                  },
                  {
                    key: "M",
                    descAr: "كتم / تفعيل الصوت الفوري",
                    descEn: "Toggle Mute & Unmute volume",
                  },
                  {
                    key: "T",
                    descAr: "تفعيل / إيقاف نمط المسرح السينمائي",
                    descEn: "Toggle Theater Mode view scale",
                  },
                  {
                    key: "C",
                    descAr: "تفعيل / إلغاء الهالة الملونة الخلفية",
                    descEn: "Toggle Ambient Aura glow halo",
                  },
                  {
                    key: "N",
                    descAr: "عرض نافذة البيانات التفريبية للبث",
                    descEn: "Toggle developer Stats for Nerds",
                  },
                  {
                    key: "L",
                    descAr: "قفل واجهة الأزرار لمنع الضغط بالخطأ",
                    descEn: "Lock player controls overlay HUD",
                  },
                  {
                    key: "B",
                    descAr: "إنشاء علامة فصل مخصصة في الوقت الحالي",
                    descEn: "Add customized timeline bookmark",
                  },
                  {
                    key: "H",
                    descAr: "عرض دليل مفاتيح الاختصارات المفتوح",
                    descEn: "Toggle this help reference sheets",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.04] p-2.5 px-3.5 rounded-2xl border border-white/5 transition-all text-[11px]"
                  >
                    <span className="text-zinc-300 font-semibold">
                      {lang === "ar" ? item.descAr : item.descEn}
                    </span>
                    <kbd className="bg-zinc-800/80 text-cyan-300 font-mono text-[10px] font-bold px-2.5 py-1 rounded-lg border border-white/10 shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>

              <div className="mt-5 border-t border-white/5 pt-3.5 flex items-center justify-between text-[10px]">
                <span className="text-white/30">
                  {lang === "ar"
                    ? "الحالة الحالية المقفلة:"
                    : "Current Lock State:"}
                </span>
                <span
                  className={`font-black uppercase tracking-wider ${isPlayerLocked ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}`}
                >
                  {isPlayerLocked
                    ? lang === "ar"
                      ? "🔒 نشطة (الأزرار مقفلة)"
                      : "🔒 Active (UI Locked)"
                    : lang === "ar"
                      ? "🔓 معطلة (مفتوحة)"
                      : "🔓 Offline (Unlocked)"}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
