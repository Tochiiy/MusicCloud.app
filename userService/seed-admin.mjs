import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

await mongoose.connect(process.env.MONGO_URI);
const { User } = await import('./dist/database/model.js');

const data = { name: 'E2E Admin', email: 'admin@e2e.test', password: await bcrypt.hash('admin123', 10), role: 'admin' };
const existing = await User.findOne({ email: data.email });
if (existing) {
  existing.password = data.password;
  existing.role = 'admin';
  await existing.save();
  console.log('admin updated');
} else {
  await User.create(data);
  console.log('admin created');
}
process.exit(0);