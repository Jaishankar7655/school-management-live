import { connectToDatabase } from '../lib/mongodb.js';
import { setCorsHeaders } from '../lib/auth.js';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { db } = await connectToDatabase();
    const feesCollection = db.collection('fees');

    if (req.method === 'GET') {
      const {
        search,
        studentId,
        class: studentClass,
        feeType,
        status,
        startDate,
        endDate,
        page = '1',
        limit = '50',
      } = req.query || {};

      const filter = {};

      if (search) {
        filter.$or = [
          { studentName: { $regex: search, $options: 'i' } },
          { receiptNumber: { $regex: search, $options: 'i' } },
        ];
      }

      if (studentId) filter.studentId = studentId;
      if (studentClass) filter.class = studentClass;
      if (feeType) filter.feeType = feeType;
      if (status) filter.status = status;

      if (startDate || endDate) {
        filter.dueDate = {};
        if (startDate) filter.dueDate.$gte = startDate;
        if (endDate) filter.dueDate.$lte = endDate;
      }

      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
      const skip = (pageNum - 1) * limitNum;

      const [fees, total] = await Promise.all([
        feesCollection
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .toArray(),
        feesCollection.countDocuments(filter),
      ]);

      return res.status(200).json({
        success: true,
        data: fees,
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
        studentId,
        studentName,
        class: studentClass,
        feeType,
        amount,
        paidAmount,
        dueDate,
        paidDate,
        status,
        receiptNumber,
      } = req.body || {};

      if (!studentId || !studentName || !feeType || !amount) {
        return res.status(400).json({
          error: 'studentId, studentName, feeType, and amount are required',
        });
      }

      const validFeeTypes = ['tuition', 'transport', 'library', 'lab', 'exam', 'other'];
      if (!validFeeTypes.includes(feeType)) {
        return res.status(400).json({
          error: `Invalid feeType. Must be one of: ${validFeeTypes.join(', ')}`,
        });
      }

      const parsedAmount = parseFloat(amount);
      const parsedPaidAmount = paidAmount ? parseFloat(paidAmount) : 0;

      let feeStatus = status || 'pending';
      if (parsedPaidAmount >= parsedAmount) {
        feeStatus = 'paid';
      } else if (dueDate && new Date(dueDate) < new Date() && feeStatus !== 'paid') {
        feeStatus = 'overdue';
      }

      const receiptNum = receiptNumber || `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      const newFee = {
        studentId,
        studentName,
        class: studentClass || '',
        feeType,
        amount: parsedAmount,
        paidAmount: parsedPaidAmount,
        dueDate: dueDate || '',
        paidDate: paidDate || '',
        status: feeStatus,
        receiptNumber: receiptNum,
        createdAt: new Date(),
      };

      const result = await feesCollection.insertOne(newFee);

      return res.status(201).json({
        success: true,
        data: { ...newFee, _id: result.insertedId },
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Fees error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
