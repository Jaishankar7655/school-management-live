import { connectToDatabase } from '../lib/mongodb.js';
import { setCorsHeaders } from '../lib/auth.js';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { db } = await connectToDatabase();
    const studentsCollection = db.collection('students');

    if (req.method === 'GET') {
      const {
        search,
        class: studentClass,
        section,
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
          { rollNumber: { $regex: search, $options: 'i' } },
          { parentName: { $regex: search, $options: 'i' } },
        ];
      }

      if (studentClass) filter.class = studentClass;
      if (section) filter.section = section;
      if (status) filter.status = status;
      if (gender) filter.gender = gender;

      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
      const skip = (pageNum - 1) * limitNum;

      const [students, total] = await Promise.all([
        studentsCollection
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .toArray(),
        studentsCollection.countDocuments(filter),
      ]);

      return res.status(200).json({
        success: true,
        data: students,
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
        class: studentClass,
        section,
        rollNumber,
        parentName,
        parentPhone,
        address,
        dateOfBirth,
        gender,
        admissionDate,
      } = req.body || {};

      if (!name || !studentClass) {
        return res.status(400).json({ error: 'Name and class are required' });
      }

      if (email) {
        const existing = await studentsCollection.findOne({ email });
        if (existing) {
          return res.status(409).json({ error: 'Student with this email already exists' });
        }
      }

      if (rollNumber) {
        const existing = await studentsCollection.findOne({
          rollNumber,
          class: studentClass,
          section: section || null,
        });
        if (existing) {
          return res.status(409).json({ error: 'Roll number already taken in this class/section' });
        }
      }

      const newStudent = {
        name,
        email: email || '',
        phone: phone || '',
        class: studentClass,
        section: section || '',
        rollNumber: rollNumber || '',
        parentName: parentName || '',
        parentPhone: parentPhone || '',
        address: address || '',
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender: gender || '',
        admissionDate: admissionDate ? new Date(admissionDate) : new Date(),
        status: 'active',
        createdAt: new Date(),
      };

      const result = await studentsCollection.insertOne(newStudent);

      return res.status(201).json({
        success: true,
        data: { ...newStudent, _id: result.insertedId },
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Students error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
