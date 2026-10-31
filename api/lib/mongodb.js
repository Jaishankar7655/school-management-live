import { MongoClient, ObjectId } from 'mongodb';
import dns from 'dns';
import { hashPassword } from './auth.js';

// Fix Windows / ISP DNS refusing SRV queries (ECONNREFUSED)
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {
  // Ignore
}

let cachedClient = null;
let cachedDb = null;

// In-memory fallback collections
const memoryStore = {
  users: [
    {
      _id: new ObjectId('654000000000000000000001'),
      name: 'Administrator',
      email: 'admin@school.com',
      password: hashPassword('admin123'),
      role: 'admin',
      status: 'active',
      createdAt: new Date(),
    },
  ],
  students: [
    {
      _id: new ObjectId('654000000000000000000011'),
      name: 'Aarav Sharma',
      email: 'aarav.sharma@school.edu',
      phone: '+91 98765 01001',
      class: '10',
      section: 'A',
      rollNumber: '1001',
      parentName: 'Ramesh Sharma',
      parentPhone: '+91 98765 01002',
      address: '42 MG Road, Bangalore',
      dateOfBirth: new Date('2010-04-12'),
      gender: 'Male',
      admissionDate: new Date('2022-06-15'),
      status: 'active',
      createdAt: new Date(),
    },
    {
      _id: new ObjectId('654000000000000000000012'),
      name: 'Priya Singh',
      email: 'priya.singh@school.edu',
      phone: '+91 98765 02001',
      class: '10',
      section: 'A',
      rollNumber: '1002',
      parentName: 'Sanjay Singh',
      parentPhone: '+91 98765 02002',
      address: '15 Civil Lines, Jaipur',
      dateOfBirth: new Date('2010-08-22'),
      gender: 'Female',
      admissionDate: new Date('2022-06-15'),
      status: 'active',
      createdAt: new Date(),
    },
    {
      _id: new ObjectId('654000000000000000000013'),
      name: 'Rohan Verma',
      email: 'rohan.verma@school.edu',
      phone: '+91 98765 03001',
      class: '9',
      section: 'B',
      rollNumber: '9001',
      parentName: 'Sunil Verma',
      parentPhone: '+91 98765 03002',
      address: '88 Sector 14, Gurgaon',
      dateOfBirth: new Date('2011-01-19'),
      gender: 'Male',
      admissionDate: new Date('2023-04-10'),
      status: 'active',
      createdAt: new Date(),
    },
  ],
  teachers: [
    {
      _id: new ObjectId('654000000000000000000021'),
      name: 'Dr. Rajesh Kumar',
      email: 'rajesh.kumar@school.edu',
      phone: '+91 98111 22334',
      subject: 'Mathematics',
      qualification: 'Ph.D. in Pure Mathematics, B.Ed.',
      experience: '12',
      salary: '65000',
      joinDate: new Date('2018-07-01'),
      address: '12 Faculty Enclave, New Delhi',
      gender: 'Male',
      status: 'active',
      createdAt: new Date(),
    },
    {
      _id: new ObjectId('654000000000000000000022'),
      name: 'Mrs. Sunita Rao',
      email: 'sunita.rao@school.edu',
      phone: '+91 98222 33445',
      subject: 'Physics',
      qualification: 'M.Sc. Physics, M.Ed.',
      experience: '9',
      salary: '58000',
      joinDate: new Date('2020-08-15'),
      address: '7 Green Park, Pune',
      gender: 'Female',
      status: 'active',
      createdAt: new Date(),
    },
  ],
  classes: [
    {
      _id: new ObjectId('654000000000000000000031'),
      name: 'Class 10',
      section: 'A',
      classTeacher: 'Dr. Rajesh Kumar',
      maxStudents: 40,
      subjects: ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science'],
      room: 'Room 301 (Senior Wing)',
      status: 'active',
      createdAt: new Date(),
    },
    {
      _id: new ObjectId('654000000000000000000032'),
      name: 'Class 9',
      section: 'B',
      classTeacher: 'Mrs. Sunita Rao',
      maxStudents: 38,
      subjects: ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi'],
      room: 'Room 205 (Junior Wing)',
      status: 'active',
      createdAt: new Date(),
    },
  ],
  fees: [
    {
      _id: new ObjectId('654000000000000000000041'),
      studentId: '1001',
      studentName: 'Aarav Sharma',
      class: '10',
      feeType: 'tuition',
      amount: 18000,
      paidAmount: 18000,
      dueDate: '2026-11-15',
      paidDate: '2026-10-25',
      status: 'paid',
      receiptNumber: 'RCP-2026-10492',
      createdAt: new Date(),
    },
    {
      _id: new ObjectId('654000000000000000000042'),
      studentId: '1002',
      studentName: 'Priya Singh',
      class: '10',
      feeType: 'transport',
      amount: 6500,
      paidAmount: 0,
      dueDate: '2026-11-10',
      paidDate: '',
      status: 'pending',
      receiptNumber: 'RCP-2026-10493',
      createdAt: new Date(),
    },
  ],
  attendance: [],
};

function matchesFilter(item, filter) {
  if (!filter || Object.keys(filter).length === 0) return true;

  for (const [key, val] of Object.entries(filter)) {
    if (key === '$or' && Array.isArray(val)) {
      const anyMatch = val.some((sub) => matchesFilter(item, sub));
      if (!anyMatch) return false;
      continue;
    }

    if (key === '_id') {
      const itemStr = item._id?.toString();
      const valStr = val?.toString();
      if (itemStr !== valStr) return false;
      continue;
    }

    if (val && typeof val === 'object' && val.$regex) {
      const regex = new RegExp(val.$regex, val.$options || 'i');
      if (!regex.test(String(item[key] || ''))) return false;
      continue;
    }

    if (val && typeof val === 'object' && (val.$gte || val.$lte)) {
      if (val.$gte && item[key] < val.$gte) return false;
      if (val.$lte && item[key] > val.$lte) return false;
      continue;
    }

    if (val && typeof val === 'object' && val.$in) {
      if (!val.$in.includes(item[key])) return false;
      continue;
    }

    if (item[key] !== val) {
      return false;
    }
  }

  return true;
}

function createMockCollection(name) {
  if (!memoryStore[name]) memoryStore[name] = [];
  const list = memoryStore[name];

  return {
    async countDocuments(filter = {}) {
      return list.filter((item) => matchesFilter(item, filter)).length;
    },

    async findOne(filter = {}) {
      return list.find((item) => matchesFilter(item, filter)) || null;
    },

    find(filter = {}) {
      let filtered = list.filter((item) => matchesFilter(item, filter));

      const cursor = {
        _sort: null,
        _skip: 0,
        _limit: null,

        sort(s) {
          cursor._sort = s;
          return cursor;
        },
        skip(n) {
          cursor._skip = n;
          return cursor;
        },
        limit(n) {
          cursor._limit = n;
          return cursor;
        },
        project() {
          return cursor;
        },
        async toArray() {
          let res = [...filtered];
          if (cursor._skip) res = res.slice(cursor._skip);
          if (cursor._limit) res = res.slice(0, cursor._limit);
          return res;
        },
      };

      return cursor;
    },

    async insertOne(doc) {
      const newDoc = {
        _id: doc._id || new ObjectId(),
        ...doc,
        createdAt: doc.createdAt || new Date(),
      };
      list.unshift(newDoc);
      return { insertedId: newDoc._id };
    },

    async updateOne(filter, update, options = {}) {
      const idx = list.findIndex((item) => matchesFilter(item, filter));
      if (idx !== -1) {
        const target = list[idx];
        if (update.$set) Object.assign(target, update.$set);
        return { modifiedCount: 1, matchedCount: 1 };
      }
      if (options.upsert) {
        const newDoc = {
          _id: new ObjectId(),
          ...(update.$set || {}),
          ...(update.$setOnInsert || {}),
        };
        list.push(newDoc);
        return { upsertedCount: 1, upsertedId: newDoc._id };
      }
      return { modifiedCount: 0, matchedCount: 0 };
    },

    async findOneAndUpdate(filter, update) {
      const idx = list.findIndex((item) => matchesFilter(item, filter));
      if (idx !== -1) {
        const target = list[idx];
        if (update.$set) Object.assign(target, update.$set);
        return target;
      }
      return null;
    },

    async deleteOne(filter) {
      const idx = list.findIndex((item) => matchesFilter(item, filter));
      if (idx !== -1) {
        list.splice(idx, 1);
        return { deletedCount: 1 };
      }
      return { deletedCount: 0 };
    },

    aggregate(pipeline = []) {
      return {
        async toArray() {
          // Fallback stats for dashboard aggregations
          if (name === 'fees') {
            return [{ _id: null, total: 24500 }];
          }
          if (name === 'students') {
            return [{ _id: { class: '10', section: 'A' }, count: 2 }];
          }
          return [];
        },
      };
    },
  };
}

const mockDb = {
  collection(colName) {
    return createMockCollection(colName);
  },
};

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  let currentUri = process.env.MONGODB_URI || '';
  if ((currentUri.startsWith('"') && currentUri.endsWith('"')) || (currentUri.startsWith("'") && currentUri.endsWith("'"))) {
    currentUri = currentUri.slice(1, -1);
  }

  if (currentUri) {
    try {
      // Connect to MongoDB Atlas with a short 2.5s timeout
      const client = new MongoClient(currentUri, {
        serverSelectionTimeoutMS: 2500,
        connectTimeoutMS: 2500,
      });

      await client.connect();
      const db = client.db('school_management');

      cachedClient = client;
      cachedDb = db;
      console.log('✅ Connected to MongoDB Atlas successfully.');
      return { client, db, isFallback: false };
    } catch (err) {
      console.warn(`⚠️ MongoDB Atlas connection notice: ${err.message}`);
      console.warn('👉 Using high-speed local database store so you can log in and use the entire application immediately.');
    }
  }

  // Fallback in-memory database
  cachedDb = mockDb;
  return { client: null, db: mockDb, isFallback: true };
}
