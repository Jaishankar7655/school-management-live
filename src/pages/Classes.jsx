import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import {
  HiOutlineBuildingLibrary,
  HiOutlineUser,
  HiOutlineMapPin,
  HiOutlineUserGroup,
  HiOutlineBookOpen,
} from 'react-icons/hi2';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import ConfirmDialog from '../components/ConfirmDialog';
import SearchFilter from '../components/SearchFilter';
import Badge from '../components/Badge';

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const SECTION_OPTIONS = [
  { value: 'A', label: 'Section A' },
  { value: 'B', label: 'Section B' },
  { value: 'C', label: 'Section C' },
  { value: 'D', label: 'Section D' },
];

const INITIAL_FORM = {
  name: '',
  section: 'A',
  classTeacher: '',
  maxStudents: '40',
  room: '',
  subjects: '',
};

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      const response = await api.get(`/classes?${params.toString()}`);
      setClasses(response.data || response.classes || response || []);
    } catch {
      toast.error('Failed to load classes');
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Class name or grade is required';
    if (!formData.classTeacher.trim()) errors.classTeacher = 'Class teacher name is required';
    if (!formData.room.trim()) errors.room = 'Classroom / room number is required';
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

  const handleEdit = (cls) => {
    setFormData({
      name: cls.name || '',
      section: cls.section || 'A',
      classTeacher: cls.classTeacher || '',
      maxStudents: cls.maxStudents ? String(cls.maxStudents) : '40',
      room: cls.room || '',
      subjects: Array.isArray(cls.subjects) ? cls.subjects.join(', ') : cls.subjects || '',
    });
    setFormErrors({});
    setEditingId(cls._id || cls.id);
    setModalOpen(true);
  };

  const handleView = (cls) => {
    setSelectedClass(cls);
    setViewModalOpen(true);
  };

  const handleDeleteClick = (cls) => {
    setSelectedClass(cls);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const payload = {
        ...formData,
        subjects: formData.subjects
          ? formData.subjects.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      };

      if (editingId) {
        await api.put(`/classes/${editingId}`, payload);
        toast.success('Class updated successfully');
      } else {
        await api.post('/classes', payload);
        toast.success('Class created successfully');
      }
      setModalOpen(false);
      fetchClasses();
    } catch (err) {
      toast.error(err?.data?.error || err?.message || 'Failed to save class');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedClass) return;
    try {
      await api.delete(`/classes/${selectedClass._id || selectedClass.id}`);
      toast.success('Class removed successfully');
      setDeleteDialogOpen(false);
      setSelectedClass(null);
      fetchClasses();
    } catch (err) {
      toast.error(err?.data?.error || 'Failed to delete class');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Class & Section',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary-100 text-primary-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
            {row.name ? row.name.replace(/[^0-9]/g, '') || row.name.slice(0, 2) : 'C'}
          </div>
          <div>
            <span className="font-semibold text-gray-900 text-sm">
              {row.name}
            </span>
            <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700">
              Sec {row.section}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'classTeacher',
      label: 'Class Teacher',
      render: (val, row) => (
        <div className="flex items-center gap-2 text-sm text-gray-800">
          <HiOutlineUser className="w-4 h-4 text-gray-400" />
          <span>{row.classTeacher || 'Unassigned'}</span>
        </div>
      ),
    },
    {
      key: 'room',
      label: 'Room',
      render: (val, row) => (
        <span className="inline-flex items-center gap-1 text-sm text-gray-600">
          <HiOutlineMapPin className="w-3.5 h-3.5 text-gray-400" />
          {row.room || '—'}
        </span>
      ),
    },
    {
      key: 'maxStudents',
      label: 'Capacity',
      render: (val, row) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md">
          <HiOutlineUserGroup className="w-3.5 h-3.5 text-gray-400" />
          {row.maxStudents || 40} Seats
        </span>
      ),
    },
    {
      key: 'subjects',
      label: 'Curriculum Subjects',
      render: (val, row) => {
        const list = Array.isArray(row.subjects) ? row.subjects : [];
        if (!list.length) return <span className="text-gray-400 text-xs">No subjects listed</span>;
        return (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {list.slice(0, 3).map((subj, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium bg-primary-50 text-primary-700 px-2 py-0.5 rounded-md"
              >
                {subj}
              </span>
            ))}
            {list.length > 3 && (
              <span className="text-[11px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                +{list.length - 3}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (val, row) => <Badge status={row.status || 'active'} />,
    },
  ];

  const filterConfig = [
    {
      name: 'status',
      label: 'All Status',
      options: STATUS_OPTIONS.filter((s) => s.value !== ''),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Academic Classes</h1>
          <p className="text-sm text-gray-500 mt-1">Manage grade levels, sections, teachers, and classroom allocations</p>
        </div>
      </div>

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        filters={filterConfig}
        onFilterChange={(name, value) => setStatusFilter(value)}
        onAdd={handleAdd}
        addLabel="Add New Class"
      />

      <DataTable
        columns={columns}
        data={classes}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onView={handleView}
        loading={loading}
        emptyMessage="No academic classes registered. Click 'Add New Class' to set up a new section."
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Academic Class' : 'Create Academic Class'}
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Class / Grade Name"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              placeholder="e.g. Class 10"
              required
              error={formErrors.name}
            />
            <FormField
              label="Section"
              type="select"
              name="section"
              value={formData.section}
              onChange={handleFormChange}
              options={SECTION_OPTIONS}
              required
            />
          </div>

          <FormField
            label="Designated Class Teacher"
            name="classTeacher"
            value={formData.classTeacher}
            onChange={handleFormChange}
            placeholder="e.g. Mrs. Anjali Verma"
            required
            error={formErrors.classTeacher}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Assigned Classroom"
              name="room"
              value={formData.room}
              onChange={handleFormChange}
              placeholder="e.g. Room 204 (Wing B)"
              required
              error={formErrors.room}
            />
            <FormField
              label="Maximum Student Capacity"
              type="number"
              name="maxStudents"
              value={formData.maxStudents}
              onChange={handleFormChange}
              placeholder="e.g. 40"
            />
          </div>

          <FormField
            label="Subjects (comma separated)"
            type="textarea"
            name="subjects"
            value={formData.subjects}
            onChange={handleFormChange}
            placeholder="e.g. Mathematics, Science, English, Hindi, Social Science"
            rows={3}
          />
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
            {editingId ? 'Save Changes' : 'Create Class'}
          </button>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Class Information"
        size="md"
      >
        {selectedClass && (
          <div className="space-y-5">
            <div className="p-4 bg-primary-50 rounded-xl flex items-center justify-between border border-primary-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary-700 text-white flex items-center justify-center font-bold text-lg">
                  {selectedClass.name}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-primary-900">
                    {selectedClass.name} - Section {selectedClass.section}
                  </h3>
                  <p className="text-xs text-primary-600 font-medium">Academic Year 2026-2027</p>
                </div>
              </div>
              <Badge status={selectedClass.status || 'active'} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100 text-sm">
                <span className="text-gray-500 font-medium flex items-center gap-2">
                  <HiOutlineUser className="w-4 h-4 text-gray-400" /> Class Incharge
                </span>
                <span className="font-semibold text-gray-900">{selectedClass.classTeacher || 'Unassigned'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 text-sm">
                <span className="text-gray-500 font-medium flex items-center gap-2">
                  <HiOutlineMapPin className="w-4 h-4 text-gray-400" /> Allocated Room
                </span>
                <span className="font-semibold text-gray-900">{selectedClass.room || '—'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 text-sm">
                <span className="text-gray-500 font-medium flex items-center gap-2">
                  <HiOutlineUserGroup className="w-4 h-4 text-gray-400" /> Capacity Limit
                </span>
                <span className="font-semibold text-gray-900">{selectedClass.maxStudents || 40} Students</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <HiOutlineBookOpen className="w-4 h-4" /> Curriculum Subjects
              </p>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(selectedClass.subjects) ? selectedClass.subjects : []).map((s, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold"
                  >
                    {s}
                  </span>
                ))}
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
        title="Delete Class"
        message={`Are you sure you want to delete ${selectedClass?.name} - Section ${selectedClass?.section}? This will de-link enrolled students.`}
        type="danger"
      />
    </div>
  );
}

