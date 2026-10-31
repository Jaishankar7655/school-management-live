import { connectToDatabase } from '../lib/mongodb.js';
import { setCorsHeaders } from '../lib/auth.js';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      class: studentClass,
      section,
      studentId,
      startDate,
      endDate,
    } = req.query || {};

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate query parameters are required' });
    }

    const { db } = await connectToDatabase();
    const attendanceCollection = db.collection('attendance');

    const filter = {
      date: { $gte: startDate, $lte: endDate },
    };

    if (studentClass) filter.class = studentClass;
    if (section) filter.section = section;
    if (studentId) filter.studentId = studentId;

    const records = await attendanceCollection.find(filter).toArray();

    const totalRecords = records.length;
    const presentCount = records.filter((r) => r.status === 'present').length;
    const absentCount = records.filter((r) => r.status === 'absent').length;
    const lateCount = records.filter((r) => r.status === 'late').length;

    const attendanceRate = totalRecords > 0
      ? (((presentCount + lateCount) / totalRecords) * 100).toFixed(2)
      : '0.00';

    // Daily breakdown
    const dailyBreakdown = {};
    for (const record of records) {
      if (!dailyBreakdown[record.date]) {
        dailyBreakdown[record.date] = { present: 0, absent: 0, late: 0, total: 0 };
      }
      dailyBreakdown[record.date][record.status]++;
      dailyBreakdown[record.date].total++;
    }

    // Per-student summary (if querying a class)
    const studentSummary = {};
    for (const record of records) {
      if (!studentSummary[record.studentId]) {
        studentSummary[record.studentId] = {
          studentId: record.studentId,
          studentName: record.studentName,
          present: 0,
          absent: 0,
          late: 0,
          total: 0,
        };
      }
      studentSummary[record.studentId][record.status]++;
      studentSummary[record.studentId].total++;
    }

    const studentStats = Object.values(studentSummary).map((s) => ({
      ...s,
      attendanceRate: s.total > 0
        ? (((s.present + s.late) / s.total) * 100).toFixed(2)
        : '0.00',
    }));

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRecords,
          present: presentCount,
          absent: absentCount,
          late: lateCount,
          attendanceRate: parseFloat(attendanceRate),
        },
        dailyBreakdown,
        studentStats: studentStats.sort((a, b) => a.studentName.localeCompare(b.studentName)),
        filters: {
          class: studentClass || 'all',
          section: section || 'all',
          studentId: studentId || 'all',
          startDate,
          endDate,
        },
      },
    });
  } catch (error) {
    console.error('Attendance report error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
