import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  HiOutlineUserGroup,
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlineMapPin,
  HiOutlineCalendarDays,
  HiOutlineIdentification,
} from 'react-icons/hi2';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import ConfirmDialog from '../components/ConfirmDialog';
import SearchFilter from '../components/SearchFilter';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const CLASS_OPTIONS = [
  { value: '', label: 'All Classes' },
  { value: '1', label: 'Class 1' },
  { value: '2', label: 'Class 2' },
  { value: '3', label: 'Class 3' },
  { value: '4', label: 'Class 4' },
  { value: '5', label: 'Class 5' },
  { value: '6', label: 'Class 6' },
  { value: '7', label: 'Class 7' },
  { value: '8', label: 'Class 8' },
  { value: '9', label: 'Class 9' },
  { value: '10', label: 'Class 10' },
  { value: '11', label: 'Class 11' },
  { value: '12', label: 'Class 12' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'graduated', label: 'Graduated' },
];

const GENDER_OPTIONS = [
  { value: '', label: 'Select Gender' },
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
];

const SECTION_OPTIONS = [
  { value: '', label: 'Select Section' },
  { value: 'A', label: 'Section A' },
  { value: 'B', label: 'Section B' },
  { value: 'C', label: 'Section C' },
  { value: 'D', label: 'Section D' },
];

const INITIAL_FORM = {
  name: '',
  email: '',
  phone: '',
  class: '',
  section: '',
  rollNumber: '',
  parentName: '',
  parentPhone: '',
  address: '',
  dateOfBirth: '',
  gender: '',
  admissionDate: '',
};

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ class: '', status: '' });

  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filters.class) params.append('class', filters.class);
      if (filters.status) params.append('status', filters.status);
      const response = await api.get(`/api/students?${params.toString()}`);
      setStudents(response.data?.students || response.data || []);
    } catch {
      toast.error('Failed to fetch students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [search, filters]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Student name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.class) errors.class = 'Class is required';
    if (!formData.section) errors.section = 'Section is required';
    if (!formData.rollNumber.trim()) errors.rollNumber = 'Roll number is required';
    if (!formData.parentName.trim()) errors.parentName = 'Parent name is required';
    if (!formData.parentPhone.trim()) errors.parentPhone = 'Parent phone is required';
    if (!formData.gender) errors.gender = 'Gender is required';
    if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
    if (!formData.admissionDate) errors.admissionDate = 'Admission date is required';
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

  const handleEdit = (student) => {
    setFormData({
      name: student.name || '',
      email: student.email || '',
      phone: student.phone || '',
      class: student.class || '',
      section: student.section || '',
      rollNumber: student.rollNumber || '',
      parentName: student.parentName || '',
      parentPhone: student.parentPhone || '',
      address: student.address || '',
      dateOfBirth: student.dateOfBirth ? student.dateOfBirth.substring(0, 10) : '',
      gender: student.gender || '',
      admissionDate: student.admissionDate ? student.admissionDate.substring(0, 10) : '',
    });
    setFormErrors({});
    setEditingId(student._id || student.id);
    setModalOpen(true);
  };

  const handleView = (student) => {
    setSelectedStudent(student);
    setViewModalOpen(true);
  };

  const handleDeleteClick = (student) => {
    setSelectedStudent(student);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/api/students/${editingId}`, formData);
        toast.success('Student updated successfully');
      } else {
        await api.post('/api/students', formData);
        toast.success('Student added successfully');
      }
      setModalOpen(false);
      fetchStudents();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save student');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStudent) return;
    try {
      await api.delete(`/api/students/${selectedStudent._id || selectedStudent.id}`);
      toast.success('Student deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedStudent(null);
      fetchStudents();
    } catch {
      toast.error('Failed to delete student');
    }
  };

  const columns = [
    {
      key: 'rollNumber',
      label: 'Roll No',
      render: (row) => (
        <span className="font-mono text-sm font-medium text-primary-700">{row.rollNumber}</span>
      ),
    },
    {
      key: 'name',
      label: 'Name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-semibold">
            {row.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{row.name}</p>
            <p className="text-xs text-gray-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'class',
      label: 'Class',
      render: (row) => (
        <span className="text-sm text-gray-700">Class {row.class}</span>
      ),
    },
    {
      key: 'section',
      label: 'Section',
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary-50 text-primary-700 text-xs font-medium">
          {row.section}
        </span>
      ),
    },
    {
      key: 'parentName',
      label: 'Parent Name',
      render: (row) => <span className="text-sm text-gray-700">{row.parentName}</span>,
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (row) => <span className="text-sm text-gray-600">{row.phone}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge status={row.status || 'active'} />,
    },
  ];

  const filterConfig = [
    {
      key: 'class',
      label: 'Class',
      options: CLASS_OPTIONS,
    },
    {
      key: 'status',
      label: 'Status',
      options: STATUS_OPTIONS,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary-900">Students</h1>
        <p className="text-sm text-gray-500 mt-1">Manage student records and information</p>
      </div>

      {/* Search & Filter Bar */}
      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        filters={filterConfig}
        onFilterChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
        onAdd={handleAdd}
        addLabel="Add Student"
      />

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={students}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onView={handleView}
        loading={loading}
        emptyMessage="No students found. Click 'Add Student' to create a new record."
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Student' : 'Add New Student'}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleFormChange}
            placeholder="Enter student name"
            required
            error={formErrors.name}
          />
          <FormField
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleFormChange}
            placeholder="student@email.com"
            required
            error={formErrors.email}
          />
          <FormField
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleFormChange}
            placeholder="Phone number"
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
            label="Class"
            type="select"
            name="class"
            value={formData.class}
            onChange={handleFormChange}
            options={CLASS_OPTIONS.map((o) => (o.value === '' ? { value: '', label: 'Select Class' } : o))}
            required
            error={formErrors.class}
          />
          <FormField
            label="Section"
            type="select"
            name="section"
            value={formData.section}
            onChange={handleFormChange}
            options={SECTION_OPTIONS}
            required
            error={formErrors.section}
          />
          <FormField
            label="Roll Number"
            name="rollNumber"
            value={formData.rollNumber}
            onChange={handleFormChange}
            placeholder="e.g. 1001"
            required
            error={formErrors.rollNumber}
          />
          <FormField
            label="Date of Birth"
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleFormChange}
            required
            error={formErrors.dateOfBirth}
          />
          <FormField
            label="Admission Date"
            type="date"
            name="admissionDate"
            value={formData.admissionDate}
            onChange={handleFormChange}
            required
            error={formErrors.admissionDate}
          />
          <FormField
            label="Parent Name"
            name="parentName"
            value={formData.parentName}
            onChange={handleFormChange}
            placeholder="Parent/Guardian name"
            required
            error={formErrors.parentName}
          />
          <FormField
            label="Parent Phone"
            name="parentPhone"
            value={formData.parentPhone}
            onChange={handleFormChange}
            placeholder="Parent phone number"
            required
            error={formErrors.parentPhone}
          />
          <div className="md:col-span-2">
            <FormField
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleFormChange}
              placeholder="Full address"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setModalOpen(false)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </span>
            ) : editingId ? 'Update Student' : 'Add Student'}
          </button>
        </div>
      </Modal>

      {/* View Detail Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Student Details"
        size="lg"
      >
        {selectedStudent && (
          <div className="space-y-6">
            {/* Student Header */}
            <div className="flex items-center gap-4 p-4 bg-primary-50 rounded-xl">
              <div className="w-14 h-14 rounded-full bg-primary-600 text-white flex items-center justify-center text-xl font-bold">
                {selectedStudent.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary-900">{selectedStudent.name}</h3>
                <p className="text-sm text-gray-500">
                  Class {selectedStudent.class} - Section {selectedStudent.section} | Roll #{selectedStudent.rollNumber}
                </p>
              </div>
              <div className="ml-auto">
                <Badge status={selectedStudent.status || 'active'} />
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem icon={HiOutlineEnvelope} label="Email" value={selectedStudent.email} />
              <DetailItem icon={HiOutlinePhone} label="Phone" value={selectedStudent.phone} />
              <DetailItem icon={HiOutlineIdentification} label="Gender" value={selectedStudent.gender} />
              <DetailItem
                icon={HiOutlineCalendarDays}
                label="Date of Birth"
                value={selectedStudent.dateOfBirth ? format(new Date(selectedStudent.dateOfBirth), 'MMM dd, yyyy') : '—'}
              />
              <DetailItem
                icon={HiOutlineCalendarDays}
                label="Admission Date"
                value={selectedStudent.admissionDate ? format(new Date(selectedStudent.admissionDate), 'MMM dd, yyyy') : '—'}
              />
              <DetailItem icon={HiOutlineUserGroup} label="Parent Name" value={selectedStudent.parentName} />
              <DetailItem icon={HiOutlinePhone} label="Parent Phone" value={selectedStudent.parentPhone} />
              <DetailItem icon={HiOutlineMapPin} label="Address" value={selectedStudent.address || '—'} />
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Student"
        message={`Are you sure you want to delete "${selectedStudent?.name}"? This action cannot be undone.`}
        type="danger"
      />
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
      <Icon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm text-gray-900 mt-0.5">{value || '—'}</p>
      </div>
    </div>
  );
}
