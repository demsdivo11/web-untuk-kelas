interface SpotifyTokenCache {
  token: string;
  expiresAt: number;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
}

const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

let cachedToken: SpotifyTokenCache | null = null;

const ensureCredentials = () => {
  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials are missing. Please set VITE_SPOTIFY_CLIENT_ID and VITE_SPOTIFY_CLIENT_SECRET.');
  }
};

const encodeCredentials = () => {
  const credentials = `${clientId}:${clientSecret}`;
  if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
    return window.btoa(credentials);
  }
  return btoa(credentials);
};

const getAccessToken = async (): Promise<string> => {
  ensureCredentials();

  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60 * 1000) {
    return cachedToken.token;
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${encodeCredentials()}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error('Gagal memperoleh token Spotify.');
  }

  const data = await response.json();
  const expiresAt = now + data.expires_in * 1000;
  cachedToken = { token: data.access_token, expiresAt };
  return data.access_token;
};

export const spotifyApi = {
  async searchTracks(query: string): Promise<SpotifyTrack[]> {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return [];
    }

    const token = await getAccessToken();
    const params = new URLSearchParams({
      q: trimmedQuery,
      type: 'track',
      limit: '6',
      market: 'ID',
    });

    const response = await fetch(`https://api.spotify.com/v1/search?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Pencarian Spotify gagal. Coba lagi sebentar lagi.');
    }

    const data = await response.json();
    return data?.tracks?.items || [];
  },

  async getTrackById(id: string): Promise<SpotifyTrack | null> {
    if (!id) return null;

    const token = await getAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Gagal mengambil detail lagu dari Spotify.');
    }

    const data = await response.json();
    return data || null;
  },
};
