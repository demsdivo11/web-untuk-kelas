import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Shield, Users, BookOpen, Heart, Trophy, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface StudentRecord {
  id: string;
  full_name: string;
  role_title?: string | null;
  role_description?: string | null;
  is_lead?: boolean | null;
  order_index?: number | null;
}

const iconMap: Record<string, typeof Crown> = {
  ketua: Crown,
  wakil: Shield,
  sekretaris: BookOpen,
  bendahara: Trophy,
  kebersihan: Zap,
  acara: Heart,
};

const highlightColors = [
  'from-yellow-500 to-orange-500',
  'from-blue-500 to-purple-500',
  'from-green-500 to-teal-500',
  'from-purple-500 to-pink-500',
  'from-cyan-500 to-blue-500',
  'from-pink-500 to-rose-500',
];

const OrganizationalStructure = () => {
  const [leaders, setLeaders] = useState<StudentRecord[]>([]);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .order('order_index', { ascending: true });

        if (error) throw error;

        const rows = data ?? [];
        setStudents(rows);
        setLeaders(rows.filter((student) => student.is_lead));
      } catch (error) {
        console.error('Failed to load students:', error);
        setStudents([]);
        setLeaders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

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
          {(leaders.length > 0 ? leaders : students.filter((_, idx) => idx < 6)).map((position, index) => {
            const normalizedRole = position.role_title?.toLowerCase().replace(/\s+/g, '') ?? '';
            const IconComponent = iconMap[normalizedRole] || Crown;
            const gradient = highlightColors[index % highlightColors.length];
            return (
              <motion.div
                key={position.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className={`bg-gradient-to-r ${gradient} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-4">
                    <IconComponent className="h-8 w-8" />
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                      <IconComponent className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{position.role_title || 'Pengurus'}</h3>
                  <p className="text-white/90 font-medium">{position.full_name}</p>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-600 dark:text-slate-300 leading-relaxed">
                    {position.role_description || 'Pengurus aktif kelas X-5.'}
                  </p>
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
              {loading
                ? 'Memuat data siswa...'
                : (
                  <>
                    Total:{' '}
                    <span className="font-bold text-blue-600">
                      {students.length} siswa
                    </span>
                  </>
                )}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {loading
              ? Array.from({ length: 10 }).map((_, index) => (
                  <motion.div
                    key={`placeholder-${index}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-lg p-4 shadow-md text-center animate-pulse"
                  >
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-full w-12 h-12 mx-auto mb-3" />
                    <div className="h-3 bg-gray-100 rounded w-24 mx-auto" />
                  </motion.div>
                ))
              : students.map((student, index) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-200 text-center group"
                  >
                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-200">
                      <span className="text-blue-600 font-bold text-lg">
                        {student.full_name
                          .split(' ')
                          .map((name: string) => name[0])
                          .join('')
                          .slice(0, 2)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                      {student.full_name}
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
