import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Instagram, MessageCircle, Users } from 'lucide-react';

const ContactSection = () => {
  const contacts = [
    {
      title: "Ketua Kelas",
      name: "Ahmad Rizki",
      role: "Koordinator Utama",
      phone: "+62 812-3456-7890",
      instagram: "@ahmadrizki_x5",
      icon: Users,
      color: "from-blue-500 to-purple-500"
    },
    {
      title: "Wakil Ketua",
      name: "Sari Indah",
      role: "Koordinator Pendamping",
      phone: "+62 813-4567-8901",
      instagram: "@sariindah_x5",
      icon: MessageCircle,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Sekretaris",
      name: "Budi Santoso",
      role: "Administrasi & Dokumentasi",
      phone: "+62 814-5678-9012",
      instagram: "@budisantoso_x5",
      icon: Mail,
      color: "from-green-500 to-teal-500"
    }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-6">
            <Phone className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Hubungi Kami
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ada pertanyaan atau ingin berkolaborasi? Jangan ragu untuk menghubungi pengurus kelas X-5
          </p>
        </motion.div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {contacts.map((contact, index) => {
            const IconComponent = contact.icon;
            return (
              <motion.div
                key={contact.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className={`bg-gradient-to-r ${contact.color} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-4">
                    <IconComponent className="h-8 w-8" />
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                      <IconComponent className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{contact.title}</h3>
                  <p className="text-white/90 font-medium">{contact.name}</p>
                  <p className="text-white/80 text-sm">{contact.role}</p>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Phone className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">WhatsApp</p>
                      <p className="font-medium text-gray-800">{contact.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="bg-pink-100 p-2 rounded-lg">
                      <Instagram className="h-4 w-4 text-pink-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Instagram</p>
                      <p className="font-medium text-gray-800">{contact.instagram}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* School Information */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Informasi Sekolah
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg mt-1">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">SMA Negeri 1 Jakarta</p>
                    <p className="text-gray-600">Jl. Pendidikan No. 123, Jakarta Pusat</p>
                    <p className="text-gray-600">DKI Jakarta 10110</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">(021) 1234-5678</p>
                    <p className="text-gray-600">Telepon Sekolah</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Mail className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">info@sman1jakarta.sch.id</p>
                    <p className="text-gray-600">Email Sekolah</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
              <h4 className="text-xl font-bold text-gray-800 mb-4">Jam Sekolah</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Senin - Jumat</span>
                  <span className="font-medium text-gray-800">07:00 - 15:30</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sabtu</span>
                  <span className="font-medium text-gray-800">07:00 - 12:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Minggu</span>
                  <span className="font-medium text-gray-800">Libur</span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-white rounded-lg">
                <p className="text-sm text-gray-600 text-center">
                  <strong>Kelas X-5</strong> - Ruang 205, Lantai 2, Gedung Utama
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Mari Berkolaborasi!</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Punya ide untuk kegiatan kelas atau ingin berkontribusi untuk website ini? 
              Hubungi pengurus kelas atau langsung chat di grup WhatsApp kelas X-5.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors duration-200">
                Join Grup WhatsApp
              </button>
              <button className="bg-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors duration-200">
                Follow Instagram Kelas
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
