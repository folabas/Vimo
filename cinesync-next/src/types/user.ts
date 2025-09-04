import { BaseUser } from './common';

/**
 * User interface extending BaseUser with additional user-specific properties
 */
export interface User extends BaseUser {
  /** User's biography or description */
  bio?: string;
  
  /** User preferences and settings */
  settings: UserSettings;
  
  /** User statistics and activity metrics */
  stats: UserStats;
  
  /** Social media and external links */
  socials?: UserSocials;
}

/**
 * User social media and external links
 */
export interface UserSocials {
  twitter?: string;
  discord?: string;
  youtube?: string;
  twitch?: string;
  website?: string;
  github?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  linkedin?: string;
  steam?: string;
  xbox?: string;
  playstation?: string;
  nintendo?: string;
  epic?: string;
  origin?: string;
  battleNet?: string;
  uplay?: string;
  other?: {
    name: string;
    url: string;
  }[];
}

/**
 * User settings and preferences
 */
export interface UserSettings {
  // Theme and display
  theme: 'light' | 'dark' | 'system';
  language: string;
  fontSize: 'small' | 'medium' | 'large';
  density: 'compact' | 'normal' | 'comfortable';
  
  // Notification preferences
  notifications: {
    // Notification channels
    email: boolean;
    push: boolean;
    inApp: boolean;
    sound: boolean;
    
    // Notification types
    types: {
      messages: boolean;
      mentions: boolean;
      replies: boolean;
      reactions: boolean;
      friendRequests: boolean;
      roomInvites: boolean;
      roomUpdates: boolean;
      videoUpdates: boolean;
    };
    
    // Do Not Disturb
    dnd: {
      enabled: boolean;
      startTime: string; // 'HH:MM' format
      endTime: string;   // 'HH:MM' format
      days: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
    };
  };
  
  // Privacy settings
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    activityStatus: 'show_all' | 'friends_only' | 'hide';
    onlineStatus: 'show' | 'friends_only' | 'hide';
    lastSeen: 'show' | 'friends_only' | 'hide';
    friendList: 'show' | 'friends_only' | 'hide';
    roomList: 'show' | 'friends_only' | 'hide';
    
    // Data sharing
    analytics: boolean;
    personalizedAds: boolean;
    thirdPartySharing: boolean;
  };
  
  // Playback settings
  playback: {
    defaultQuality: 'auto' | '144p' | '240p' | '360p' | '480p' | '720p' | '1080p' | '1440p' | '2160p';
    defaultPlaybackRate: 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2;
    defaultVolume: number; // 0-100
    autoplay: boolean;
    loop: boolean;
    rememberPlaybackPosition: boolean;
    autoSkipIntro: boolean;
    autoSkipRecap: boolean;
    autoPlayNextEpisode: boolean;
    
    // Subtitle settings
    subtitles: {
      enabled: boolean;
      language: string;
      size: 'small' | 'medium' | 'large';
      backgroundColor: string;
      textColor: string;
      fontFamily: string;
      edgeStyle: 'none' | 'raised' | 'depressed' | 'outline' | 'dropShadow';
      windowColor: string;
      windowOpacity: number;
    };
    
    // Audio settings
    audio: {
      language: string;
      description: string;
      volume: number;
      balance: number; // -1 (left) to 1 (right)
      normalize: boolean;
      boost: boolean;
    };
  };
  
  // Chat settings
  chat: {
    theme: 'light' | 'dark' | 'system';
    messageDisplay: 'compact' | 'comfortable' | 'cozy';
    showTimestamps: boolean;
    showAvatars: boolean;
    showReadReceipts: boolean;
    showTypingIndicator: boolean;
    showOnlineStatus: boolean;
    showJoinLeaveMessages: boolean;
    showSystemMessages: boolean;
    emojiStyle: 'native' | 'twemoji' | 'emojione' | 'apple' | 'google';
    messageGrouping: boolean;
    messageGroupingTime: number; // in seconds
    linkPreview: boolean;
    imagePreview: boolean;
    gifAutoplay: boolean;
    emojiAutocomplete: boolean;
    spellCheck: boolean;
    markdown: boolean;
    sendOnEnter: 'send' | 'newLine' | 'ctrlEnter';
  };
  
  // Accessibility settings
  accessibility: {
    highContrastMode: boolean;
    reducedMotion: boolean;
    keyboardNavigation: boolean;
    screenReader: boolean;
    fontSize: 'small' | 'medium' | 'large' | 'xlarge';
    lineHeight: 'normal' | '1.5' | '2' | '2.5';
    letterSpacing: 'normal' | 'wide' | 'wider';
    colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';
    colorInversion: boolean;
    cursorSize: 'small' | 'medium' | 'large';
    highlightFocus: boolean;
  };
  
  // Content restrictions
  contentRestrictions: {
    matureContent: boolean;
    explicitContent: boolean;
    spoilers: 'show' | 'blur' | 'hide';
    ageRestrictedContent: boolean;
    contentWarnings: 'show' | 'blur' | 'hide';
    contentWarningsList: string[];
  };
  
  // Keyboard shortcuts
  keyboardShortcuts: {
    [key: string]: string;
  };
  
  // Sync settings
  sync: {
    syncAcrossDevices: boolean;
    syncHistory: boolean;
    syncWatchlist: boolean;
    syncPreferences: boolean;
    syncPlayback: boolean;
    syncQueue: boolean;
    syncRatings: boolean;
    syncSubscriptions: boolean;
  };
  
  // Advanced settings
  advanced: {
    hardwareAcceleration: boolean;
    lowLatencyMode: boolean;
    debugMode: boolean;
    devTools: boolean;
    experimentalFeatures: boolean;
    analytics: boolean;
    crashReports: boolean;
    telemetry: boolean;
    usageStatistics: boolean;
  };
  
  // Last updated timestamp
  updatedAt: Date;
}

/**
 * Essential user statistics and activity tracking
 */
export interface UserStats {
  // Room stats
  totalRoomsCreated: number;
  totalRoomsJoined: number;
  totalWatchTime: number; // in seconds
  
  // Social stats
  totalMessagesSent: number;
  totalFriends: number;
  
  // Content interaction
  totalVideosWatched: number;
  
  // Last active timestamp
  lastActive?: Date;
}

export interface UserActivity {
  id: string;
  type: 'login' | 'logout' | 'room_join' | 'room_leave' | 'video_play' | 'video_pause' | 'video_seek' | 'video_change' | 'message_send' | 'settings_update' | 'profile_update' | 'password_change' | 'email_verification' | 'password_reset' | 'account_deletion' | 'account_suspension' | 'account_termination' | 'account_reactivation' | 'account_verification' | 'account_update' | 'account_delete';
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  location?: {
    city?: string;
    region?: string;
    country?: string;
    timezone?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  metadata?: Record<string, any>;
}

export interface UserNotification {
  id: string;
  type: 'friend_request' | 'room_invite' | 'message' | 'mention' | 'like' | 'comment' | 'follow' | 'system' | 'warning' | 'info' | 'success' | 'error' | 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
  actionUrl?: string;
  actionText?: string;
  icon?: string;
  image?: string;
  user?: Pick<User, 'id' | 'username' | 'avatar'>;
  metadata?: Record<string, any>;
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  ipAddress: string;
  userAgent: string;
  location?: {
    city?: string;
    region?: string;
    country?: string;
    timezone?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  device: {
    type: 'desktop' | 'mobile' | 'tablet' | 'smart-tv' | 'game-console' | 'other';
    os: string;
    browser: string;
    isBot: boolean;
  };
  isCurrent: boolean;
  lastActiveAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
