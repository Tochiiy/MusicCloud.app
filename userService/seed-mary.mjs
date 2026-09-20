import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

await mongoose.connect(process.env.MONGO_URI);
const { User } = await import('./dist/database/model.js');

const data = { name: 'Mary', email: 'mary@musiccloud.app', password: await bcrypt.hash('mary123', 10), role: 'admin' };
const existing = await User.findOne({ email: data.email });
if (existing) {
  existing.password = data.password;
  existing.role = 'admin';
  existing.name = data.name;
  await existing.save();
  console.log('mary admin updated');
} else {
  await User.create(data);
  console.log('mary admin created');
}
process.exit(0);