/**
 * Download images using Google Custom Search JSON API and save as JPG.
 *
 * IMPORTANT:
 * - You MUST provide a valid `GOOGLE_API_KEY` and `GOOGLE_CX` (Custom Search Engine ID).
 * - Ensure you have the rights to download and use images returned by the search.
 * - The script **does not** bypass copyright — you are responsible for licensing.
 *
 * Usage:
 *   cd frontend
 *   npm install axios sharp
 *   $env:GOOGLE_API_KEY = '<YOUR_KEY>'    # PowerShell
 *   $env:GOOGLE_CX = '<YOUR_CX>'         # PowerShell
 *   node scripts/download-google-images.js
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const sharp = require('sharp');

const API_KEY = process.env.GOOGLE_API_KEY;
const CX = process.env.GOOGLE_CX;

if (!API_KEY || !CX) {
  console.error('Missing GOOGLE_API_KEY or GOOGLE_CX environment variables.');
  process.exit(1);
}

const outDir = path.join(__dirname, '..', 'public', 'images');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Map of filename -> search term
const images = {
  'fresh_tomatoes.jpg': 'fresh tomatoes fruit vegetable',
  'red_apples.jpg': 'red apples fruit',
  'organic_spinach.jpg': 'organic spinach leaves',
  
  'bananas.jpg': 'bananas bunch',
  'whole_wheat.jpg': 'wheat grains',
  'carrots.jpg': 'fresh carrots',
  'eggs.jpg': 'eggs on table',
  'potatoes.jpg': 'potatoes',
  'oranges.jpg': 'oranges fruit',
  'broccoli.jpg': 'broccoli florets',
  'amul_butter.jpg': 'butter pack',
  'rice.jpg': 'rice grains',
  'grapes.jpg': 'grapes bunch',
  'onions.jpg': 'onions',
  
};

async function searchImage(term) {
  const url = 'https://www.googleapis.com/customsearch/v1';
  try {
    const res = await axios.get(url, {
      params: {
        key: API_KEY,
        cx: CX,
        q: term,
        searchType: 'image',
        num: 1,
        safe: 'off'
      }
    });
    if (res.data && res.data.items && res.data.items.length) {
      return res.data.items[0].link;
    }
    return null;
  } catch (err) {
    console.error('Search error for', term, err.message);
    return null;
  }
}

async function downloadImage(url, filename) {
  try {
    const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 20000 });
    const buffer = Buffer.from(res.data);
    // convert to jpg using sharp to ensure jpg format
    const outPath = path.join(outDir, filename);
    await sharp(buffer).jpeg({ quality: 85 }).toFile(outPath);
    return outPath;
  } catch (err) {
    console.error('Failed to download/convert', url, err.message);
    return null;
  }
}

(async function run() {
  console.log('Starting Google image downloads to', outDir);
  for (const [filename, term] of Object.entries(images)) {
    console.log('Searching for:', term);
    const link = await searchImage(term);
    if (!link) {
      console.warn('No image link found for', term);
      continue;
    }
    console.log('Found image URL:', link);
    const saved = await downloadImage(link, filename);
    if (saved) console.log('Saved', saved);
  }
  console.log('Done. Verify images in frontend/public/images');
})();
