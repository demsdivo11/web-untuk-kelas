@@ .. @@
 import SpotifySearch from '../components/SpotifySearch';
 import ConfessList from '../components/ConfessList';
 import { supabase } from '../lib/supabase';
+import { confessApi } from '../services/confessApi';
 
 interface SpotifyTrack {
@@ .. @@
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setIsSubmitting(true);
 
     try {
-      const { data, error } = await supabase
-        .from('confessions')
-        .insert([
-          {
-            sender: isAnonymous ? null : sender,
-            recipient,
-            from_class: isClassSecret ? null : fromClass,
-            message,
-            song_name: selectedSong?.name || null,
-            song_artist: selectedSong?.artists[0]?.name || null,
-            song_spotify_id: selectedSong?.id || null,
-            is_anonymous: isAnonymous,
-            is_class_secret: isClassSecret,
-          },
-        ])
-        .select();
+      const result = await confessApi.create({
+        sender: isAnonymous ? undefined : sender,
+        recipient,
+        from_class: isClassSecret ? undefined : fromClass,
+        message,
+        song_name: selectedSong?.name,
+        song_artist: selectedSong?.artists[0]?.name,
+        song_spotify_id: selectedSong?.id,
+        is_anonymous: isAnonymous,
+        is_class_secret: isClassSecret,
+      });
 
-      if (error) throw error;
+      if (!result.success) {
+        throw new Error(result.error || result.message);
+      }
 
       // Reset form
       setSender('');
@@ .. @@
       setSelectedSong(null);
       setIsAnonymous(false);
       setIsClassSecret(false);
-      
-      alert('Confession berhasil dikirim! 💕');
+
+      alert('Confession berhasil dikirim melalui API! 💕');
     } catch (error) {
       console.error('Error submitting confession:', error);
-      alert('Gagal mengirim confession. Silakan coba lagi.');
+      alert(`Gagal mengirim confession: ${error instanceof Error ? error.message : 'Unknown error'}`);
     } finally {
       setIsSubmitting(false);
     }