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
    return res.status(400).json({ error: 'Invalid class ID' });
  }

  try {
    const { db } = await connectToDatabase();
    const classesCollection = db.collection('classes');
    const objectId = new ObjectId(id);

    if (req.method === 'GET') {
      const classDoc = await classesCollection.findOne({ _id: objectId });

      if (!classDoc) {
        return res.status(404).json({ error: 'Class not found' });
      }

      return res.status(200).json({ success: true, data: classDoc });
    }

    if (req.method === 'PUT') {
      const updates = req.body || {};
      delete updates._id;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No update data provided' });
      }

      if (updates.maxStudents) {
        updates.maxStudents = parseInt(updates.maxStudents);
      }

      updates.updatedAt = new Date();

      const result = await classesCollection.findOneAndUpdate(
        { _id: objectId },
        { $set: updates },
        { returnDocument: 'after' }
      );

      if (!result) {
        return res.status(404).json({ error: 'Class not found' });
      }

      return res.status(200).json({ success: true, data: result });
    }

    if (req.method === 'DELETE') {
      const result = await classesCollection.deleteOne({ _id: objectId });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Class not found' });
      }

      return res.status(200).json({ success: true, message: 'Class deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Class [id] error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
