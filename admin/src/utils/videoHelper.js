/**
 * Video Helper Utility for Game Previews & Cards
 * Supports Direct MP4/WebM videos, YouTube (Standard, Shorts, Embeds), and Vimeo.
 */

export function parseVideoSource(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  let url = rawUrl.trim();
  if (!url) return null;

  // Extract src if full iframe HTML tag was pasted
  const iframeMatch = url.match(/src=["']([^"']+)["']/i);
  if (iframeMatch) {
    url = iframeMatch[1];
  }

  // 1. YouTube detection (watch, shorts, embed, youtu.be, mobile)
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      id: videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&playsinline=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0`
    };
  }

  // 2. Vimeo detection
  const vimeoMatch = url.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    return {
      type: 'vimeo',
      id: videoId,
      embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1&autopause=0&background=1&controls=0`
    };
  }

  // 3. Direct video or standard URL
  return {
    type: 'direct',
    url: url
  };
}

export function getGamePreviewVideo(game) {
  if (game?.previewVideo && typeof game.previewVideo === 'string' && game.previewVideo.trim()) {
    return game.previewVideo.trim();
  }
  if (!game?.gameUrl || typeof game.gameUrl !== 'string') return null;
  const url = game.gameUrl.trim();

  // CrazyGames game/embed/en_US url format
  const cgPathMatch = url.match(/crazygames\.com\/(?:game|embed|en_US)\/([a-zA-Z0-9-]+)/i);
  if (cgPathMatch && cgPathMatch[1]) {
    return `https://videos.crazygames.com/games/${cgPathMatch[1]}/cover-16x9.mp4`;
  }

  // CrazyGames files / subdomain format
  const cgSubMatch = url.match(/https?:\/\/([a-zA-Z0-9-]+)\.game-files\.crazygames\.com/i) ||
                     url.match(/https?:\/\/files\.crazygames\.com\/([a-zA-Z0-9-]+)/i);
  if (cgSubMatch && cgSubMatch[1]) {
    return `https://videos.crazygames.com/games/${cgSubMatch[1]}/cover-16x9.mp4`;
  }

  return null;
}
