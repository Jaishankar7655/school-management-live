import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { format } from 'date-fns';
import {
  HiOutlineUserGroup,
  HiOutlineAcademicCap,
  HiOutlineBuildingOffice2,
  HiOutlineCurrencyRupee,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowRight,
  HiOutlinePlusCircle,
  HiOutlineClipboardDocumentList,
  HiOutlineBanknotes,
  HiOutlineCalendarDays,
  HiOutlineUserPlus,
  HiOutlineClock,
} from 'react-icons/hi2';
import StatsCard from '../components/StatsCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const FALLBACK_STATS = {
  totalStudents: 1245,
  totalTeachers: 68,
  totalClasses: 32,
  monthlyRevenue: 485000,
  studentsChange: 12.5,
  teachersChange: 4.2,
  classesChange: 8.0,
  revenueChange: 15.3,
};

const FALLBACK_FEE_CHART = [
  { month: 'Jan', amount: 420000 },
  { month: 'Feb', amount: 380000 },
  { month: 'Mar', amount: 450000 },
  { month: 'Apr', amount: 410000 },
  { month: 'May', amount: 390000 },
  { month: 'Jun', amount: 470000 },
  { month: 'Jul', amount: 360000 },
  { month: 'Aug', amount: 485000 },
  { month: 'Sep', amount: 440000 },
  { month: 'Oct', amount: 510000 },
  { month: 'Nov', amount: 430000 },
  { month: 'Dec', amount: 460000 },
];

const FALLBACK_ATTENDANCE = [
  { name: 'Present', value: 892, color: '#16a34a' },
  { name: 'Absent', value: 124, color: '#dc2626' },
  { name: 'Late', value: 78, color: '#f59e0b' },
  { name: 'Leave', value: 51, color: '#6b7280' },
];

const FALLBACK_ACTIVITIES = [
  { id: 1, type: 'registration', message: 'New student Aarav Sharma registered in Class 10-A', time: '10 minutes ago' },
  { id: 2, type: 'payment', message: 'Fee payment of ₹15,000 received from Priya Singh (Class 9-B)', time: '25 minutes ago' },
  { id: 3, type: 'attendance', message: 'Attendance marked for Class 8-C by Mrs. Gupta', time: '1 hour ago' },
  { id: 4, type: 'registration', message: 'New teacher Dr. Rajesh Kumar onboarded — Mathematics Dept.', time: '2 hours ago' },
  { id: 5, type: 'payment', message: 'Fee payment of ₹12,500 received from Ravi Patel (Class 7-A)', time: '3 hours ago' },
  { id: 6, type: 'attendance', message: 'Attendance report generated for October 2026', time: '5 hours ago' },
];

const ACTIVITY_ICONS = {
  registration: HiOutlineUserPlus,
  payment: HiOutlineBanknotes,
  attendance: HiOutlineClipboardDocumentList,
};

const ACTIVITY_COLORS = {
  registration: 'bg-blue-100 text-blue-600',
  payment: 'bg-green-100 text-green-600',
  attendance: 'bg-purple-100 text-purple-600',
};

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-3 flex-1">
          <div className="h-3 bg-gray-200 rounded w-24" />
          <div className="h-7 bg-gray-200 rounded w-16" />
          <div className="h-3 bg-gray-200 rounded w-20" />
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-40 mb-6" />
      <div className="h-64 bg-gray-100 rounded-lg" />
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-gray-100">
        <p className="text-sm font-semibold text-primary-900">{label}</p>
        <p className="text-sm text-gray-600 mt-1">
          ₹{payload[0].value.toLocaleString('en-IN')}
        </p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [feeChartData, setFeeChartData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/dashboard/stats');
      const d = response.data || response;
      setStats({
        totalStudents: d.totalStudents ?? d.stats?.totalStudents ?? FALLBACK_STATS.totalStudents,
        totalTeachers: d.totalTeachers ?? d.stats?.totalTeachers ?? FALLBACK_STATS.totalTeachers,
        totalClasses: d.totalClasses ?? d.stats?.totalClasses ?? FALLBACK_STATS.totalClasses,
        monthlyRevenue: d.feesCollectedThisMonth ?? d.monthlyRevenue ?? d.stats?.monthlyRevenue ?? FALLBACK_STATS.monthlyRevenue,
        studentsChange: d.studentsChange ?? FALLBACK_STATS.studentsChange,
        teachersChange: d.teachersChange ?? FALLBACK_STATS.teachersChange,
        classesChange: d.classesChange ?? FALLBACK_STATS.classesChange,
        revenueChange: d.revenueChange ?? FALLBACK_STATS.revenueChange,
      });

      if (d.feeCollectionTrend && d.feeCollectionTrend.length > 0) {
        setFeeChartData(d.feeCollectionTrend.map(item => ({ month: item.month, amount: item.total })));
      } else {
        setFeeChartData(d.feeChart || FALLBACK_FEE_CHART);
      }

      setAttendanceData(d.attendance || FALLBACK_ATTENDANCE);
      setRecentActivity(d.recentActivities || d.recentActivity || FALLBACK_ACTIVITIES);
    } catch {
      // Use fallback data for demo
      setStats(FALLBACK_STATS);
      setFeeChartData(FALLBACK_FEE_CHART);
      setAttendanceData(FALLBACK_ATTENDANCE);
      setRecentActivity(FALLBACK_ACTIVITIES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const quickActions = [
    { label: 'Add Student', icon: HiOutlineUserPlus, path: '/students', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
    { label: 'Record Payment', icon: HiOutlineBanknotes, path: '/fees', color: 'bg-green-50 text-green-600 hover:bg-green-100' },
    { label: 'Mark Attendance', icon: HiOutlineCalendarDays, path: '/attendance', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
    { label: 'Manage Classes', icon: HiOutlineBuildingOffice2, path: '/classes', color: 'bg-amber-50 text-amber-600 hover:bg-amber-100' },
  ];

  const today = format(new Date(), 'EEEE, MMMM d, yyyy');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-900 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-accent-500/10 rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <p className="text-primary-200 text-sm font-medium">{today}</p>
          <h1 className="text-2xl md:text-3xl font-bold mt-1">
            Welcome back, {user?.name || 'Administrator'}! 👋
          </h1>
          <p className="text-primary-200 mt-2 text-sm md:text-base max-w-xl">
            Here&apos;s an overview of your school&apos;s performance today. Keep up the great work managing your institution.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatsCard
            title="Total Students"
            value={stats.totalStudents?.toLocaleString('en-IN') || '0'}
            change={stats.studentsChange}
            icon={HiOutlineUserGroup}
            color="blue"
          />
          <StatsCard
            title="Total Teachers"
            value={stats.totalTeachers?.toLocaleString('en-IN') || '0'}
            change={stats.teachersChange}
            icon={HiOutlineAcademicCap}
            color="green"
          />
          <StatsCard
            title="Total Classes"
            value={stats.totalClasses?.toLocaleString('en-IN') || '0'}
            change={stats.classesChange}
            icon={HiOutlineBuildingOffice2}
            color="purple"
          />
          <StatsCard
            title="Revenue This Month"
            value={`₹${(stats.monthlyRevenue || 0).toLocaleString('en-IN')}`}
            change={stats.revenueChange}
            icon={HiOutlineCurrencyRupee}
            color="amber"
          />
        </div>
      )}

      {/* Charts Section */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fee Collection Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-primary-900">Monthly Fee Collection</h3>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                <HiOutlineArrowTrendingUp className="w-3.5 h-3.5" />
                +{stats.revenueChange}%
              </span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={feeChartData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="amount" fill="#1B2A4A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Attendance Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-primary-900">Attendance Overview</h3>
              <span className="text-xs text-gray-500 font-medium">Today</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={attendanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} students`, name]}
                  contentStyle={{
                    borderRadius: '0.75rem',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    padding: '8px 14px',
                    fontSize: '0.875rem',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="text-sm text-gray-600 ml-1">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Bottom Section: Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-primary-900">Recent Activity</h3>
            <button className="text-xs font-medium text-primary-600 hover:text-primary-800 inline-flex items-center gap-1 transition-colors">
              View All
              <HiOutlineArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-3 animate-pulse">
                  <div className="w-9 h-9 bg-gray-200 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const IconComponent = ACTIVITY_ICONS[activity.type] || HiOutlineClock;
                const colorClass = ACTIVITY_COLORS[activity.type] || 'bg-gray-100 text-gray-600';
                return (
                  <div key={activity.id} className="flex items-start gap-3 group">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <IconComponent className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 leading-snug">{activity.message}</p>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <HiOutlineClock className="w-3 h-3" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-primary-900 mb-5">Quick Actions</h3>
          <div className="space-y-3">
            {quickActions.map((action) => {
              const ActionIcon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${action.color}`}
                >
                  <ActionIcon className="w-5 h-5" />
                  {action.label}
                  <HiOutlineArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })}
          </div>

          {/* Mini calendar preview */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-primary-900 mb-3 flex items-center gap-2">
              <HiOutlineCalendarDays className="w-4 h-4" />
              Upcoming Events
            </h4>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-1 h-8 bg-blue-500 rounded-full flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-700">Parent-Teacher Meeting</p>
                  <p className="text-xs text-gray-400">Nov 5, 2026</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-1 h-8 bg-green-500 rounded-full flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-700">Annual Sports Day</p>
                  <p className="text-xs text-gray-400">Nov 12, 2026</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-1 h-8 bg-amber-500 rounded-full flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-700">Mid-Term Exams Begin</p>
                  <p className="text-xs text-gray-400">Nov 18, 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
