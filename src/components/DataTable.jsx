import React, { useState, useMemo } from 'react';
import {
  HiOutlineEye,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi2';
import EmptyState from './EmptyState';

const ROWS_OPTIONS = [10, 25, 50];

/* ---------- skeleton shimmer ---------- */
const shimmerKeyframes = `@keyframes eduShimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}`;
const shimmerStyle = {
  height: 14,
  borderRadius: 4,
  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
  backgroundSize: '800px 100%',
  animation: 'eduShimmer 1.5s infinite linear',
};

export default function DataTable({
  columns = [],
  data = [],
  onEdit,
  onDelete,
  onView,
  loading = false,
  emptyMessage = 'No records found',
}) {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));
  const safeCurrentPage = Math.min(page, totalPages);

  const pageData = useMemo(
    () => data.slice((safeCurrentPage - 1) * rowsPerPage, safeCurrentPage * rowsPerPage),
    [data, safeCurrentPage, rowsPerPage],
  );

  const hasActions = onView || onEdit || onDelete;

  /* ---- loading skeleton ---- */
  if (loading) {
    return (
      <div style={{ backgroundColor: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <style>{shimmerKeyframes}</style>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    padding: '14px 16px',
                    textAlign: 'left',
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '.05em',
                    color: '#6b7280',
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: '#fafafa',
                  }}
                >
                  {col.label}
                </th>
              ))}
              {hasActions && (
                <th
                  style={{
                    padding: '14px 16px',
                    textAlign: 'right',
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '.05em',
                    color: '#6b7280',
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: '#fafafa',
                    width: 140,
                  }}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key} style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ ...shimmerStyle, width: `${50 + Math.random() * 40}%` }} />
                  </td>
                ))}
                {hasActions && (
                  <td style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ ...shimmerStyle, width: 80, marginLeft: 'auto' }} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  /* ---- empty state ---- */
  if (!data.length) {
    return (
      <div style={{ backgroundColor: '#fff', borderRadius: 10, border: '1px solid #e5e7eb' }}>
        <EmptyState title={emptyMessage} message="Try adjusting your search or filters." />
      </div>
    );
  }

  /* ---- pagination helpers ---- */
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, safeCurrentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          style={{
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: i === safeCurrentPage ? 700 : 500,
            color: i === safeCurrentPage ? '#fff' : '#374151',
            backgroundColor: i === safeCurrentPage ? '#1B2A4A' : 'transparent',
            border: i === safeCurrentPage ? 'none' : '1px solid #d1d5db',
            borderRadius: 6,
            cursor: 'pointer',
            transition: 'all .15s',
          }}
        >
          {i}
        </button>,
      );
    }
    return pages;
  };

  /* ---- action button ---- */
  const ActionBtn = ({ onClick, icon: Icon, title, hoverBg }) => (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        border: 'none',
        background: 'none',
        borderRadius: 6,
        cursor: 'pointer',
        color: '#6b7280',
        transition: 'all .15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = hoverBg || '#f3f4f6';
        e.currentTarget.style.color = '#1B2A4A';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = '#6b7280';
      }}
    >
      <Icon size={17} />
    </button>
  );

  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: 10,
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    padding: '14px 16px',
                    textAlign: 'left',
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '.05em',
                    color: '#6b7280',
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: '#fafafa',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.label}
                </th>
              ))}
              {hasActions && (
                <th
                  style={{
                    padding: '14px 16px',
                    textAlign: 'right',
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '.05em',
                    color: '#6b7280',
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: '#fafafa',
                    width: 140,
                  }}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {pageData.map((row, idx) => (
              <tr
                key={row._id || row.id || idx}
                style={{
                  backgroundColor: idx % 2 === 1 ? '#fafafa' : '#fff',
                  transition: 'background .1s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f6f8')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = idx % 2 === 1 ? '#fafafa' : '#fff')}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: '12px 16px',
                      fontSize: 13,
                      color: '#1B2A4A',
                      borderBottom: '1px solid #f3f4f6',
                    }}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
                {hasActions && (
                  <td
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #f3f4f6',
                      textAlign: 'right',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {onView && <ActionBtn onClick={() => onView(row)} icon={HiOutlineEye} title="View" />}
                    {onEdit && <ActionBtn onClick={() => onEdit(row)} icon={HiOutlinePencilSquare} title="Edit" />}
                    {onDelete && (
                      <ActionBtn
                        onClick={() => onDelete(row)}
                        icon={HiOutlineTrash}
                        title="Delete"
                        hoverBg="#fef2f2"
                      />
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderTop: '1px solid #e5e7eb',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        {/* Rows per page */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6b7280' }}>
          <span>Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(1);
            }}
            style={{
              padding: '4px 8px',
              fontSize: 13,
              border: '1px solid #d1d5db',
              borderRadius: 4,
              outline: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {ROWS_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span style={{ marginLeft: 8 }}>
            {(safeCurrentPage - 1) * rowsPerPage + 1}–
            {Math.min(safeCurrentPage * rowsPerPage, data.length)} of {data.length}
          </span>
        </div>

        {/* Page controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safeCurrentPage === 1}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              border: '1px solid #d1d5db',
              background: '#fff',
              borderRadius: 6,
              cursor: safeCurrentPage === 1 ? 'default' : 'pointer',
              opacity: safeCurrentPage === 1 ? 0.4 : 1,
              color: '#374151',
            }}
          >
            <HiOutlineChevronLeft size={15} />
          </button>

          {renderPageNumbers()}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safeCurrentPage === totalPages}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              border: '1px solid #d1d5db',
              background: '#fff',
              borderRadius: 6,
              cursor: safeCurrentPage === totalPages ? 'default' : 'pointer',
              opacity: safeCurrentPage === totalPages ? 0.4 : 1,
              color: '#374151',
            }}
          >
            <HiOutlineChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
