import { connectToDatabase } from '../lib/mongodb.js';
import { setCorsHeaders } from '../lib/auth.js';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { db } = await connectToDatabase();
    const teachersCollection = db.collection('teachers');

    if (req.method === 'GET') {
      const {
        search,
        subject,
        status,
        gender,
        page = '1',
        limit = '50',
      } = req.query || {};

      const filter = {};

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { subject: { $regex: search, $options: 'i' } },
        ];
      }

      if (subject) filter.subject = subject;
      if (status) filter.status = status;
      if (gender) filter.gender = gender;

      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
      const skip = (pageNum - 1) * limitNum;

      const [teachers, total] = await Promise.all([
        teachersCollection
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .toArray(),
        teachersCollection.countDocuments(filter),
      ]);

      return res.status(200).json({
        success: true,
        data: teachers,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    }

    if (req.method === 'POST') {
      const {
        name,
        email,
        phone,
        subject,
        qualification,
        experience,
        salary,
        joinDate,
        address,
        gender,
      } = req.body || {};

      if (!name || !email || !subject) {
        return res.status(400).json({ error: 'Name, email, and subject are required' });
      }

      const existing = await teachersCollection.findOne({ email });
      if (existing) {
        return res.status(409).json({ error: 'Teacher with this email already exists' });
      }

      const newTeacher = {
        name,
        email,
        phone: phone || '',
        subject,
        qualification: qualification || '',
        experience: experience || '',
        salary: salary ? parseFloat(salary) : 0,
        joinDate: joinDate ? new Date(joinDate) : new Date(),
        address: address || '',
        gender: gender || '',
        status: 'active',
        createdAt: new Date(),
      };

      const result = await teachersCollection.insertOne(newTeacher);

      return res.status(201).json({
        success: true,
        data: { ...newTeacher, _id: result.insertedId },
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Teachers error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
