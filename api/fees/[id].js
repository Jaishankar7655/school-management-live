import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../lib/mongodb.js';
import { setCorsHeaders } from '../lib/auth.js';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id || !ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid fee record ID' });
  }

  try {
    const { db } = await connectToDatabase();
    const feesCollection = db.collection('fees');
    const objectId = new ObjectId(id);

    if (req.method === 'GET') {
      const fee = await feesCollection.findOne({ _id: objectId });

      if (!fee) {
        return res.status(404).json({ error: 'Fee record not found' });
      }

      return res.status(200).json({ success: true, data: fee });
    }

    if (req.method === 'PUT') {
      const updates = req.body || {};
      delete updates._id;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No update data provided' });
      }

      if (updates.amount) updates.amount = parseFloat(updates.amount);
      if (updates.paidAmount) updates.paidAmount = parseFloat(updates.paidAmount);

      // Auto-update status based on payment
      if (updates.paidAmount !== undefined && updates.amount !== undefined) {
        if (updates.paidAmount >= updates.amount) {
          updates.status = 'paid';
          if (!updates.paidDate) updates.paidDate = new Date().toISOString().split('T')[0];
        }
      } else if (updates.paidAmount !== undefined) {
        const existing = await feesCollection.findOne({ _id: objectId });
        if (existing && updates.paidAmount >= existing.amount) {
          updates.status = 'paid';
          if (!updates.paidDate) updates.paidDate = new Date().toISOString().split('T')[0];
        }
      }

      updates.updatedAt = new Date();

      const result = await feesCollection.findOneAndUpdate(
        { _id: objectId },
        { $set: updates },
        { returnDocument: 'after' }
      );

      if (!result) {
        return res.status(404).json({ error: 'Fee record not found' });
      }

      return res.status(200).json({ success: true, data: result });
    }

    if (req.method === 'DELETE') {
      const result = await feesCollection.deleteOne({ _id: objectId });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Fee record not found' });
      }

      return res.status(200).json({ success: true, message: 'Fee record deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Fee [id] error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
