const fs = require('fs');
const path = require('path');
const https = require('https');

// Create icons directory
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Simple placeholder icon URLs (1x1 pixel PNG files)
const iconUrls = {
  16: 'https://via.placeholder.com/16x16/667eea/ffffff?text=M',
  32: 'https://via.placeholder.com/32x32/667eea/ffffff?text=M',
  48: 'https://via.placeholder.com/48x48/667eea/ffffff?text=M',
  128: 'https://via.placeholder.com/128x128/667eea/ffffff?text=M'
};

const downloadFile = (url, filepath) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${filepath}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete the file if download failed
      reject(err);
    });
  });
};

// Download all icons
const downloadAll = async () => {
  try {
    for (const [size, url] of Object.entries(iconUrls)) {
      const filepath = path.join(iconsDir, `icon${size}.png`);
      await downloadFile(url, filepath);
    }
    console.log('All icons downloaded successfully!');
  } catch (error) {
    console.error('Error downloading icons:', error);
    console.log('Creating simple text-based icons instead...');
    createTextIcons();
  }
};

// Fallback: Create simple text-based icons
const createTextIcons = () => {
  const sizes = [16, 32, 48, 128];
  sizes.forEach(size => {
    const iconPath = path.join(iconsDir, `icon${size}.png`);
    // Create a simple SVG that looks like a PNG
    const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#667eea"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-family="Arial" font-size="${size * 0.6}">M</text>
    </svg>`;
    
    // Convert SVG to a simple format that browsers can handle
    const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    fs.writeFileSync(iconPath, svg);
    console.log(`Created ${iconPath} (${size}x${size})`);
  });
};

// Start the process
downloadAll();
