import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Shield, Users, BookOpen, Palette, Heart, Trophy, Zap } from 'lucide-react';

const OrganizationalStructure = () => {
  const positions = [
    {
      title: "Ketua Kelas",
      name: "Ahmad Rizki",
      icon: Crown,
      color: "from-yellow-500 to-orange-500",
      description: "Memimpin dan mengkoordinasi seluruh kegiatan kelas"
    },
    {
      title: "Wakil Ketua",
      name: "Sari Indah",
      icon: Shield,
      color: "from-blue-500 to-purple-500",
      description: "Membantu ketua dalam menjalankan tugas-tugas kelas"
    },
    {
      title: "Sekretaris",
      name: "Budi Santoso",
      icon: BookOpen,
      color: "from-green-500 to-teal-500",
      description: "Mencatat dan mendokumentasikan kegiatan kelas"
    },
    {
      title: "Bendahara",
      name: "Maya Putri",
      icon: Trophy,
      color: "from-purple-500 to-pink-500",
      description: "Mengelola keuangan dan administrasi kelas"
    },
    {
      title: "Koordinator Kebersihan",
      name: "Doni Pratama",
      icon: Zap,
      color: "from-cyan-500 to-blue-500",
      description: "Mengatur jadwal piket dan kebersihan kelas"
    },
    {
      title: "Koordinator Acara",
      name: "Lisa Maharani",
      icon: Heart,
      color: "from-pink-500 to-rose-500",
      description: "Merencanakan dan mengorganisir acara kelas"
    }
  ];

  const allStudents = [
    "Ahmad Rizki", "Sari Indah", "Budi Santoso", "Maya Putri", "Doni Pratama", "Lisa Maharani",
    "Andi Wijaya", "Bella Sari", "Citra Dewi", "Dimas Eko", "Eka Putri", "Fajar Nugroho",
    "Gita Sari", "Hendra Kusuma", "Indira Sari", "Joko Susilo", "Karina Dewi", "Luki Pratama",
    "Mira Sari", "Nanda Putra", "Olivia Sari", "Putra Wijaya", "Qori Sari", "Randi Pratama",
    "Sinta Dewi", "Toni Kusuma", "Ulfa Sari", "Vina Putri", "Wawan Susilo", "Xenia Sari",
    "Yudi Pratama", "Zara Dewi", "Agus Santoso", "Bima Putra", "Candra Sari", "Devi Putri",
    "Eko Wijaya", "Fira Sari", "Gilang Pratama", "Hani Dewi", "Irfan Kusuma", "Jihan Sari",
    "Kevin Putra", "Lina Dewi", "Maulana Pratama", "Nina Sari", "Oscar Wijaya", "Putri Dewi", "Reza Pratama"
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-6">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Struktur Organisasi
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Pengurus kelas X-5 yang siap melayani dan memajukan kelas kita bersama
          </p>
        </motion.div>

        {/* Pengurus Kelas */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        >
          {positions.map((position, index) => {
            const IconComponent = position.icon;
            return (
              <motion.div
                key={position.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className={`bg-gradient-to-r ${position.color} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-4">
                    <IconComponent className="h-8 w-8" />
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                      <IconComponent className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{position.title}</h3>
                  <p className="text-white/90 font-medium">{position.name}</p>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-600 leading-relaxed">{position.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Daftar Semua Siswa */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8"
        >
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              Daftar Siswa Kelas X-5
            </h3>
            <p className="text-gray-600">
              Total: <span className="font-bold text-blue-600">{allStudents.length} siswa</span>
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {allStudents.map((student, index) => (
              <motion.div
                key={student}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-200 text-center group"
              >
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-200">
                  <span className="text-blue-600 font-bold text-lg">
                    {student.split(' ').map(name => name[0]).join('')}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                  {student}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Motto Kelas */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Motto Kelas X-5</h3>
            <p className="text-xl italic mb-4">
              "Bersatu Kita Teguh, Bercerai Kita Runtuh"
            </p>
            <p className="text-blue-100">
              Dengan semangat kebersamaan dan persatuan, kita wujudkan prestasi terbaik untuk kelas X-5
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default OrganizationalStructure;