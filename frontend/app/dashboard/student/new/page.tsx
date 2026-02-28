'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Send, Upload, CheckCircle, X } from 'lucide-react';

export default function NewComplaintPage() {
  const [form, setForm] = useState({ title: '', description: '', category: '' });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]); // fetched categories
  const router = useRouter();

  // --- FETCH CATEGORIES ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // ✅ Correct: no extra /api
        const res = await api.get('/categories'); 
        const catNames = res.data.map((cat: any) => cat.name);
        setCategories(catNames);

        // Set first category as default
        if (catNames.length > 0) {
          setForm((prev) => ({ ...prev, category: catNames[0] }));
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  // --- SUBMIT COMPLAINT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('category', form.category);
      if (file) formData.append('attachment', file); // must match multer key

      const res = await api.post('/tickets/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Ticket submitted:', res.data);
      router.push('/dashboard/student');
    } catch (err) {
      console.error(err);
      alert('Submission failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Submit a New Complaint</h1>
          <p className="text-slate-500 text-sm mt-1">
            Provide details and attach evidence (image/PDF) to help us resolve your issue faster.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Complaint Title</label>
            <input
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 ring-blue-500 outline-none transition"
              placeholder="e.g. Incomplete grade for Course CS301"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
            <select
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {categories.length === 0 ? (
                <option value="">Loading categories...</option>
              ) : (
                categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Upload Support (Image/PDF)</label>
            <div className="relative group cursor-pointer">
              <div
                className={`w-full p-3 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 transition ${
                  file ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-200 bg-slate-50 text-slate-500 group-hover:bg-slate-100'
                }`}
              >
                {file ? (
                  <>
                    <CheckCircle size={18} /> <span className="text-sm font-bold truncate max-w-[150px]">{file.name}</span>
                  </>
                ) : (
                  <>
                    <Upload size={18} /> <span className="text-sm">Click to upload file</span>
                  </>
                )}
              </div>
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept="image/*,.pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setFile(e.target.files[0]);
                  }
                }}
              />
            </div>
            {file && (
              <button
                type="button"
                onClick={() => setFile(null)}
                className="mt-2 text-[10px] text-red-500 font-bold uppercase flex items-center gap-1"
              >
                <X size={12} /> Remove File
              </button>
            )}
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Detailed Description</label>
            <textarea
              required
              rows={5}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              placeholder="Describe the problem..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* Submit Buttons */}
          <div className="md:col-span-2 flex items-center gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : <><Send size={18} /> Submit Request</>}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="text-slate-500 text-sm font-medium hover:text-slate-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}