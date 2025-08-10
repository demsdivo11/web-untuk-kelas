const API_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export interface ConfessRequest {
  sender?: string;
  recipient: string;
  from_class?: string;
  message: string;
  song_name?: string;
  song_artist?: string;
  song_spotify_id?: string;
  is_anonymous?: boolean;
  is_class_secret?: boolean;
}

export interface ConfessResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export const confessApi = {
  // Create new confession
  create: async (confession: ConfessRequest): Promise<ConfessResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/confess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(confession),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  // Get all confessions
  getAll: async (): Promise<ConfessResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/confess`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};