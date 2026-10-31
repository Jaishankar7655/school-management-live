import { connectToDatabase } from '../lib/mongodb.js';
import { createToken, setCorsHeaders, hashPassword, authenticate } from '../lib/auth.js';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, password, role } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const validRoles = ['admin', 'teacher', 'staff'];
    const userRole = validRoles.includes(role) ? role : 'staff';

    // Only admins can create admin accounts
    if (userRole === 'admin') {
      const auth = authenticate(req);
      if (!auth.authenticated || auth.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can create admin accounts' });
      }
    }

    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    const existing = await usersCollection.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const newUser = {
      name,
      email: email.toLowerCase(),
      password: hashPassword(password),
      role: userRole,
      status: 'active',
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    const token = createToken({
      userId: result.insertedId.toString(),
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: result.insertedId.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
