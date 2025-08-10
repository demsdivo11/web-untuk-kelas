import React from 'react';
import { motion } from 'framer-motion';
import { Camera, ImageOff } from 'lucide-react';

const Gallery = () => {
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
      </div>
    </div>
  );
};

export default Gallery;