// download-face-models.js
const fs = require('fs');
const path = require('path');
const https = require('https');

const modelsDir = path.join(process.cwd(), 'public', 'models');

// Create models directory if it doesn't exist
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

const modelFiles = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2'
];

const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

// Download files sequentially to avoid too many concurrent requests
async function downloadFile(file) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(modelsDir, file);
    const fileUrl = `${baseUrl}/${file}`;
    
    console.log(`Downloading ${fileUrl}...`);
    
    const fileStream = fs.createWriteStream(filePath);
    
    https.get(fileUrl, response => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${file}: HTTP ${response.statusCode}`));
        return;
      }
      
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`✅ Downloaded ${file}`);
        resolve();
      });
    }).on('error', err => {
      fs.unlink(filePath, () => {}); // Delete the file if there's an error
      console.error(`❌ Error downloading ${file}: ${err.message}`);
      reject(err);
    });
  });
}

async function downloadAllFiles() {
  console.log('Starting download of face-api.js model files...');
  
  try {
    for (const file of modelFiles) {
      await downloadFile(file);
    }
    console.log('All model files downloaded successfully! ✨');
  } catch (error) {
    console.error('Error downloading model files:', error);
    process.exit(1);
  }
}

downloadAllFiles();