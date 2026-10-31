import { connectToDatabase } from '../lib/mongodb.js';
import { setCorsHeaders } from '../lib/auth.js';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { db } = await connectToDatabase();
    const attendanceCollection = db.collection('attendance');

    if (req.method === 'GET') {
      const {
        date,
        class: studentClass,
        section,
        studentId,
        status,
        startDate,
        endDate,
        page = '1',
        limit = '50',
      } = req.query || {};

      const filter = {};

      if (date) filter.date = date;
      if (studentClass) filter.class = studentClass;
      if (section) filter.section = section;
      if (studentId) filter.studentId = studentId;
      if (status) filter.status = status;

      if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = startDate;
        if (endDate) filter.date.$lte = endDate;
      }

      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
      const skip = (pageNum - 1) * limitNum;

      const [records, total] = await Promise.all([
        attendanceCollection
          .find(filter)
          .sort({ date: -1, class: 1, section: 1 })
          .skip(skip)
          .limit(limitNum)
          .toArray(),
        attendanceCollection.countDocuments(filter),
      ]);

      return res.status(200).json({
        success: true,
        data: records,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    }

    if (req.method === 'POST') {
      const body = req.body || {};

      // Support both single record and batch marking
      const records = Array.isArray(body) ? body : [body];

      if (records.length === 0) {
        return res.status(400).json({ error: 'No attendance data provided' });
      }

      const attendanceRecords = [];

      for (const record of records) {
        const { studentId, studentName, class: studentClass, section, date, status, markedBy } = record;

        if (!studentId || !studentName || !studentClass || !date || !status) {
          return res.status(400).json({
            error: 'studentId, studentName, class, date, and status are required for each record',
          });
        }

        const validStatuses = ['present', 'absent', 'late'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }

        // Upsert: update if already marked for same student on same date
        await attendanceCollection.updateOne(
          { studentId, date },
          {
            $set: {
              studentId,
              studentName,
              class: studentClass,
              section: section || '',
              date,
              status,
              markedBy: markedBy || 'admin',
              updatedAt: new Date(),
            },
            $setOnInsert: {
              createdAt: new Date(),
            },
          },
          { upsert: true }
        );

        attendanceRecords.push({
          studentId,
          studentName,
          class: studentClass,
          section: section || '',
          date,
          status,
          markedBy: markedBy || 'admin',
        });
      }

      return res.status(201).json({
        success: true,
        message: `Attendance marked for ${attendanceRecords.length} student(s)`,
        data: attendanceRecords,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Attendance error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
