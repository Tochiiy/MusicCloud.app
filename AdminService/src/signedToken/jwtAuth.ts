import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set. Add it to .env');
}

export const signedToken = (user: { _id: string }) => {
  return jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string) => jwt.verify(token, JWT_SECRET);