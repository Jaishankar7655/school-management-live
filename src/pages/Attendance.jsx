import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  HiOutlineClipboardDocumentCheck,
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineChartBar,
  HiOutlineArrowPath,
} from 'react-icons/hi2';
import Badge from '../components/Badge';

const CLASS_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const SECTION_OPTIONS = ['A', 'B', 'C', 'D'];

export default function Attendance() {
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'report'

  // Daily attendance state
  const [selectedClass, setSelectedClass] = useState('10');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({}); // { [studentId]: 'present' | 'absent' | 'late' }
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Report state
  const [reportStartDate, setReportStartDate] = useState(
    format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
  );
  const [reportEndDate, setReportEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [reportClass, setReportClass] = useState('10');
  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  // Load students and existing attendance for the selected class & date
  const loadDailyAttendance = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch students of this class
      const stdRes = await api.get(`/students?class=${selectedClass}&section=${selectedSection}&limit=100`);
      const studentList = stdRes.data?.students || stdRes.students || stdRes.data || [];

      // 2. Fetch existing attendance for this date & class
      const attRes = await api.get(
        `/attendance?class=${selectedClass}&section=${selectedSection}&date=${selectedDate}`
      );
      const existingRecords = attRes.data || attRes.records || [];

      // Build map of existing attendance
      const map = {};
      existingRecords.forEach((rec) => {
        if (rec.studentId) {
          map[rec.studentId] = rec.status;
        }
      });

      // If student has no marked attendance yet, default to 'present'
      studentList.forEach((s) => {
        const sId = s._id || s.id;
        if (!map[sId]) {
          map[sId] = 'present';
        }
      });

      setStudents(studentList);
      setAttendanceMap(map);
    } catch {
      toast.error('Failed to load class attendance');
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedSection, selectedDate]);

  useEffect(() => {
    if (activeTab === 'daily') {
      loadDailyAttendance();
    }
  }, [activeTab, loadDailyAttendance]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const setAllStatus = (status) => {
    const updated = {};
    students.forEach((s) => {
      const sId = s._id || s.id;
      updated[sId] = status;
    });
    setAttendanceMap(updated);
  };

  const handleSaveAttendance = async () => {
    if (students.length === 0) {
      toast.error('No students in this class to record');
      return;
    }

    setSaving(true);
    try {
      const records = students.map((s) => {
        const sId = s._id || s.id;
        return {
          studentId: sId,
          studentName: s.name,
          class: selectedClass,
          section: selectedSection,
          date: selectedDate,
          status: attendanceMap[sId] || 'present',
        };
      });

      await api.post('/attendance', records);
      toast.success(`Attendance saved for ${records.length} students`);
    } catch (err) {
      toast.error(err?.data?.error || err?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const fetchReport = async () => {
    setLoadingReport(true);
    try {
      const res = await api.get(
        `/attendance/report?class=${reportClass}&startDate=${reportStartDate}&endDate=${reportEndDate}`
      );
      setReportData(res.data || res);
    } catch {
      toast.error('Failed to generate attendance report');
    } finally {
      setLoadingReport(false);
    }
  };

  // Summary counts for daily tab
  const totalCount = students.length;
  const presentCount = Object.values(attendanceMap).filter((s) => s === 'present').length;
  const absentCount = Object.values(attendanceMap).filter((s) => s === 'absent').length;
  const lateCount = Object.values(attendanceMap).filter((s) => s === 'late').length;
  const presentRate = totalCount > 0 ? Math.round(((presentCount + lateCount) / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Attendance Tracker</h1>
          <p className="text-sm text-gray-500 mt-1">Record daily attendance and analyze attendance performance</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-gray-200/80 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'daily'
                ? 'bg-white text-primary-900 shadow-sm'
                : 'text-gray-600 hover:text-primary-900'
            }`}
          >
            Daily Sheet
          </button>
          <button
            onClick={() => {
              setActiveTab('report');
              if (!reportData) fetchReport();
            }}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'report'
                ? 'bg-white text-primary-900 shadow-sm'
                : 'text-gray-600 hover:text-primary-900'
            }`}
          >
            Analytics & Reports
          </button>
        </div>
      </div>

      {activeTab === 'daily' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Class Grade
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3.5 py-2 text-sm font-medium border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              >
                {CLASS_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    Class {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Section
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="px-3.5 py-2 text-sm font-medium border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              >
                {SECTION_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    Section {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3.5 py-2 text-sm font-medium border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>

            <div className="sm:ml-auto flex items-center gap-2 pt-5">
              <button
                type="button"
                onClick={() => setAllStatus('present')}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
              >
                All Present
              </button>
              <button
                type="button"
                onClick={() => setAllStatus('absent')}
                className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
              >
                All Absent
              </button>
              <button
                type="button"
                onClick={loadDailyAttendance}
                className="p-2 text-gray-500 hover:text-gray-700 bg-gray-50 border border-gray-200 rounded-lg transition-colors"
                title="Reload List"
              >
                <HiOutlineArrowPath className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs font-semibold text-gray-500">Enrolled Students</p>
              <p className="text-2xl font-bold text-primary-900 mt-1">{totalCount}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm bg-gradient-to-br from-white to-emerald-50/30">
              <p className="text-xs font-semibold text-emerald-700">Present</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{presentCount}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm bg-gradient-to-br from-white to-red-50/30">
              <p className="text-xs font-semibold text-red-700">Absent</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{absentCount}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm bg-gradient-to-br from-white to-amber-50/30">
              <p className="text-xs font-semibold text-amber-700">Attendance Rate</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{presentRate}%</p>
            </div>
          </div>

          {/* Student Attendance Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Roll No</th>
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4 text-center">Status Selection</th>
                    <th className="px-6 py-4 text-right">Current Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                        Loading student roster...
                      </td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        No students enrolled in Class {selectedClass}-{selectedSection}.
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => {
                      const sId = student._id || student.id;
                      const currentStatus = attendanceMap[sId] || 'present';

                      return (
                        <tr key={sId} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 font-mono font-medium text-gray-700">
                            {student.rollNumber || '—'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">{student.name}</div>
                            <div className="text-xs text-gray-400">{student.email || student.parentName}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-1 sm:gap-2">
                              <button
                                type="button"
                                onClick={() => handleStatusChange(sId, 'present')}
                                className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all flex items-center gap-1.5 ${
                                  currentStatus === 'present'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                                }`}
                              >
                                <HiOutlineCheckCircle className="w-4 h-4" />
                                Present
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(sId, 'late')}
                                className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all flex items-center gap-1.5 ${
                                  currentStatus === 'late'
                                    ? 'bg-amber-500 text-white shadow-xs'
                                    : 'bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-700'
                                }`}
                              >
                                <HiOutlineClock className="w-4 h-4" />
                                Late
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(sId, 'absent')}
                                className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all flex items-center gap-1.5 ${
                                  currentStatus === 'absent'
                                    ? 'bg-red-600 text-white shadow-xs'
                                    : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700'
                                }`}
                              >
                                <HiOutlineXCircle className="w-4 h-4" />
                                Absent
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Badge status={currentStatus} />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Save Bar */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Clicking save will persist these records to MongoDB.
              </span>
              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={saving || students.length === 0}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {saving && (
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                Save Daily Attendance
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'report' && (
        <div className="space-y-6">
          {/* Report Filter Controls */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Class Grade
              </label>
              <select
                value={reportClass}
                onChange={(e) => setReportClass(e.target.value)}
                className="px-3.5 py-2 text-sm font-medium border border-gray-300 rounded-lg bg-white"
              >
                {CLASS_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    Class {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={reportStartDate}
                onChange={(e) => setReportStartDate(e.target.value)}
                className="px-3.5 py-2 text-sm font-medium border border-gray-300 rounded-lg bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                End Date
              </label>
              <input
                type="date"
                value={reportEndDate}
                onChange={(e) => setReportEndDate(e.target.value)}
                className="px-3.5 py-2 text-sm font-medium border border-gray-300 rounded-lg bg-white"
              />
            </div>

            <button
              type="button"
              onClick={fetchReport}
              disabled={loadingReport}
              className="px-5 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <HiOutlineChartBar className="w-4 h-4" />
              Generate Report
            </button>
          </div>

          {/* Report Summary Cards */}
          {reportData?.summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-xs font-semibold text-gray-500">Total Recorded Entries</p>
                <p className="text-2xl font-bold text-primary-900 mt-1">{reportData.summary.totalRecords}</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm">
                <p className="text-xs font-semibold text-emerald-700">Days Present</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{reportData.summary.present}</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-red-100 shadow-sm">
                <p className="text-xs font-semibold text-red-700">Days Absent</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{reportData.summary.absent}</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-amber-100 shadow-sm">
                <p className="text-xs font-semibold text-amber-700">Overall Attendance</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{reportData.summary.attendanceRate}%</p>
              </div>
            </div>
          )}

          {/* Student Stats Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-primary-900 text-sm">Student Attendance Rate Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Student Name</th>
                    <th className="px-6 py-3 text-center">Present</th>
                    <th className="px-6 py-3 text-center">Late</th>
                    <th className="px-6 py-3 text-center">Absent</th>
                    <th className="px-6 py-3 text-center">Total Days</th>
                    <th className="px-6 py-3 text-right">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loadingReport ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                        Generating report statistics...
                      </td>
                    </tr>
                  ) : !reportData?.studentStats || reportData.studentStats.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                        No attendance records found for this timeframe.
                      </td>
                    </tr>
                  ) : (
                    reportData.studentStats.map((stat) => (
                      <tr key={stat.studentId} className="hover:bg-gray-50/50">
                        <td className="px-6 py-3.5 font-semibold text-gray-900">{stat.studentName}</td>
                        <td className="px-6 py-3.5 text-center text-emerald-600 font-medium">{stat.present}</td>
                        <td className="px-6 py-3.5 text-center text-amber-600 font-medium">{stat.late}</td>
                        <td className="px-6 py-3.5 text-center text-red-600 font-medium">{stat.absent}</td>
                        <td className="px-6 py-3.5 text-center text-gray-600">{stat.total}</td>
                        <td className="px-6 py-3.5 text-right">
                          <span
                            className={`inline-block font-semibold px-2 py-0.5 rounded text-xs ${
                              Number(stat.attendanceRate) >= 80
                                ? 'bg-emerald-50 text-emerald-700'
                                : Number(stat.attendanceRate) >= 60
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            {stat.attendanceRate}%
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

