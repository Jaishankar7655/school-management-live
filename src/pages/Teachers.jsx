import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  HiOutlineAcademicCap,
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlineMapPin,
  HiOutlineCalendarDays,
  HiOutlineIdentification,
  HiOutlineCurrencyRupee,
  HiOutlineBriefcase,
} from 'react-icons/hi2';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import ConfirmDialog from '../components/ConfirmDialog';
import SearchFilter from '../components/SearchFilter';
import Badge from '../components/Badge';

const SUBJECT_OPTIONS = [
  { value: '', label: 'All Subjects' },
  { value: 'Mathematics', label: 'Mathematics' },
  { value: 'English', label: 'English' },
  { value: 'Physics', label: 'Physics' },
  { value: 'Chemistry', label: 'Chemistry' },
  { value: 'Biology', label: 'Biology' },
  { value: 'History', label: 'History' },
  { value: 'Geography', label: 'Geography' },
  { value: 'Computer Science', label: 'Computer Science' },
  { value: 'Physical Education', label: 'Physical Education' },
  { value: 'Art', label: 'Art' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'on_leave', label: 'On Leave' },
];

const GENDER_OPTIONS = [
  { value: '', label: 'Select Gender' },
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
];

const INITIAL_FORM = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  qualification: '',
  experience: '',
  salary: '',
  joinDate: '',
  address: '',
  gender: '',
};

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ subject: '', status: '' });

  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filters.subject) params.append('subject', filters.subject);
      if (filters.status) params.append('status', filters.status);
      const response = await api.get(`/teachers?${params.toString()}`);
      setTeachers(response.teachers || response.data?.teachers || response.data || response || []);
    } catch {
      toast.error('Failed to fetch teachers');
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  }, [search, filters]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.subject) errors.subject = 'Teaching subject is required';
    if (!formData.qualification.trim()) errors.qualification = 'Qualification is required';
    if (!formData.gender) errors.gender = 'Gender is required';
    if (!formData.joinDate) errors.joinDate = 'Joining date is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleAdd = () => {
    setFormData(INITIAL_FORM);
    setFormErrors({});
    setEditingId(null);
    setModalOpen(true);
  };

  const handleEdit = (teacher) => {
    setFormData({
      name: teacher.name || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      subject: teacher.subject || '',
      qualification: teacher.qualification || '',
      experience: teacher.experience || '',
      salary: teacher.salary || '',
      joinDate: teacher.joinDate ? teacher.joinDate.substring(0, 10) : '',
      address: teacher.address || '',
      gender: teacher.gender || '',
    });
    setFormErrors({});
    setEditingId(teacher._id || teacher.id);
    setModalOpen(true);
  };

  const handleView = (teacher) => {
    setSelectedTeacher(teacher);
    setViewModalOpen(true);
  };

  const handleDeleteClick = (teacher) => {
    setSelectedTeacher(teacher);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/teachers/${editingId}`, formData);
        toast.success('Teacher record updated successfully');
      } else {
        await api.post('/teachers', formData);
        toast.success('Teacher enrolled successfully');
      }
      setModalOpen(false);
      fetchTeachers();
    } catch (err) {
      toast.error(err?.data?.error || err?.message || 'Failed to save teacher');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTeacher) return;
    try {
      await api.delete(`/teachers/${selectedTeacher._id || selectedTeacher.id}`);
      toast.success('Teacher removed successfully');
      setDeleteDialogOpen(false);
      setSelectedTeacher(null);
      fetchTeachers();
    } catch (err) {
      toast.error(err?.data?.error || 'Failed to delete teacher');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Teacher Name',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center font-semibold text-xs flex-shrink-0">
            {row.name ? row.name.charAt(0).toUpperCase() : 'T'}
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-sm">{row.name}</div>
            <div className="text-xs text-gray-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'subject',
      label: 'Subject',
      render: (val, row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
          {row.subject}
        </span>
      ),
    },
    {
      key: 'qualification',
      label: 'Qualification',
      render: (val, row) => <span className="text-sm text-gray-700">{row.qualification || '—'}</span>,
    },
    {
      key: 'experience',
      label: 'Experience',
      render: (val, row) => (
        <span className="text-sm text-gray-700">
          {row.experience ? `${row.experience} yrs` : '—'}
        </span>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (val, row) => <span className="text-sm text-gray-600">{row.phone || '—'}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (val, row) => <Badge status={row.status || 'active'} />,
    },
  ];

  const filterConfig = [
    {
      name: 'subject',
      label: 'All Subjects',
      options: SUBJECT_OPTIONS.filter((s) => s.value !== ''),
    },
    {
      name: 'status',
      label: 'All Status',
      options: STATUS_OPTIONS.filter((s) => s.value !== ''),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Faculty & Teachers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage teaching staff, assignments, and faculty records</p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        filters={filterConfig}
        onFilterChange={(name, value) => setFilters((prev) => ({ ...prev, [name]: value }))}
        onAdd={handleAdd}
        addLabel="Add Faculty Member"
      />

      {/* Table */}
      <DataTable
        columns={columns}
        data={teachers}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onView={handleView}
        loading={loading}
        emptyMessage="No faculty records found. Click 'Add Faculty Member' to register a new teacher."
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Faculty Details' : 'Register New Faculty Member'}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <FormField
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleFormChange}
            placeholder="e.g. Dr. Rajesh Sharma"
            required
            error={formErrors.name}
          />
          <FormField
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleFormChange}
            placeholder="teacher@school.edu"
            required
            error={formErrors.email}
          />
          <FormField
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleFormChange}
            placeholder="+91 98765 43210"
            required
            error={formErrors.phone}
          />
          <FormField
            label="Gender"
            type="select"
            name="gender"
            value={formData.gender}
            onChange={handleFormChange}
            options={GENDER_OPTIONS}
            required
            error={formErrors.gender}
          />
          <FormField
            label="Primary Subject"
            type="select"
            name="subject"
            value={formData.subject}
            onChange={handleFormChange}
            options={SUBJECT_OPTIONS.filter((s) => s.value !== '')}
            required
            error={formErrors.subject}
          />
          <FormField
            label="Qualification / Degree"
            name="qualification"
            value={formData.qualification}
            onChange={handleFormChange}
            placeholder="e.g. M.Sc. Mathematics, B.Ed."
            required
            error={formErrors.qualification}
          />
          <FormField
            label="Experience (in years)"
            type="number"
            name="experience"
            value={formData.experience}
            onChange={handleFormChange}
            placeholder="e.g. 5"
          />
          <FormField
            label="Monthly Salary (₹)"
            type="number"
            name="salary"
            value={formData.salary}
            onChange={handleFormChange}
            placeholder="e.g. 45000"
          />
          <FormField
            label="Date of Joining"
            type="date"
            name="joinDate"
            value={formData.joinDate}
            onChange={handleFormChange}
            required
            error={formErrors.joinDate}
          />
          <div className="md:col-span-2">
            <FormField
              label="Residential Address"
              name="address"
              value={formData.address}
              onChange={handleFormChange}
              placeholder="Full residential address"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setModalOpen(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving && (
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {editingId ? 'Update Faculty' : 'Save Faculty'}
          </button>
        </div>
      </Modal>

      {/* View Detail Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Faculty Profile"
        size="lg"
      >
        {selectedTeacher && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-5 bg-primary-50 rounded-xl border border-primary-100">
              <div className="w-16 h-16 rounded-full bg-primary-700 text-white flex items-center justify-center text-2xl font-bold shadow-sm">
                {selectedTeacher.name ? selectedTeacher.name.charAt(0).toUpperCase() : 'T'}
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary-900">{selectedTeacher.name}</h3>
                <p className="text-sm font-medium text-amber-700 mt-0.5">{selectedTeacher.subject} Faculty</p>
                <p className="text-xs text-gray-500 mt-1">{selectedTeacher.qualification}</p>
              </div>
              <div className="ml-auto">
                <Badge status={selectedTeacher.status || 'active'} size="lg" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailBox icon={HiOutlineEnvelope} label="Email Address" value={selectedTeacher.email} />
              <DetailBox icon={HiOutlinePhone} label="Contact Number" value={selectedTeacher.phone} />
              <DetailBox icon={HiOutlineBriefcase} label="Experience" value={selectedTeacher.experience ? `${selectedTeacher.experience} Years` : '—'} />
              <DetailBox icon={HiOutlineCurrencyRupee} label="Monthly Salary" value={selectedTeacher.salary ? `₹${Number(selectedTeacher.salary).toLocaleString('en-IN')}` : '—'} />
              <DetailBox icon={HiOutlineCalendarDays} label="Joining Date" value={selectedTeacher.joinDate ? format(new Date(selectedTeacher.joinDate), 'MMMM dd, yyyy') : '—'} />
              <DetailBox icon={HiOutlineIdentification} label="Gender" value={selectedTeacher.gender || '—'} />
              <div className="md:col-span-2">
                <DetailBox icon={HiOutlineMapPin} label="Residential Address" value={selectedTeacher.address || '—'} />
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Remove Faculty Member"
        message={`Are you sure you want to remove Dr./Prof. ${selectedTeacher?.name} from the school records? This will delete all associated schedules.`}
        type="danger"
      />
    </div>
  );
}

function DetailBox({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
      <div className="w-8 h-8 rounded-lg bg-white shadow-xs border border-gray-200 flex items-center justify-center text-primary-700 flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-gray-800 mt-0.5">{value || '—'}</p>
      </div>
    </div>
  );
}

