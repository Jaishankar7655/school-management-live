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
    const { db } = await connectToDatabase();

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Current month boundaries
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Run all count queries in parallel
    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      todayAttendance,
      todayTotalStudents,
      monthlyFees,
      recentStudents,
      recentTeachers,
      recentFees,
      classDistribution,
    ] = await Promise.all([
      // Total counts
      db.collection('students').countDocuments({ status: 'active' }),
      db.collection('teachers').countDocuments({ status: 'active' }),
      db.collection('classes').countDocuments({ status: 'active' }),

      // Today's attendance
      db.collection('attendance').countDocuments({ date: today, status: { $in: ['present', 'late'] } }),
      db.collection('attendance').countDocuments({ date: today }),

      // Monthly fee collection
      db.collection('fees').aggregate([
        {
          $match: {
            status: 'paid',
            createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$paidAmount' },
          },
        },
      ]).toArray(),

      // Recent students
      db.collection('students').find().sort({ createdAt: -1 }).limit(5).project({ name: 1, class: 1, createdAt: 1 }).toArray(),

      // Recent teachers
      db.collection('teachers').find().sort({ createdAt: -1 }).limit(3).project({ name: 1, subject: 1, createdAt: 1 }).toArray(),

      // Recent fee payments
      db.collection('fees').find({ status: 'paid' }).sort({ createdAt: -1 }).limit(5).project({ studentName: 1, amount: 1, feeType: 1, createdAt: 1 }).toArray(),

      // Class-wise student distribution
      db.collection('students').aggregate([
        { $match: { status: 'active' } },
        {
          $group: {
            _id: { class: '$class', section: '$section' },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.class': 1, '_id.section': 1 } },
      ]).toArray(),
    ]);

    // Attendance rate
    const attendanceRate = todayTotalStudents > 0
      ? parseFloat(((todayAttendance / todayTotalStudents) * 100).toFixed(2))
      : 0;

    // Monthly fee collection trend (last 6 months)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyTrend = await db.collection('fees').aggregate([
      {
        $match: {
          status: 'paid',
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          total: { $sum: '$paidAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]).toArray();

    // Format monthly trend
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const feeCollectionTrend = monthlyTrend.map((m) => ({
      month: `${months[m._id.month - 1]} ${m._id.year}`,
      total: m.total,
      count: m.count,
    }));

    // Format recent activities
    const recentActivities = [
      ...recentStudents.map((s) => ({
        type: 'student',
        message: `New student "${s.name}" added to class ${s.class}`,
        timestamp: s.createdAt,
      })),
      ...recentTeachers.map((t) => ({
        type: 'teacher',
        message: `New teacher "${t.name}" joined (${t.subject})`,
        timestamp: t.createdAt,
      })),
      ...recentFees.map((f) => ({
        type: 'fee',
        message: `Fee payment of ₹${f.amount} received from ${f.studentName} (${f.feeType})`,
        timestamp: f.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    // Format class distribution
    const classWiseDistribution = classDistribution.map((c) => ({
      class: c._id.class,
      section: c._id.section || '-',
      students: c.count,
    }));

    return res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalTeachers,
        totalClasses,
        feesCollectedThisMonth: monthlyFees.length > 0 ? monthlyFees[0].total : 0,
        attendanceRateToday: attendanceRate,
        recentActivities,
        feeCollectionTrend,
        classWiseDistribution,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
