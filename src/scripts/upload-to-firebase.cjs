// Upload all public files to Firebase Storage and output download URLs
const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const fs = require('fs');
const path = require('path');

const firebaseConfig = {
  apiKey: "AIzaSyCFaCNE_y9HBAVQrUcRt3TdmDZoSY55ilc",
  authDomain: "trading-416c1.firebaseapp.com",
  projectId: "trading-416c1",
  storageBucket: "trading-416c1.firebasestorage.app",
  messagingSenderId: "346934217662",
  appId: "1:346934217662:web:f685cd3c387226742187ef",
  measurementId: "G-D7ZS2241MR"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// All files to upload (matching LIBRARY_ITEMS in NotesView.tsx)
const files = [
  // my notes folder
  'Futures risk management and trade plan (1).pdf',
  'MMXM 2325.pdf',
  'notes (1).pdf',
  // MMXM notes folder
  'MMXM TRADER POSTS.pptx',
  'MMXM Course PDF.pdf',
  'The X Model Notes.pptx',
  // 4500px folder
  '4500px/CryptoRangeTrading.pdf',
  '4500px/MarchTrades.pdf',
  '4500px/Monthly recap.pdf',
  '4500px/PastPlaysSameProcess.pdf',
  '4500px/Unicorn.pdf',
  // JunoTrading folder
  'JunoTrading/Feb_24_Unicorn_Model_Data.pdf',
  'JunoTrading/Jan_24_Unicorn_Model_Data.pdf',
  'JunoTrading/Smooth Edges - byJunotrading.pdf',
  'JunoTrading/Stat-Map-Unicorn-Juno.pdf',
  'JunoTrading/Unicorn_Model_Data_Sep2025.pdf',
  // MMXM-PDFs folder
  'MMXM-PDFs/Breakdown Weekly PO3.pdf',
  'MMXM-PDFs/DPT (1) (1).pdf',
  'MMXM-PDFs/EP 6 (QS).pdf',
  'MMXM-PDFs/Handbook Booklet.pdf',
  'MMXM-PDFs/Lesson 1.pdf',
  'MMXM-PDFs/Lesson 2.pdf',
  'MMXM-PDFs/Lesson 3.pdf',
  'MMXM-PDFs/Lesson 4.pdf',
  'MMXM-PDFs/Lesson 5.pdf',
  'MMXM-PDFs/Relative Strength Analysis - OTE-1.pdf',
  'MMXM-PDFs/The OTE Traders Checklist.pdf',
  'MMXM-PDFs/The Sequence (1).pdf',
  'MMXM-PDFs/Timeframe alignment PDF.pdf',
  // Jos7821 folder
  'Jos7821 Tweets.pptx',
  'jos7821 chart examples.pptx',
];

async function uploadAll() {
  const results = {};
  let uploaded = 0;
  const total = files.length;

  for (const filename of files) {
    const localPath = path.join(PUBLIC_DIR, filename);
    
    if (!fs.existsSync(localPath)) {
      console.error(`SKIP (not found): ${filename}`);
      continue;
    }

    const fileSize = fs.statSync(localPath).size;
    const sizeMB = (fileSize / (1024 * 1024)).toFixed(1);
    console.log(`[${uploaded + 1}/${total}] Uploading: ${filename} (${sizeMB} MB)...`);

    try {
      const buffer = fs.readFileSync(localPath);
      const storagePath = `library/${filename}`;
      const storageRef = ref(storage, storagePath);
      
      // Determine content type
      const ext = filename.split('.').pop().toLowerCase();
      const contentType = ext === 'pdf' ? 'application/pdf'
        : ext === 'pptx' ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        : ext === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        : 'application/octet-stream';

      await uploadBytes(storageRef, buffer, { contentType });
      const url = await getDownloadURL(storageRef);
      results[filename] = url;
      uploaded++;
      console.log(`  ✓ Done (${uploaded}/${total})`);
    } catch (err) {
      console.error(`  ✗ FAILED: ${err.message}`);
    }
  }

  // Write results to a JSON file
  const outputPath = path.join(__dirname, 'firebase-urls.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n=== COMPLETE: ${uploaded}/${total} files uploaded ===`);
  console.log(`URLs saved to: ${outputPath}`);
}

uploadAll().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
