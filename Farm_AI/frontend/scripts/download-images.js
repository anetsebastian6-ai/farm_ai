/**
 * Simple image downloader for Unsplash Source.
 *
 * IMPORTANT: This script downloads images from Unsplash's Source API (free images).
 * If you want images from Google Image Search, please ensure you have the right
 * to download and redistribute them — I can't fetch copyrighted Google images for you.
 *
 * Usage:
 *   cd frontend
 *   node scripts/download-images.js
 *
 * The script saves images to `public/images/`.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const outDir = path.join(__dirname, '..', 'public', 'images');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Map of filename -> search term
const images = {
  'fresh_tomatoes.jpg': 'tomatoes',
  'red_apples.jpg': 'red apples',
  'organic_spinach.jpg': 'spinach',
  'fresh_milk.jpg': 'milk',
  'bananas.jpg': 'bananas',
  'whole_wheat.jpg': 'wheat',
  'carrots.jpg': 'carrots',
  'eggs.jpg': 'eggs',
  'potatoes.jpg': 'potatoes',
  'oranges.jpg': 'oranges'
};

function downloadUnsplash(term, filename) {
  return new Promise((resolve, reject) => {
    // source.unsplash.com will redirect to an actual image
    const url = `https://source.unsplash.com/1200x800/?${encodeURIComponent(term)}`;
    https.get(url, (res) => {
      // If response is a redirect (302), follow Location
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, (res2) => {
          const filePath = path.join(outDir, filename);
          const fileStream = fs.createWriteStream(filePath);
          res2.pipe(fileStream);
          fileStream.on('finish', () => fileStream.close(() => resolve(filePath)));
          fileStream.on('error', reject);
        }).on('error', reject);
      } else if (res.statusCode === 200) {
        const filePath = path.join(outDir, filename);
        const fileStream = fs.createWriteStream(filePath);
        res.pipe(fileStream);
        fileStream.on('finish', () => fileStream.close(() => resolve(filePath)));
        fileStream.on('error', reject);
      } else {
        reject(new Error(`Unexpected status code ${res.statusCode} for ${url}`));
      }
    }).on('error', reject);
  });
}

(async function run() {
  console.log('Downloading images to', outDir);
  for (const [filename, term] of Object.entries(images)) {
    try {
      process.stdout.write(`Downloading ${term} → ${filename} ... `);
      const p = await downloadUnsplash(term, filename);
      console.log('done');
    } catch (err) {
      console.error('failed', err.message);
    }
  }
  console.log('Done. You can find files in frontend/public/images');
})();
