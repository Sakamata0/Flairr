// src/routes/uploads.js
import express from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import multer from 'multer';
const upload = multer(); // memory storage
const router = express.Router();

// Uploads image to a Supabase storage bucket
router.post('/image', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file' });

    const bucket = 'public-posts'; // create in Supabase UI first
    const fileName = `${Date.now()}_${file.originalname}`;

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(fileName, file.buffer, { contentType: file.mimetype, upsert: true });

    if (error) throw error;

    // Get public URL (if bucket is public)
    const { publicURL } = supabaseAdmin.storage.from(bucket).getPublicUrl(fileName);
    res.json({ path: data.path, publicURL });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
