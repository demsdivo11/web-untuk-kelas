import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, ImageOff, Eye, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Photo {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  thumbnail_url?: string;
  uploaded_by: string;
  created_at: string;
}

const Gallery = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_photos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-6">
            <Camera className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Galeri Kenangan
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Koleksi momen-momen berharga yang telah kita lalui bersama di kelas X-5
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading photos...</p>
          </div>
        ) : photos.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => setSelectedPhoto(photo)}
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={photo.thumbnail_url || photo.image_url}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 truncate">{photo.title}</h3>
                  {photo.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{photo.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(photo.created_at).toLocaleDateString('id-ID')}
                    </span>
                    <span className="text-xs text-blue-600 font-medium">
                      Klik untuk melihat
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center py-20"
          >
            <div className="bg-white rounded-2xl shadow-xl p-12 max-w-2xl mx-auto">
              <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full mb-6">
                <ImageOff className="h-12 w-12 text-gray-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Galeri Belum Tersedia
              </h2>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                Kami sedang mengumpulkan foto-foto kenangan terbaik dari kelas X-5. 
                Galeri akan segera diperbarui dengan momen-momen indah yang telah kita lalui bersama.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-700 text-sm">
                  💡 <strong>Info:</strong> Jika kamu memiliki foto kegiatan kelas yang ingin dibagikan, 
                  silakan hubungi pengurus kelas untuk menambahkannya ke galeri.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl max-h-[90vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">{selectedPhoto.title}</h2>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              <img
                src={selectedPhoto.image_url}
                alt={selectedPhoto.title}
                className="w-full max-h-96 object-contain rounded-lg mb-4"
              />
              
              {selectedPhoto.description && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Deskripsi:</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedPhoto.description}</p>
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                <span>Diunggah oleh: {selectedPhoto.uploaded_by}</span>
                <span>{new Date(selectedPhoto.created_at).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Gallery;