import { motion } from 'framer-motion';
import { GraduationCap, Heart, Users, Instagram, Mail, Phone } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'Confess', href: '/confess' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Admin', href: '/admin' }
  ];

  const socialLinks = [
    { name: 'Instagram Kelas', icon: Instagram, href: '#', color: 'text-pink-600' },
    { name: 'Email Kelas', icon: Mail, href: 'mailto:kelasx5@sman1jakarta.sch.id', color: 'text-blue-600' },
    { name: 'WhatsApp Grup', icon: Phone, href: '#', color: 'text-green-600' }
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-lg">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Kelas X-5</h3>
                <p className="text-blue-200">SMA Negeri 1 Jakarta</p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              Website resmi kelas X-5 yang menyediakan platform untuk berbagi perasaan melalui 
              sistem confess dan menyimpan kenangan indah dalam galeri foto. Mari kita jaga 
              kebersamaan dan ciptakan kenangan yang tak terlupakan.
            </p>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-blue-200">
                <Users className="h-5 w-5" />
                <span className="text-sm">49 Siswa Aktif</span>
              </div>
              <div className="flex items-center space-x-2 text-pink-200">
                <Heart className="h-5 w-5" />
                <span className="text-sm">Satu Keluarga</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold mb-6">Menu Utama</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2 group"
                  >
                    <span className="w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                    <span>{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact & Social */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold mb-6">Hubungi Kami</h4>
            <div className="space-y-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors duration-200 group"
                  >
                    <div className={`p-2 rounded-lg bg-gray-800 group-hover:bg-gray-700 transition-colors duration-200`}>
                      <IconComponent className={`h-4 w-4 ${social.color}`} />
                    </div>
                    <span className="text-sm">{social.name}</span>
                  </a>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
              <p className="text-sm text-gray-300">
                <strong className="text-white">Alamat Sekolah:</strong><br />
                SMA Negeri 1 Jakarta<br />
                Jl. Pendidikan No. 123<br />
                Jakarta Pusat, DKI Jakarta
              </p>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="border-t border-gray-700 mt-12 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-300 text-sm">
                (c) {currentYear} Kelas X-5 SMA Negeri 1 Jakarta. All rights reserved.
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Dibuat dengan penuh semangat oleh siswa-siswi kelas X-5.
              </p>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors duration-200">
                Terms of Service
              </a>
              <a href="/admin" className="hover:text-white transition-colors duration-200">
                Admin Panel
              </a>
            </div>
          </div>
        </motion.div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      </div>
    </footer>
  );
};

export default Footer;