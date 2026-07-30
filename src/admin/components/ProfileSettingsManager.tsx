import { useState, useEffect } from 'react';
import { supabase, type VendorProfile } from '../../lib/supabase';
import { Save, Image as ImageIcon, Loader2, Trash2, MapPin } from 'lucide-react';

export default function ProfileSettingsManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [profile, setProfile] = useState<Partial<VendorProfile>>({
    name: '',
    tagline: '',
    phone: '',
    email: '',
    address: '',
    lat: 12.9716, // Default Bangalore
    lng: 77.5946,
    verified: true,
  });
  const [gallery, setGallery] = useState<{id: string, image_url: string}[]>([]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: vData } = await supabase.from('vendor_profile').select('*').limit(1).single();
    if (vData) {
      setProfile(vData);
      const { data: gData } = await supabase.from('vendor_gallery').select('*').eq('vendor_id', vData.id);
      if (gData) setGallery(gData);
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    if (profile.id) {
      const { error } = await supabase.from('vendor_profile').update(profile).eq('id', profile.id);
      if (error) alert("Error saving: " + error.message);
      else alert("Profile updated successfully!");
    } else {
      const { data, error } = await supabase.from('vendor_profile').insert([profile]).select();
      if (error) alert("Error saving: " + error.message);
      else if (data) setProfile(data[0]);
    }
    setSaving(false);
  };

  const handleUploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile.id) {
      alert("Please save your profile details first before uploading a banner!");
      return;
    }
    
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    const fileName = `banner/${profile.id}_${Date.now()}`;
    
    const { error: uploadError } = await supabase.storage.from('images').upload(fileName, file);
    
    if (uploadError) {
      alert("Error uploading banner: " + uploadError.message);
      setUploadingBanner(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName);
    
    // Update profile with new banner URL
    const { error: updateError } = await supabase.from('vendor_profile').update({ banner_image: urlData.publicUrl }).eq('id', profile.id);

    if (updateError) {
      alert("Error saving banner to database: " + updateError.message);
    } else {
      setProfile({ ...profile, banner_image: urlData.publicUrl });
    }
    
    setUploadingBanner(false);
  };

  const handleUploadGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile.id) {
      alert("Please save your profile details first before uploading images!");
      return;
    }
    
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileName = `gallery/${profile.id}_${Date.now()}`;
    
    const { error: uploadError } = await supabase.storage.from('images').upload(fileName, file);
    
    if (uploadError) {
      alert("Error uploading image: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName);
    
    const { error: insertError } = await supabase.from('vendor_gallery').insert([{
      vendor_id: profile.id,
      image_url: urlData.publicUrl
    }]);

    if (insertError) {
      alert("Error saving to database: " + insertError.message);
    } else {
      fetchProfile(); // Refresh gallery
    }
    
    setUploading(false);
  };

  const handleDeleteGallery = async (id: string) => {
    if (confirm("Are you sure you want to remove this image?")) {
      await supabase.from('vendor_gallery').delete().eq('id', id);
      fetchProfile();
    }
  };

  if (loading) return <div className="p-6">Loading profile...</div>;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Profile Settings</h2>
          <p className="text-sm text-purple-300/60">Update your vendor details shown on the client app.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-[#231534] border border-purple-500/30 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-purple-300 uppercase mb-1">Business Name</label>
          <input required type="text" value={profile.name || ''} onChange={e => setProfile({...profile, name: e.target.value})}
            className="w-full bg-[#1a1025] border border-purple-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400" />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-purple-300 uppercase mb-1">Tagline</label>
          <input required type="text" value={profile.tagline || ''} onChange={e => setProfile({...profile, tagline: e.target.value})}
            className="w-full bg-[#1a1025] border border-purple-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400" />
        </div>

        <div>
          <label className="block text-xs font-bold text-purple-300 uppercase mb-1">Phone Number</label>
          <input required type="text" value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})}
            className="w-full bg-[#1a1025] border border-purple-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400" />
        </div>

        <div>
          <label className="block text-xs font-bold text-purple-300 uppercase mb-1">Email</label>
          <input required type="email" value={profile.email || ''} onChange={e => setProfile({...profile, email: e.target.value})}
            className="w-full bg-[#1a1025] border border-purple-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-purple-300 uppercase mb-1">Physical Address</label>
          <textarea required value={profile.address || ''} onChange={e => setProfile({...profile, address: e.target.value})}
            className="w-full bg-[#1a1025] border border-purple-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400" />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-purple-300 uppercase mb-1">
            <MapPin className="w-3 h-3" /> Latitude
          </label>
          <input required type="number" step="any" value={profile.lat || ''} onChange={e => setProfile({...profile, lat: parseFloat(e.target.value)})}
            className="w-full bg-[#1a1025] border border-purple-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400" />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-purple-300 uppercase mb-1">
            <MapPin className="w-3 h-3" /> Longitude
          </label>
          <input required type="number" step="any" value={profile.lng || ''} onChange={e => setProfile({...profile, lng: parseFloat(e.target.value)})}
            className="w-full bg-[#1a1025] border border-purple-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400" />
        </div>

        <div className="md:col-span-2 flex justify-end gap-3 mt-4 border-t border-purple-500/20 pt-4">
          <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl font-bold bg-purple-500 hover:bg-purple-400 text-white flex items-center gap-2 transition-all">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Profile
          </button>
        </div>
      </form>

      {/* Banner Upload Section */}
      <div className="bg-[#231534] border border-purple-500/30 p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2"><ImageIcon className="w-5 h-5 text-purple-400" /> Hero Banner</h3>
            <p className="text-xs text-purple-300/60 mt-1">This is the large cover photo shown at the top of your profile.</p>
          </div>
          
          <label className="cursor-pointer px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-xl font-bold text-sm transition-all flex items-center gap-2">
            {uploadingBanner ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
            {uploadingBanner ? 'Uploading...' : 'Upload Banner'}
            <input type="file" accept="image/*" className="hidden" onChange={handleUploadBanner} disabled={uploadingBanner || !profile.id} />
          </label>
        </div>

        {profile.banner_image ? (
          <div className="w-full h-48 rounded-xl overflow-hidden border border-purple-500/20">
            <img src={profile.banner_image} alt="Banner" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full h-32 rounded-xl flex items-center justify-center border-2 border-dashed border-purple-500/20 text-purple-300/40 text-sm">
            No banner uploaded. The first gallery image will be used as a fallback.
          </div>
        )}
      </div>

      {/* Gallery Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2"><ImageIcon className="w-5 h-5 text-purple-400" /> Portfolio Gallery</h3>
            <p className="text-xs text-purple-300/60 mt-1">Upload images of your past events to show on your profile.</p>
          </div>
          
          <label className="cursor-pointer px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-xl font-bold text-sm transition-all flex items-center gap-2">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
            {uploading ? 'Uploading...' : 'Upload Image'}
            <input type="file" accept="image/*" className="hidden" onChange={handleUploadGallery} disabled={uploading || !profile.id} />
          </label>
        </div>

        {!profile.id && (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-200 text-sm mb-4">
            You must save your profile details first before you can upload gallery images.
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {gallery.map((img) => (
            <div key={img.id} className="relative aspect-video rounded-xl overflow-hidden group border border-purple-500/20">
              <img src={img.image_url} alt="Gallery" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <button 
                onClick={() => handleDeleteGallery(img.id)}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {gallery.length === 0 && profile.id && !uploading && (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-purple-500/20 rounded-xl text-purple-300/40">
              No gallery images uploaded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
