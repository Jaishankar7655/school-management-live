import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  HiOutlineBanknotes,
  HiOutlineDocumentText,
  HiOutlinePrinter,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineClock,
  HiOutlineCurrencyRupee,
} from 'react-icons/hi2';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import ConfirmDialog from '../components/ConfirmDialog';
import SearchFilter from '../components/SearchFilter';
import Badge from '../components/Badge';

const FEE_TYPES = [
  { value: 'tuition', label: 'Tuition Fee' },
  { value: 'transport', label: 'Transport / Bus Fee' },
  { value: 'library', label: 'Library Fee' },
  { value: 'lab', label: 'Laboratory Fee' },
  { value: 'exam', label: 'Examination Fee' },
  { value: 'other', label: 'Other Activities' },
];

const STATUS_OPTIONS = [
  { value: 'paid', label: 'Paid in Full' },
  { value: 'pending', label: 'Pending Payment' },
  { value: 'overdue', label: 'Overdue' },
];

const CLASS_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map((c) => ({
  value: c,
  label: `Class ${c}`,
}));

const INITIAL_FORM = {
  studentName: '',
  studentId: '',
  class: '10',
  feeType: 'tuition',
  amount: '',
  paidAmount: '',
  dueDate: format(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
  paidDate: format(new Date(), 'yyyy-MM-dd'),
};

export default function Fees() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ feeType: '', status: '' });

  const [modalOpen, setModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [selectedFee, setSelectedFee] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchFees = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filters.feeType) params.append('feeType', filters.feeType);
      if (filters.status) params.append('status', filters.status);
      const response = await api.get(`/fees?${params.toString()}`);
      setFees(response.data || response.fees || response || []);
    } catch {
      toast.error('Failed to load fee records');
      setFees([]);
    } finally {
      setLoading(false);
    }
  }, [search, filters]);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  const validateForm = () => {
    const errors = {};
    if (!formData.studentName.trim()) errors.studentName = 'Student name is required';
    if (!formData.amount || Number(formData.amount) <= 0) {
      errors.amount = 'Valid amount is required';
    }
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

  const handleEdit = (fee) => {
    setFormData({
      studentName: fee.studentName || '',
      studentId: fee.studentId || '',
      class: fee.class || '10',
      feeType: fee.feeType || 'tuition',
      amount: fee.amount ? String(fee.amount) : '',
      paidAmount: fee.paidAmount ? String(fee.paidAmount) : '',
      dueDate: fee.dueDate ? fee.dueDate.substring(0, 10) : '',
      paidDate: fee.paidDate ? fee.paidDate.substring(0, 10) : '',
    });
    setFormErrors({});
    setEditingId(fee._id || fee.id);
    setModalOpen(true);
  };

  const handleViewReceipt = (fee) => {
    setSelectedFee(fee);
    setReceiptModalOpen(true);
  };

  const handleDeleteClick = (fee) => {
    setSelectedFee(fee);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const payload = {
        ...formData,
        studentId: formData.studentId || `STD-${Math.floor(1000 + Math.random() * 9000)}`,
        amount: Number(formData.amount),
        paidAmount: formData.paidAmount ? Number(formData.paidAmount) : 0,
      };

      if (editingId) {
        await api.put(`/fees/${editingId}`, payload);
        toast.success('Fee record updated successfully');
      } else {
        await api.post('/fees', payload);
        toast.success('Fee record added successfully');
      }
      setModalOpen(false);
      fetchFees();
    } catch (err) {
      toast.error(err?.data?.error || err?.message || 'Failed to save fee record');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedFee) return;
    try {
      await api.delete(`/fees/${selectedFee._id || selectedFee.id}`);
      toast.success('Fee record deleted');
      setDeleteDialogOpen(false);
      setSelectedFee(null);
      fetchFees();
    } catch (err) {
      toast.error(err?.data?.error || 'Failed to delete fee record');
    }
  };

  // Metrics
  const totalCollected = fees.reduce((acc, curr) => acc + (Number(curr.paidAmount) || 0), 0);
  const totalDue = fees.reduce((acc, curr) => {
    const total = Number(curr.amount) || 0;
    const paid = Number(curr.paidAmount) || 0;
    return acc + Math.max(0, total - paid);
  }, 0);
  const overdueCount = fees.filter((f) => f.status === 'overdue').length;

  const columns = [
    {
      key: 'receiptNumber',
      label: 'Receipt #',
      render: (val, row) => (
        <span className="font-mono text-xs font-semibold text-primary-700 bg-primary-50 px-2.5 py-1 rounded border border-primary-100">
          {row.receiptNumber || '—'}
        </span>
      ),
    },
    {
      key: 'studentName',
      label: 'Student',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-gray-900 text-sm">{row.studentName}</div>
          <div className="text-xs text-gray-500">Class {row.class || '—'}</div>
        </div>
      ),
    },
    {
      key: 'feeType',
      label: 'Fee Type',
      render: (val, row) => {
        const found = FEE_TYPES.find((t) => t.value === row.feeType);
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {found ? found.label : row.feeType}
          </span>
        );
      },
    },
    {
      key: 'amount',
      label: 'Total Fee',
      render: (val, row) => (
        <span className="font-semibold text-sm text-gray-900">
          ₹{Number(row.amount || 0).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'paidAmount',
      label: 'Paid Amount',
      render: (val, row) => (
        <span className="font-semibold text-sm text-emerald-600">
          ₹{Number(row.paidAmount || 0).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (val, row) => (
        <span className="text-xs text-gray-500">
          {row.dueDate ? format(new Date(row.dueDate), 'MMM dd, yyyy') : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val, row) => <Badge status={row.status || 'pending'} />,
    },
  ];

  const filterConfig = [
    {
      name: 'feeType',
      label: 'All Fee Types',
      options: FEE_TYPES,
    },
    {
      name: 'status',
      label: 'All Statuses',
      options: STATUS_OPTIONS,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Fee Management & Billing</h1>
          <p className="text-sm text-gray-500 mt-1">Track payments, issue receipts, and manage student fee schedules</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <HiOutlineCheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Fees Collected</p>
            <p className="text-2xl font-bold text-emerald-700 mt-0.5">
              ₹{totalCollected.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <HiOutlineClock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pending Dues</p>
            <p className="text-2xl font-bold text-amber-700 mt-0.5">
              ₹{totalDue.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
            <HiOutlineExclamationCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Overdue Invoices</p>
            <p className="text-2xl font-bold text-red-700 mt-0.5">{overdueCount} Accounts</p>
          </div>
        </div>
      </div>

      {/* Filters and Table */}
      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        filters={filterConfig}
        onFilterChange={(name, value) => setFilters((prev) => ({ ...prev, [name]: value }))}
        onAdd={handleAdd}
        addLabel="Record Fee Invoice"
      />

      <DataTable
        columns={columns}
        data={fees}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onView={handleViewReceipt}
        loading={loading}
        emptyMessage="No fee records found. Click 'Record Fee Invoice' to log a new fee entry."
      />

      {/* Add / Edit Invoice Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Fee Details' : 'Record Student Fee Payment'}
        size="md"
      >
        <div className="space-y-4">
          <FormField
            label="Student Full Name"
            name="studentName"
            value={formData.studentName}
            onChange={handleFormChange}
            placeholder="e.g. Aryan Malhotra"
            required
            error={formErrors.studentName}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Student ID / Roll No"
              name="studentId"
              value={formData.studentId}
              onChange={handleFormChange}
              placeholder="e.g. 1045"
            />
            <FormField
              label="Class"
              type="select"
              name="class"
              value={formData.class}
              onChange={handleFormChange}
              options={CLASS_OPTIONS}
            />
          </div>

          <FormField
            label="Fee Category"
            type="select"
            name="feeType"
            value={formData.feeType}
            onChange={handleFormChange}
            options={FEE_TYPES}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Total Fee Amount (₹)"
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleFormChange}
              placeholder="e.g. 15000"
              required
              error={formErrors.amount}
            />
            <FormField
              label="Amount Paid (₹)"
              type="number"
              name="paidAmount"
              value={formData.paidAmount}
              onChange={handleFormChange}
              placeholder="e.g. 15000"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Due Date"
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleFormChange}
            />
            <FormField
              label="Payment Date"
              type="date"
              name="paidDate"
              value={formData.paidDate}
              onChange={handleFormChange}
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
            {editingId ? 'Update Record' : 'Record Payment'}
          </button>
        </div>
      </Modal>

      {/* Official Receipt Modal */}
      <Modal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        title="Fee Payment Receipt"
        size="md"
      >
        {selectedFee && (
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-r from-primary-800 to-primary-900 text-white rounded-xl relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold tracking-tight">EduManager School</h3>
                  <p className="text-xs text-primary-200 mt-1">Official Fee Receipt</p>
                </div>
                <Badge status={selectedFee.status || 'paid'} />
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-xs text-primary-200">
                <span>Receipt: <strong className="text-white font-mono">{selectedFee.receiptNumber}</strong></span>
                <span>Date: {selectedFee.paidDate ? format(new Date(selectedFee.paidDate), 'dd MMM yyyy') : '—'}</span>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Student Name</span>
                <span className="font-semibold text-gray-900">{selectedFee.studentName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Student ID / Class</span>
                <span className="font-semibold text-gray-900">
                  {selectedFee.studentId} (Class {selectedFee.class})
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Fee Category</span>
                <span className="font-semibold text-primary-800 capitalize">{selectedFee.feeType}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Total Billed</span>
                <span className="font-bold text-gray-900">₹{Number(selectedFee.amount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Amount Paid</span>
                <span className="font-bold text-emerald-600">₹{Number(selectedFee.paidAmount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 bg-gray-50 p-2 rounded-lg">
                <span className="font-semibold text-gray-700">Balance Remaining</span>
                <span className="font-bold text-red-600">
                  ₹{Math.max(0, Number(selectedFee.amount) - Number(selectedFee.paidAmount || 0)).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 text-sm font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg flex items-center gap-2 transition-colors"
              >
                <HiOutlinePrinter className="w-4 h-4" />
                Print Receipt
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Fee Record"
        message={`Are you sure you want to permanently delete receipt "${selectedFee?.receiptNumber}" for ${selectedFee?.studentName}?`}
        type="danger"
      />
    </div>
  );
}

