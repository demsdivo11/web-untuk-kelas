import { useState, useEffect, useCallback, type ChangeEvent, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon,
  Trash2,
  Eye,
  Lock,
  LogOut,
  Camera,
  Plus,
  MessageCircle,
  RefreshCw,
  Shield,
  ExternalLink,
  Music,
  Edit2,
  CheckCircle2,
  XCircle,
  Users,
  Bookmark,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { confessApi } from '../services/confessApi';
import { spotifyApi, type SpotifyTrack } from '../services/spotifyApi';

interface Photo {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  thumbnail_url?: string;
  uploaded_by: string;
  created_at: string;
}

interface AdminUser {
  id: string;
  username: string;
  last_login?: string;
}

interface Confession {
  id?: string;
  sender?: string;
  recipient: string;
  from_class?: string;
  message: string;
  song_name?: string;
  song_artist?: string;
  song_spotify_id?: string;
  is_anonymous?: boolean;
  is_class_secret?: boolean;
  created_at?: string;
}

interface ToastMessage {
  id: number;
  type: 'success' | 'error';
  title: string;
  message: string;
}

interface ClassStudent {
  id: string;
  full_name: string;
  nickname?: string | null;
  role_title?: string | null;
  order_index?: number | null;
}

interface ClassProfile {
  id: string;
  grade_label?: string | null;
  class_label?: string | null;
  student_count?: number | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  whatsapp_link?: string | null;
  instagram_handle?: string | null;
  group_link?: string | null;
  updated_at?: string;
}

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<'gallery' | 'confess' | 'students' | 'class'>('gallery');

  // Upload form state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [isConfessLoading, setIsConfessLoading] = useState(false);
  const [confessError, setConfessError] = useState<string | null>(null);
  const [trackCache, setTrackCache] = useState<Record<string, SpotifyTrack | null>>({});
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [photoPendingDelete, setPhotoPendingDelete] = useState<Photo | null>(null);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [classStudents, setClassStudents] = useState<ClassStudent[]>([]);
  const [isStudentsLoading, setIsStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentNickname, setNewStudentNickname] = useState('');
  const [newStudentRole, setNewStudentRole] = useState('');
  const [newStudentDesc, setNewStudentDesc] = useState('');
  const [newStudentOrder, setNewStudentOrder] = useState<number | ''>('');
  const [newStudentIsLead, setNewStudentIsLead] = useState(false);
  const [isSavingStudent, setIsSavingStudent] = useState(false);
  const [classProfile, setClassProfile] = useState<ClassProfile | null>(null);
  const [isClassProfileLoading, setIsClassProfileLoading] = useState(false);
  const [classProfileError, setClassProfileError] = useState<string | null>(null);
  const [classForm, setClassForm] = useState({
    grade_label: '',
    class_label: '',
    student_count: '',
    contact_name: '',
    contact_phone: '',
    whatsapp_link: '',
    instagram_handle: '',
    group_link: '',
  });
  const [isSavingClassProfile, setIsSavingClassProfile] = useState(false);

  const pushToast = useCallback((type: ToastMessage['type'], title: string, message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3800);
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      // Simple authentication check (in production, use proper password hashing)
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !data) {
        alert('Invalid credentials');
        return;
      }

      // For demo purposes, accept 'admin123' as password
      // In production, use proper bcrypt comparison
      if (password === 'admin123') {
        setIsAuthenticated(true);
        setCurrentUser(data);
        
        // Update last login
        await supabase
          .from('admin_users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.id);
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
    }
  };

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
    }
  };

  const normalizeConfessionPayload = (payload: any): Confession[] => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.confessions)) return payload.confessions;
    if (Array.isArray(payload?.records)) return payload.records;
    return [];
  };

  const fetchConfessions = async () => {
    setIsConfessLoading(true);
    setConfessError(null);
    try {
      const response = await confessApi.getAll();
      if (response.success) {
        const items = normalizeConfessionPayload(response.data);
        setConfessions(items);
      } else {
        setConfessError(response.message || 'Gagal memuat data confess.');
      }
    } catch (error) {
      console.error('Error fetching confessions:', error);
      setConfessError('Gagal memuat data confess.');
    } finally {
      setIsConfessLoading(false);
    }
  };

  const fetchMissingSpotifyTracks = useCallback(
    async (list: Confession[]) => {
      const ids = Array.from(
        new Set(
          list
            .map((item) => item.song_spotify_id)
            .filter((id): id is string => Boolean(id))
        )
      ).filter((id) => trackCache[id] === undefined);

      if (ids.length === 0) return;

      const entries = await Promise.all(
        ids.map(async (id) => {
          try {
            const track = await spotifyApi.getTrackById(id);
            return [id, track ?? null] as const;
          } catch (error) {
            console.error('Spotify track fetch failed:', error);
            return [id, null] as const;
          }
        })
      );

      setTrackCache((prev) => {
        const updated = { ...prev };
        entries.forEach(([id, track]) => {
          updated[id] = track;
        });
        return updated;
      });
    },
    [trackCache]
  );

  const handleRefreshConfessions = () => {
    if (!isConfessLoading) {
      fetchConfessions();
    }
  };

  const fetchStudents = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsStudentsLoading(true);
    setStudentsError(null);
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setClassStudents(data || []);
    } catch (error) {
      console.error('Fetch students error:', error);
      setStudentsError('Tidak dapat memuat daftar siswa.');
    } finally {
      setIsStudentsLoading(false);
    }
  }, [isAuthenticated]);

  const openEditModal = (photo: Photo) => {
    setEditingPhoto(photo);
    setEditTitle(photo.title);
    setEditDescription(photo.description || '');
  };

  const closeEditModal = () => {
    setEditingPhoto(null);
    setEditTitle('');
    setEditDescription('');
  };

  const closeDeleteModal = () => {
    setPhotoPendingDelete(null);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPhotos();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'confess') {
      fetchConfessions();
    }
  }, [isAuthenticated, activeTab]);

  useEffect(() => {
    if (activeTab === 'confess' && confessions.length > 0) {
      fetchMissingSpotifyTracks(confessions);
    }
  }, [activeTab, confessions, fetchMissingSpotifyTracks]);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'students') {
      fetchStudents();
    }
  }, [isAuthenticated, activeTab, fetchStudents]);


  const resetNewStudentForm = () => {
    setNewStudentName('');
    setNewStudentNickname('');
    setNewStudentRole('');
    setNewStudentDesc('');
    setNewStudentOrder('');
    setNewStudentIsLead(false);
  };

  const handleAddStudent = async (e: FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    setIsSavingStudent(true);
    try {
      const { error } = await supabase.from('students').insert([
        {
          full_name: newStudentName.trim(),
          nickname: newStudentNickname.trim() || null,
          role_title: newStudentRole.trim() || null,
          role_description: newStudentDesc.trim() || null,
          is_lead: newStudentIsLead,
          order_index: newStudentOrder === '' ? null : Number(newStudentOrder),
        },
      ]);
      if (error) throw error;
      resetNewStudentForm();
      setShowAddStudentModal(false);
      pushToast('success', 'Siswa ditambahkan', 'Data siswa berhasil disimpan.');
      fetchStudents();
    } catch (error) {
      console.error('Add student error:', error);
      pushToast('error', 'Gagal menambah siswa', 'Periksa koneksi dan coba lagi.');
    } finally {
      setIsSavingStudent(false);
    }
  };

  const handleSaveClassProfile = async (e: FormEvent) => {
    e.preventDefault();
    setIsSavingClassProfile(true);
    try {
      const payload = {
        grade_label: classForm.grade_label || null,
        class_label: classForm.class_label || null,
        student_count: classForm.student_count === '' ? null : Number(classForm.student_count),
        contact_name: classForm.contact_name || null,
        contact_phone: classForm.contact_phone || null,
        whatsapp_link: classForm.whatsapp_link || null,
        instagram_handle: classForm.instagram_handle || null,
        group_link: classForm.group_link || null,
        updated_at: new Date().toISOString(),
      };

      const profileId = classProfile?.id || 'class-profile';

      const { error } = await supabase
        .from('class_profile')
        .upsert([{ id: profileId, ...payload }], { onConflict: 'id' });

      if (error) throw error;

      pushToast('success', 'Data kelas disimpan', 'Informasi kelas berhasil diperbarui.');
      fetchClassProfile();
    } catch (error) {
      console.error('Save class profile error:', error);
      pushToast('error', 'Gagal menyimpan data kelas', 'Silakan coba lagi.');
    } finally {
      setIsSavingClassProfile(false);
    }
  };

  const fetchClassProfile = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsClassProfileLoading(true);
    setClassProfileError(null);
    try {
      const { data, error } = await supabase
        .from('class_profile')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setClassProfile(data);
        setClassForm({
          grade_label: data.grade_label || '',
          class_label: data.class_label || '',
          student_count: data.student_count?.toString() || '',
          contact_name: data.contact_name || '',
          contact_phone: data.contact_phone || '',
          whatsapp_link: data.whatsapp_link || '',
          instagram_handle: data.instagram_handle || '',
          group_link: data.group_link || '',
        });
      } else {
        setClassProfile(null);
        setClassForm({
          grade_label: '',
          class_label: '',
          student_count: '',
          contact_name: '',
          contact_phone: '',
          whatsapp_link: '',
          instagram_handle: '',
          group_link: '',
        });
      }
    } catch (error) {
      console.error('Fetch class profile error:', error);
      setClassProfileError('Tidak dapat memuat data kelas.');
    } finally {
      setIsClassProfileLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'class') {
      fetchClassProfile();
    }
  }, [isAuthenticated, activeTab, fetchClassProfile]);

  const toastStack = (
    <div className="fixed top-4 right-4 z-[60] flex flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className={`w-72 rounded-2xl border border-white/40 shadow-xl p-4 backdrop-blur bg-white/90 ${
                isSuccess ? 'border-green-200' : 'border-red-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`rounded-full p-2 ${
                    isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}
                >
                  {isSuccess ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{toast.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{toast.message}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const resizeImage = (file: File, maxWidth: number, maxHeight: number, quality: number = 0.8): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Gagal mengompres gambar'));
          }
        }, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle) return;

    setIsUploading(true);
    
    try {
      // Resize image for main photo (max 1200px)
      const resizedImage = await resizeImage(uploadFile, 1200, 1200, 0.8);
      
      // Resize image for thumbnail (max 400px)
      const thumbnailImage = await resizeImage(uploadFile, 400, 400, 0.7);
      
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
      
      // Upload main image
      const { error: imageError } = await supabase.storage
        .from('gallery')
        .upload(`photos/${fileName}.${fileExt}`, resizedImage);

      if (imageError) throw imageError;

      // Upload thumbnail
      const { error: thumbError } = await supabase.storage
        .from('gallery')
        .upload(`thumbnails/${fileName}.${fileExt}`, thumbnailImage);

      if (thumbError) throw thumbError;

      // Get public URLs
      const { data: imageUrl } = supabase.storage
        .from('gallery')
        .getPublicUrl(`photos/${fileName}.${fileExt}`);

      const { data: thumbUrl } = supabase.storage
        .from('gallery')
        .getPublicUrl(`thumbnails/${fileName}.${fileExt}`);

      // Save to database
      const { error: dbError } = await supabase
        .from('gallery_photos')
        .insert([{
          title: uploadTitle,
          description: uploadDescription || null,
          image_url: imageUrl.publicUrl,
          thumbnail_url: thumbUrl.publicUrl,
          uploaded_by: currentUser?.username || 'admin'
        }]);

      if (dbError) throw dbError;

      // Reset form
      setUploadTitle('');
      setUploadDescription('');
      setUploadFile(null);
      setPreviewUrl(null);
      setShowUploadModal(false);
      
      // Refresh photos
      fetchPhotos();
      
      pushToast('success', 'Upload berhasil', 'Foto baru berhasil ditambahkan ke galeri.');
    } catch (error) {
      console.error('Upload error:', error);
      pushToast('error', 'Upload gagal', 'Terjadi masalah saat mengunggah foto.');
    } finally {
      setIsUploading(false);
    }
  };

  const requestDeletePhoto = (photo: Photo) => {
    setPhotoPendingDelete(photo);
  };

  const confirmDeletePhoto = async () => {
    if (!photoPendingDelete) return;
    setIsDeletingPhoto(true);

    try {
      const extractStoragePath = (url?: string | null, folder?: string) => {
        if (!url) return null;
        try {
          const pathname = new URL(url).pathname;
          const segment = pathname.split('/').pop();
          return segment && folder ? `${folder}/${segment}` : segment;
        } catch {
          const fallback = url.split('/').pop();
          return fallback && folder ? `${folder}/${fallback}` : fallback;
        }
      };

      const imageKey = extractStoragePath(photoPendingDelete.image_url, 'photos');
      const thumbKey = extractStoragePath(photoPendingDelete.thumbnail_url, 'thumbnails');
      const targets = [imageKey, thumbKey].filter((key): key is string => Boolean(key));

      if (targets.length > 0) {
        await supabase.storage.from('gallery').remove(targets);
      }

      const { error } = await supabase
        .from('gallery_photos')
        .delete()
        .eq('id', photoPendingDelete.id);

      if (error) throw error;

      fetchPhotos();
      setSelectedPhoto((prev) => (prev?.id === photoPendingDelete.id ? null : prev));
      pushToast('success', 'Foto dihapus', 'Item berhasil dihapus dari galeri.');
      setPhotoPendingDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
      pushToast('error', 'Gagal menghapus', 'Terjadi kendala saat menghapus foto.');
    } finally {
      setIsDeletingPhoto(false);
    }
  };

  const handleUpdatePhoto = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingPhoto) return;
    setIsSavingEdit(true);

    try {
      const { error } = await supabase
        .from('gallery_photos')
        .update({
          title: editTitle,
          description: editDescription || null,
        })
        .eq('id', editingPhoto.id);

      if (error) throw error;

      fetchPhotos();
      pushToast('success', 'Perubahan disimpan', 'Informasi foto berhasil diperbarui.');
      closeEditModal();
    } catch (error) {
      console.error('Update photo error:', error);
      pushToast('error', 'Gagal menyimpan', 'Tidak dapat memperbarui informasi foto.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (currentPassword !== 'admin123') {
      alert('Current password is incorrect');
      return;
    }

    try {
      // In production, hash the new password properly
      const { error } = await supabase
        .from('admin_users')
        .update({ password_hash: `$2b$10$${newPassword}` })
        .eq('id', currentUser?.id);

      if (error) throw error;

      alert('Password changed successfully!');
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Password change error:', error);
      alert('Password change failed');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUsername('');
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center py-12 px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-4">
                <Lock className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Admin Login</h1>
              <p className="text-gray-600 mt-2">Gallery Management System</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter password"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Login
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Default Login:</strong><br />
                Username: admin<br />
                Password: admin123
              </p>
            </div>
          </motion.div>
        </div>
        {toastStack}
      </>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg">
                <Camera className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Gallery Admin</h1>
                <p className="text-gray-600">Welcome back, {currentUser?.username}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowChangePassword(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Lock className="h-4 w-4" />
                <span>Change Password</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8 flex flex-wrap gap-2">
          {[
            { key: 'gallery' as const, label: 'Kelola Galeri', icon: Camera },
            { key: 'confess' as const, label: 'Dashboard Confess', icon: MessageCircle },
            { key: 'students' as const, label: 'Daftar Siswa', icon: Users },
            { key: 'class' as const, label: 'Info Kelas', icon: Bookmark },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                activeTab === key
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'gallery' && (
          <>
            <div className="mb-8">
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-200"
              >
                <Plus className="h-5 w-5" />
                <span>Upload New Photo</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {photos.map((photo) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200"
                >
                  <div className="aspect-square relative">
                    <img
                      src={photo.thumbnail_url || photo.image_url}
                      alt={photo.title}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setSelectedPhoto(photo)}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                      <Eye className="h-8 w-8 text-white opacity-0 hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 truncate">{photo.title}</h3>
                    {photo.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{photo.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {new Date(photo.created_at).toLocaleDateString()}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(photo)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => requestDeletePhoto(photo)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {photos.length === 0 && (
              <div className="text-center py-20">
                <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto">
                  <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No Photos Yet</h3>
                  <p className="text-gray-600">Upload your first photo to get started!</p>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'confess' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">Confess Dashboard</p>
                <h2 className="text-2xl font-bold text-gray-800">Daftar Pesan Masuk</h2>
                <p className="text-gray-500 text-sm">
                  Semua confess yang dikirim dari halaman publik otomatis tampil di sini.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl">
                  <Shield className="h-4 w-4" />
                  <span>{confessions.length} pesan</span>
                </div>
                <button
                  onClick={handleRefreshConfessions}
                  disabled={isConfessLoading}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-60"
                >
                  <RefreshCw className={`h-4 w-4 ${isConfessLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>

            {confessError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {confessError}
              </div>
            )}

            {isConfessLoading ? (
              <div className="py-12 text-center text-gray-500">
                <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
                Mengambil data confess...
              </div>
            ) : confessions.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <MessageCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Belum ada confess</h3>
                <p className="text-gray-500 text-sm">
                  Saat ada confess baru dari siswa, pesan akan muncul otomatis di dashboard ini.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {confessions.map((confession, index) => {
                  const track = confession.song_spotify_id
                    ? trackCache[confession.song_spotify_id]
                    : null;

                  return (
                    <div
                      key={confession.id ?? `${confession.recipient}-${confession.created_at ?? index}`}
                      className="rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-3">
                        <div>
                          <p className="text-sm text-gray-500">Untuk</p>
                          <h3 className="text-xl font-semibold text-gray-800">{confession.recipient}</h3>
                        </div>
                        <div className="text-sm text-gray-500">
                          {confession.created_at
                            ? new Date(confession.created_at).toLocaleString('id-ID')
                            : 'Waktu tidak tersedia'}
                        </div>
                      </div>

                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">{confession.message}</p>

                      {(track || confession.song_name) && (
                        <div className="mt-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 p-4 shadow-inner">
                          <div className="flex items-center gap-4">
                            {track?.album?.images?.[0]?.url ? (
                              <img
                                src={track.album.images[0].url}
                                alt={track.name}
                                className="w-16 h-16 rounded-xl object-cover shadow-lg"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center">
                                <Music className="h-6 w-6 text-white" />
                              </div>
                            )}
                            <div className="flex-1 text-white">
                              <p className="text-xs uppercase tracking-wide text-pink-100 font-semibold">
                                Lagu dipilih
                              </p>
                              <p className="text-lg font-bold">
                                {track?.name || confession.song_name}
                              </p>
                              <p className="text-sm text-pink-100">
                                {track
                                  ? track.artists.map((artist) => artist.name).join(', ')
                                  : confession.song_artist || 'Tidak diketahui'}
                              </p>
                            </div>
                            {(track?.external_urls?.spotify || confession.song_spotify_id) && (
                              <a
                                href={
                                  track?.external_urls?.spotify ||
                                  `https://open.spotify.com/track/${confession.song_spotify_id}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center rounded-full bg-white text-green-600 h-12 w-12 shadow-lg"
                              >
                                <ExternalLink className="h-5 w-5" />
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-500">
                        <span className="px-3 py-1 rounded-full bg-gray-100">
                          Pengirim: {confession.is_anonymous ? 'Anonim' : confession.sender || 'Tidak diketahui'}
                        </span>
                        {confession.from_class && (
                          <span className="px-3 py-1 rounded-full bg-gray-100">Kelas: {confession.from_class}</span>
                        )}
                        {confession.is_class_secret && (
                          <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700">Rahasia kelas</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'students' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">Data Siswa</p>
                <h2 className="text-2xl font-bold text-gray-800">Daftar Kelas X-5</h2>
                <p className="text-gray-500 text-sm">
                  Semua data diambil langsung dari tabel `students` Supabase.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAddStudentModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium shadow hover:shadow-lg"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Siswa
                </button>
                <button
                  onClick={fetchStudents}
                  disabled={isStudentsLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-60"
                >
                  <RefreshCw className={`h-4 w-4 ${isStudentsLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>

            {studentsError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {studentsError}
              </div>
            )}

            <div className="rounded-2xl border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between text-sm text-gray-600">
                <span>Total siswa</span>
                <span className="font-semibold text-blue-600">{classStudents.length}</span>
              </div>

              <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-100">
                {isStudentsLoading ? (
                  Array.from({ length: 10 }).map((_, index) => (
                    <div key={index} className="px-4 py-4 animate-pulse">
                      <div className="h-4 w-48 bg-gray-100 rounded" />
                      <div className="mt-2 h-3 w-32 bg-gray-100 rounded" />
                    </div>
                  ))
                ) : (
                  classStudents.map((student) => (
                    <div key={student.id} className="px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <p className="font-medium text-gray-900">{student.full_name}</p>
                        {student.nickname && (
                          <p className="text-sm text-gray-500">({student.nickname})</p>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                          {student.role_title || 'Siswa'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'class' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">Dashboard Kelas</p>
                <h2 className="text-2xl font-bold text-gray-800">Informasi Kelas & Kontak</h2>
                <p className="text-gray-500 text-sm">
                  Kelola informasi umum kelas untuk ditampilkan pada website atau dibagikan ke siswa.
                </p>
              </div>
              <button
                onClick={fetchClassProfile}
                disabled={isClassProfileLoading}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${isClassProfileLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {classProfileError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {classProfileError}
              </div>
            )}

            <form onSubmit={handleSaveClassProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tingkat / Kelas</label>
                  <input
                    type="text"
                    value={classForm.grade_label}
                    onChange={(e) => setClassForm((prev) => ({ ...prev, grade_label: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contoh: Kelas X / XI / XII"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Label Kelas</label>
                  <input
                    type="text"
                    value={classForm.class_label}
                    onChange={(e) => setClassForm((prev) => ({ ...prev, class_label: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contoh: X-5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah Siswa</label>
                  <input
                    type="number"
                    min={0}
                    value={classForm.student_count}
                    onChange={(e) => setClassForm((prev) => ({ ...prev, student_count: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contoh: 32"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Kontak</label>
                  <input
                    type="text"
                    value={classForm.contact_name}
                    onChange={(e) => setClassForm((prev) => ({ ...prev, contact_name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contoh: Ketua kelas"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Kontak</label>
                  <input
                    type="text"
                    value={classForm.contact_phone}
                    onChange={(e) => setClassForm((prev) => ({ ...prev, contact_phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contoh: +62 812 xxx"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Link WhatsApp</label>
                  <input
                    type="url"
                    value={classForm.whatsapp_link}
                    onChange={(e) => setClassForm((prev) => ({ ...prev, whatsapp_link: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://chat.whatsapp.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instagram Kelas</label>
                  <input
                    type="text"
                    value={classForm.instagram_handle}
                    onChange={(e) => setClassForm((prev) => ({ ...prev, instagram_handle: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="@kelasx5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Link Grup / Drive</label>
                  <input
                    type="url"
                    value={classForm.group_link}
                    onChange={(e) => setClassForm((prev) => ({ ...prev, group_link: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Link grup kelas"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={fetchClassProfile}
                  className="px-5 py-3 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={isSavingClassProfile}
                  className="px-5 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold disabled:opacity-60"
                >
                  {isSavingClassProfile ? 'Menyimpan...' : 'Simpan Informasi'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Upload New Photo</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo Title *
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter photo title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter photo description (optional)"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo File *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {previewUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview
                  </label>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full max-w-md mx-auto rounded-lg shadow-md"
                  />
                </div>
              )}

              <div className="flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Upload Photo'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Photo Modal */}
      {editingPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm uppercase text-blue-500 font-semibold tracking-wide">Kelola Galeri</p>
                <h2 className="text-2xl font-bold text-gray-800">Edit Informasi Foto</h2>
              </div>
              <button onClick={closeEditModal} className="p-2 rounded-lg hover:bg-gray-100">
                ×
              </button>
            </div>

            <form onSubmit={handleUpdatePhoto} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Judul Foto</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan judul foto"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tuliskan cerita singkat (opsional)"
                  rows={4}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-5 py-3 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold disabled:opacity-60"
                >
                  {isSavingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {photoPendingDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm uppercase text-red-500 font-semibold tracking-wide">Hapus Foto</p>
                <h2 className="text-xl font-bold text-gray-800">Yakin hapus foto ini?</h2>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-6">
              Foto <span className="font-semibold text-gray-800">{photoPendingDelete.title}</span> akan dihapus
              permanen dari galeri. Tindakan ini tidak bisa dibatalkan.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="px-5 py-3 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeletingPhoto}
                onClick={confirmDeletePhoto}
                className="px-5 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60"
              >
                {isDeletingPhoto ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm uppercase text-blue-500 font-semibold tracking-wide">Tambah Siswa</p>
                <h2 className="text-2xl font-bold text-gray-800">Input Data Siswa Baru</h2>
              </div>
              <button onClick={() => { setShowAddStudentModal(false); resetNewStudentForm(); }} className="p-2 rounded-lg hover:bg-gray-100">
                ×
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap *</label>
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contoh: Ahmad Rizki"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Panggilan</label>
                  <input
                    type="text"
                    value={newStudentNickname}
                    onChange={(e) => setNewStudentNickname(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Opsional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Urutan (opsional)</label>
                  <input
                    type="number"
                    value={newStudentOrder}
                    onChange={(e) => setNewStudentOrder(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1, 2, 3..."
                    min={1}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jabatan (opsional)</label>
                <input
                  type="text"
                  value={newStudentRole}
                  onChange={(e) => setNewStudentRole(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contoh: Ketua Kelas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Jabatan</label>
                <textarea
                  value={newStudentDesc}
                  onChange={(e) => setNewStudentDesc(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Tuliskan tugas singkat jabatan (opsional)"
                />
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={newStudentIsLead}
                  onChange={(e) => setNewStudentIsLead(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Tandai sebagai pengurus/leader
              </label>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddStudentModal(false); resetNewStudentForm(); }}
                  className="px-5 py-3 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingStudent}
                  className="px-5 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold disabled:opacity-60"
                >
                  {isSavingStudent ? 'Menyimpan...' : 'Simpan Siswa'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

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
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <img
                src={selectedPhoto.image_url}
                alt={selectedPhoto.title}
                className="w-full max-h-96 object-contain rounded-lg mb-4"
              />
              
              {selectedPhoto.description && (
                <p className="text-gray-700 mb-4">{selectedPhoto.description}</p>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Uploaded by: {selectedPhoto.uploaded_by}</span>
                <span>{new Date(selectedPhoto.created_at).toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Change Password</h2>
              <button
                onClick={() => setShowChangePassword(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowChangePassword(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  Change Password
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
    {toastStack}
    </>
  );
};

export default Admin;
