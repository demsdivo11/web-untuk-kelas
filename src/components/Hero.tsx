import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GraduationCap, Users, Heart, Star, Sparkles } from 'lucide-react';
import { useClassProfile } from '../hooks/useClassProfile';

const Hero = () => {
  const { displayName, studentCount, contactName } = useClassProfile();
  const spotlightMessage = `Kontak kelas: ${contactName}. Mari buat tahun ajaran ini makin seru!`;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" />

      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 left-10 text-blue-200"
        >
          <GraduationCap className="h-12 w-12" />
        </motion.div>

        <motion.div
          animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute top-40 right-20 text-purple-200"
        >
          <Users className="h-10 w-10" />
        </motion.div>

        <motion.div
          animate={{ y: [0, -25, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-40 left-20 text-pink-200"
        >
          <Heart className="h-8 w-8" />
        </motion.div>

        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute bottom-20 right-10 text-yellow-200"
        >
          <Star className="h-6 w-6" />
        </motion.div>
      </div>

      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-6">
            <GraduationCap className="h-12 w-12 text-blue-600" />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {displayName}
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
            Website resmi {displayName} untuk berbagi cerita, confess rahasia, dan nostalgia lewat galeri kenangan.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4">
            <Link
              to="/confess"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-center"
            >
              Mulai Confess
            </Link>
            <Link
              to="/gallery"
              className="w-full sm:w-auto border-2 border-blue-200 text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 text-center"
            >
              Lihat Galeri
            </Link>
            <Link
              to="/admin"
              className="w-full sm:w-auto text-gray-600 px-8 py-3 rounded-full font-semibold border border-gray-200 hover:bg-gray-50 transition-all duration-200 text-center"
            >
              Admin Panel
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-lg w-fit mx-auto mb-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {studentCount} Siswa
            </h3>
            <p className="text-gray-600">Keluarga besar {displayName} yang solid dan kompak</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-lg w-fit mx-auto mb-4">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Confess System</h3>
            <p className="text-gray-600">Sampaikan perasaanmu dengan aman dan anonim</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-3 rounded-lg w-fit mx-auto mb-4">
              <Star className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Galeri Kenangan</h3>
            <p className="text-gray-600">Koleksi momen-momen berharga bersama</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="space-y-4"
        >
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
            <div className="flex items-center gap-2 text-blue-600 mb-3">
              <Sparkles className="h-5 w-5" />
              <span className="uppercase tracking-widest text-xs font-semibold">X-5 Spotlight</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Selamat datang di rumah digital {displayName}!
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Tempat kita berbagi cerita, galeri kenangan, dan confess rahasia yang dijaga aman oleh pengurus kelas.
              {spotlightMessage}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
