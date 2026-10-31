import { connectToDatabase } from '../lib/mongodb.js';
import { setCorsHeaders } from '../lib/auth.js';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { db } = await connectToDatabase();
    const classesCollection = db.collection('classes');

    if (req.method === 'GET') {
      const {
        search,
        status,
        page = '1',
        limit = '50',
      } = req.query || {};

      const filter = {};

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { classTeacher: { $regex: search, $options: 'i' } },
          { room: { $regex: search, $options: 'i' } },
        ];
      }

      if (status) filter.status = status;

      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
      const skip = (pageNum - 1) * limitNum;

      const [classes, total] = await Promise.all([
        classesCollection
          .find(filter)
          .sort({ name: 1, section: 1 })
          .skip(skip)
          .limit(limitNum)
          .toArray(),
        classesCollection.countDocuments(filter),
      ]);

      return res.status(200).json({
        success: true,
        data: classes,
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
        section,
        classTeacher,
        maxStudents,
        subjects,
        room,
      } = req.body || {};

      if (!name) {
        return res.status(400).json({ error: 'Class name is required' });
      }

      const existing = await classesCollection.findOne({
        name,
        section: section || '',
      });
      if (existing) {
        return res.status(409).json({ error: 'Class with this name and section already exists' });
      }

      const newClass = {
        name,
        section: section || '',
        classTeacher: classTeacher || '',
        maxStudents: maxStudents ? parseInt(maxStudents) : 40,
        subjects: Array.isArray(subjects) ? subjects : [],
        room: room || '',
        status: 'active',
        createdAt: new Date(),
      };

      const result = await classesCollection.insertOne(newClass);

      return res.status(201).json({
        success: true,
        data: { ...newClass, _id: result.insertedId },
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Classes error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
