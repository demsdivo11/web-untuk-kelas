import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image, Trash2, Edit, Eye, Lock, LogOut, Camera, Plus } from 'lucide-react';
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

interface AdminUser {
  id: string;
  username: string;
  last_login?: string;
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

  // Upload form state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchPhotos();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const resizeImage = (file: File, maxWidth: number, maxHeight: number, quality: number = 0.8): Promise<Blob> => {
    return new Promise((resolve) => {
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
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleUpload = async (e: React.FormEvent) => {
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
      const { data: imageData, error: imageError } = await supabase.storage
        .from('gallery')
        .upload(`photos/${fileName}.${fileExt}`, resizedImage);

      if (imageError) throw imageError;

      // Upload thumbnail
      const { data: thumbData, error: thumbError } = await supabase.storage
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
      
      alert('Photo uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async (photo: Photo) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      // Delete from storage
      const imagePath = photo.image_url.split('/').pop();
      const thumbPath = photo.thumbnail_url?.split('/').pop();
      
      if (imagePath) {
        await supabase.storage.from('gallery').remove([`photos/${imagePath}`]);
      }
      if (thumbPath) {
        await supabase.storage.from('gallery').remove([`thumbnails/${thumbPath}`]);
      }

      // Delete from database
      const { error } = await supabase
        .from('gallery_photos')
        .delete()
        .eq('id', photo.id);

      if (error) throw error;

      fetchPhotos();
      setSelectedPhoto(null);
      alert('Photo deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Delete failed');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
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
    );
  }

  return (
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

        {/* Upload Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-200"
          >
            <Plus className="h-5 w-5" />
            <span>Upload New Photo</span>
          </button>
        </div>

        {/* Photos Grid */}
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
                  
                  <button
                    onClick={() => handleDeletePhoto(photo)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {photos.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto">
              <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Photos Yet</h3>
              <p className="text-gray-600">Upload your first photo to get started!</p>
            </div>
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
  );
};

export default Admin;