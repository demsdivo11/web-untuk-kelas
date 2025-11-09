import { useState, type ChangeEvent, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Send,
  Music,
  User,
  Users,
  MessageCircle,
  Sparkles,
  Headphones,
  Search,
  Loader2,
  ExternalLink,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { confessApi } from '../services/confessApi';
import { spotifyApi, SpotifyTrack } from '../services/spotifyApi';

const Confess = () => {
  const [formData, setFormData] = useState({
    sender: '',
    recipient: '',
    from_class: '',
    message: '',
    song_name: '',
    song_artist: '',
    song_spotify_id: '',
    is_anonymous: false,
    is_class_secret: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [songQuery, setSongQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [spotifyError, setSpotifyError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await confessApi.create(formData);

      if (response.success) {
        setSubmitStatus('success');
        setFormData({
          sender: '',
          recipient: '',
          from_class: '',
          message: '',
          song_name: '',
          song_artist: '',
          song_spotify_id: '',
          is_anonymous: false,
          is_class_secret: false,
        });
        setSelectedTrack(null);
        setSongQuery('');
        setSearchResults([]);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSpotifySearch = async () => {
    if (!songQuery.trim()) {
      setSpotifyError('Tulis judul lagu terlebih dahulu.');
      return;
    }

    setIsSearching(true);
    setSpotifyError(null);

    try {
      const tracks = await spotifyApi.searchTracks(songQuery);
      setSearchResults(tracks);
      if (tracks.length === 0) {
        setSpotifyError('Lagu tidak ditemukan. Coba kata kunci lain.');
      }
    } catch (error) {
      setSpotifyError(
        error instanceof Error ? error.message : 'Terjadi kesalahan saat mencari lagu. Coba lagi nanti.'
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleTrackSelect = (track: SpotifyTrack) => {
    setSelectedTrack(track);
    setFormData((prev) => ({
      ...prev,
      song_name: track.name,
      song_artist: track.artists.map((artist) => artist.name).join(', '),
      song_spotify_id: track.id,
    }));
  };

  const handleClearSelectedTrack = () => {
    setSelectedTrack(null);
    setFormData((prev) => ({ ...prev, song_spotify_id: '' }));
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full mb-6">
            <Heart className="h-8 w-8 text-pink-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Confess Your Feelings
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sampaikan perasaanmu dengan aman dan tetap rahasia untuk teman-teman di kelas X-5.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-2" />
                  Nama Pengirim (Opsional)
                </label>
                <input
                  type="text"
                  name="sender"
                  value={formData.sender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Kosongkan jika ingin anonim"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Heart className="inline h-4 w-4 mr-2" />
                  Penerima *
                </label>
                <input
                  type="text"
                  name="recipient"
                  value={formData.recipient}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Nama penerima"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline h-4 w-4 mr-2" />
                Asal Kelas Pengirim
              </label>
              <input
                type="text"
                name="from_class"
                value={formData.from_class}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Contoh: X-5, XI-2, XII-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageCircle className="inline h-4 w-4 mr-2" />
                Pesan *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Tulis pesan atau perasaanmu di sini..."
                required
              />
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-100 rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm font-semibold text-pink-600 uppercase tracking-wide mb-1">
                      Playlist Moment
                    </p>
                    <h3 className="text-2xl font-bold text-gray-800">Tambahkan Lagu Spotify</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Cari lagu favoritmu agar confess terasa lebih spesial.
                    </p>
                  </div>
                  <Headphones className="h-10 w-10 text-pink-500" />
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={songQuery}
                      onChange={(e) => setSongQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSpotifySearch();
                        }
                      }}
                      placeholder="Cari judul lagu atau nama penyanyi"
                      className="w-full pl-10 pr-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  <button
                    type="button"
                    onClick={handleSpotifySearch}
                    disabled={isSearching}
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg font-medium hover:from-pink-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-60"
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Mencari...
                      </>
                    ) : (
                      <>
                        <Music className="h-4 w-4 mr-2" />
                        Cari Lagu
                      </>
                    )}
                  </button>
                </div>

                {spotifyError && (
                  <p className="mt-3 text-sm text-red-600 flex items-center">
                    <XCircle className="h-4 w-4 mr-2" />
                    {spotifyError}
                  </p>
                )}

                {selectedTrack && (
                  <div className="mt-6 bg-white rounded-xl p-4 shadow-inner border border-pink-100">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <img
                        src={selectedTrack.album.images?.[0]?.url}
                        alt={selectedTrack.name}
                        className="w-24 h-24 rounded-lg object-cover shadow-md"
                      />
                      <div className="flex-1">
                        <p className="text-sm uppercase tracking-wide text-pink-500 font-semibold mb-1">
                          Lagu dipilih
                        </p>
                        <h4 className="text-xl font-bold text-gray-800">{selectedTrack.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {selectedTrack.artists.map((artist) => artist.name).join(', ')}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <a
                            href={selectedTrack.external_urls.spotify}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-pink-600 hover:text-pink-700 font-medium"
                          >
                            Dengarkan di Spotify <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                          <button
                            type="button"
                            onClick={handleClearSelectedTrack}
                            className="text-sm text-gray-500 hover:text-gray-700"
                          >
                            Ganti lagu
                          </button>
                        </div>
                        {selectedTrack.preview_url && (
                          <audio controls src={selectedTrack.preview_url} className="mt-3 w-full rounded-lg">
                            Browser kamu tidak mendukung audio preview.
                          </audio>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {searchResults.length > 0 && !selectedTrack && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchResults.map((track) => (
                      <button
                        type="button"
                        key={track.id}
                        onClick={() => handleTrackSelect(track)}
                        className="flex items-center gap-3 bg-white rounded-xl p-3 border border-pink-100 hover:border-pink-200 hover:shadow-md transition-all duration-200 text-left"
                      >
                        <img
                          src={track.album.images?.[0]?.url}
                          alt={track.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{track.name}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {track.artists.map((artist) => artist.name).join(', ')}
                          </p>
                          <p className="text-xs text-gray-400">{track.album.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Music className="inline h-4 w-4 mr-2" />
                    Nama Lagu (Opsional)
                  </label>
                  <input
                    type="text"
                    name="song_name"
                    value={formData.song_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Judul lagu"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Sparkles className="inline h-4 w-4 mr-2" />
                    Artis/Penyanyi (Opsional)
                  </label>
                  <input
                    type="text"
                    name="song_artist"
                    value={formData.song_artist}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Nama artis"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_anonymous"
                  checked={formData.is_anonymous}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Kirim secara anonim (nama pengirim tidak akan ditampilkan)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_class_secret"
                  checked={formData.is_class_secret}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Rahasia kelas (hanya diketahui teman sekelas)
                </label>
              </div>
            </div>

            {submitStatus === 'success' && (
              <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-green-800 font-semibold">Pesan berhasil dikirim!</p>
                  <p className="text-sm text-green-700">
                    Terima kasih sudah berbagi perasaanmu. Admin akan menjaga kerahasiaannya.
                  </p>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-red-800 font-semibold">Gagal mengirim pesan.</p>
                  <p className="text-sm text-red-700">
                    Terjadi kendala jaringan atau server. Coba lagi beberapa saat nanti.
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 px-6 rounded-lg font-medium hover:from-pink-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Kirim Pesan</span>
                </>
              )}
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6"
        >
          <h3 className="font-semibold text-blue-800 mb-2">Tips Confess Aman:</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>- Pesan akan disimpan dengan aman oleh admin kelas.</li>
            <li>- Gunakan bahasa yang sopan dan menghargai perasaan orang lain.</li>
            <li>- Tambahkan lagu agar vibe confess makin kerasa.</li>
            <li>- Centang opsi anonim bila tidak ingin identitasmu terungkap.</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default Confess;
