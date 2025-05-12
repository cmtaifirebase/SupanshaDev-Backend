const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const WASABI_ACCESS_KEY = process.env.WASABI_ACCESS_KEY;
const WASABI_SECRET_KEY = process.env.WASABI_SECRET_KEY;
const WASABI_BUCKET = process.env.WASABI_BUCKET;
const WASABI_REGION = process.env.WASABI_REGION;
const WASABI_ENDPOINT = process.env.WASABI_ENDPOINT; // e.g. 'https://s3.ap-south-1.wasabisys.com'

const s3 = new S3Client({
  region: WASABI_REGION,
  endpoint: WASABI_ENDPOINT,
  credentials: {
    accessKeyId: WASABI_ACCESS_KEY,
    secretAccessKey: WASABI_SECRET_KEY,
  },
});

/**
 * Upload a file buffer to Wasabi
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} fileName - The original file name (for extension)
 * @param {string} folder - The folder in the bucket (e.g. 'blogs', 'events', 'causes')
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
async function uploadFile(fileBuffer, fileName, folder = 'uploads') {
  const ext = path.extname(fileName);
  const key = `${folder}/${uuidv4()}${ext}`;

  const command = new PutObjectCommand({
    Bucket: WASABI_BUCKET,
    Key: key,
    Body: fileBuffer,
    ACL: 'public-read',
    ContentType: getContentType(ext),
  });

  await s3.send(command);

  // Construct the public URL
  const url = `${WASABI_ENDPOINT.replace(/\/$/, '')}/${WASABI_BUCKET}/${key}`;
  return url;
}

function getContentType(ext) {
  switch (ext.toLowerCase()) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    case '.webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
}

module.exports = { uploadFile };
