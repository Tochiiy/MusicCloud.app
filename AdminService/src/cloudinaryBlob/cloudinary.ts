import { v2 as cloudinary } from 'cloudinary';

const CLOUD_NAME = process.env.CLOUD_NAME;
const CLOUD_API_KEY = process.env.CLOUD_API_KEY;
const CLOUD_API_SECRET = process.env.CLOUD_API_SECRET;

if (!CLOUD_NAME || !CLOUD_API_KEY || !CLOUD_API_SECRET) {
  throw new Error('Cloudinary credentials are not set. Add CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET to .env');
}

cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: CLOUD_API_KEY,
    api_secret: CLOUD_API_SECRET,
});

export default cloudinary;
    