import React, { useState, useMemo } from 'react';
import './JobResultsTable.css';

const JobResultsTable = ({ jobs = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [siteFilter, setSiteFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State for inspecting long text (e.g. description)
  const [modalData, setModalData] = useState(null);

  // DYNAMICALLY EXTRACT ALL COLUMNS PRESENT IN THE DATASET
  const columns = useMemo(() => {
    if (!jobs || jobs.length === 0) return [];
    const keySet = new Set();
    jobs.forEach((job) => {
      if (job && typeof job === 'object') {
        Object.keys(job).forEach((k) => keySet.add(k));
      }
    });
    return Array.from(keySet);
  }, [jobs]);

  // Extract unique platforms for site dropdown filter
  const availableSites = useMemo(() => {
    const sites = new Set();
    jobs.forEach((j) => {
      if (j && j.site) {
        sites.add(String(j.site).toLowerCase().trim());
      }
    });
    return Array.from(sites);
  }, [jobs]);

  // DYNAMIC SEARCH FILTERING ACROSS ALL DATA FIELDS
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (!job) return false;

      // Platform filter check
      const site = String(job.site || '').toLowerCase().trim();
      if (siteFilter !== 'all' && site !== siteFilter) {
        return false;
      }

      // Search term check across all object values
      if (!searchTerm.trim()) return true;
      const query = searchTerm.toLowerCase().trim();

      return Object.values(job).some((val) => {
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(query);
      });
    });
  }, [jobs, searchTerm, siteFilter]);

  // Reset to page 1 whenever filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, siteFilter, pageSize]);

  // Paginated Slice
  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize));
  const paginatedJobs = useMemo(() => {
    if (pageSize === 0) return filteredJobs; // 0 means 'All'
    const startIdx = (currentPage - 1) * pageSize;
    return filteredJobs.slice(startIdx, startIdx + pageSize);
  }, [filteredJobs, currentPage, pageSize]);

  // DYNAMIC BROWSER CSV EXPORT (EXACTLY MATCHING DATASET COLUMNS)
  const handleExportCsv = () => {
    if (!filteredJobs || filteredJobs.length === 0) return;

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      let str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const header = columns.map((col) => `"${col}"`).join(',');
    const rows = filteredJobs.map((job) =>
      columns.map((col) => escapeCsv(job[col])).join(',')
    );

    const csvData = [header, ...rows].join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scraped_jobs_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Helper to format header text (e.g., "searched_role" -> "Searched Role")
  const formatHeaderLabel = (col) => {
    if (!col) return '';
    return col
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Dynamic Cell Renderer
  const renderCellContent = (col, val, job) => {
    if (val === null || val === undefined || val === '') {
      return <span className="empty-val">-</span>;
    }

    // Boolean formatting
    if (typeof val === 'boolean') {
      return (
        <span className={`badge-bool ${val ? 'bool-true' : 'bool-false'}`}>
          {val ? 'True' : 'False'}
        </span>
      );
    }

    const strVal = String(val).trim();

    // URL formatting
    if (
      strVal.startsWith('http://') ||
      strVal.startsWith('https://') ||
      col.toLowerCase().includes('url')
    ) {
      return (
        <a
          href={strVal}
          target="_blank"
          rel="noopener noreferrer"
          className="link-btn"
          title={strVal}
        >
          View Link ↗
        </a>
      );
    }

    // Site Badge
    if (col === 'site') {
      const siteClass = strVal.toLowerCase();
      return (
        <span className={`site-badge site-${siteClass}`}>
          {strVal.toUpperCase()}
        </span>
      );
    }

    // Long Text / Description formatting
    if (strVal.length > 50) {
      return (
        <div className="long-text-cell">
          <span className="truncated-text">{strVal.slice(0, 50)}...</span>
          <button
            type="button"
            className="btn-read-more"
            onClick={() => setModalData({ title: formatHeaderLabel(col), content: strVal, job })}
          >
            Read More
          </button>
        </div>
      );
    }

    return <span>{strVal}</span>;
  };

  if (!jobs || jobs.length === 0) {
    return null;
  }

  return (
    <div className="job-results-container">
      {/* Table Header Controls */}
      <div className="results-header">
        <div className="header-info">
          <h2>
            <span className="icon">📊</span> Scraped Job Results (Dynamic Server CSV View)
          </h2>
          <span className="results-badge">
            Showing {filteredJobs.length} of {jobs.length} Jobs ({columns.length} Columns)
          </span>
        </div>

        <div className="results-actions">
          <button
            type="button"
            className="btn btn-export"
            onClick={handleExportCsv}
            title="Export CSV matching dataset schema"
          >
            <span className="icon">📥</span> Export CSV (Browser)
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="results-filter-bar">
        <div className="job-tbl-search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="job-tbl-search-input"
            placeholder={`Search across all ${columns.length} columns...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="clear-btn"
              onClick={() => setSearchTerm('')}
            >
              ✕
            </button>
          )}
        </div>

        {availableSites.length > 0 && (
          <div className="platform-filter">
            <label htmlFor="site-filter">Platform:</label>
            <select
              id="site-filter"
              className="platform-select"
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
            >
              <option value="all">All Sites ({jobs.length})</option>
              {availableSites.map((site) => (
                <option key={site} value={site}>
                  {site.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* DYNAMICALLY GENERATED TABLE FROM SERVER DATA */}
      <div className="table-responsive">
        <table className="jobs-table dynamic-table">
          <thead>
            <tr>
              <th className="col-index sticky-header">#</th>
              {columns.map((col) => (
                <th key={col} className="dynamic-th">
                  {formatHeaderLabel(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedJobs.length > 0 ? (
              paginatedJobs.map((job, rowIdx) => {
                const globalIdx = (currentPage - 1) * (pageSize || 1) + rowIdx + 1;
                return (
                  <tr key={`row_${rowIdx}`}>
                    <td className="col-index sticky-cell">{globalIdx}</td>
                    {columns.map((col) => (
                      <td key={`${rowIdx}_${col}`} className={`col-${col}`}>
                        {renderCellContent(col, job[col], job)}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="empty-row">
                  No matching data found for "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filteredJobs.length > 0 && (
        <div className="pagination-footer">
          <div className="page-size-selector">
            <label htmlFor="page-size-select">Per page:</label>
            <select
              id="page-size-select"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={0}>All ({filteredJobs.length})</option>
            </select>
          </div>

          {pageSize > 0 && totalPages > 1 && (
            <div className="pagination-controls">
              <button
                type="button"
                className="btn-page"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                ◀ Prev
              </button>
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                className="btn-page"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next ▶
              </button>
            </div>
          )}
        </div>
      )}

      {/* Full Text / Long Content Inspector Modal */}
      {modalData && (
        <div className="modal-backdrop" onClick={() => setModalData(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📖 {modalData.title}</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setModalData(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              {modalData.job && (
                <div className="modal-job-summary">
                  <strong>{modalData.job.title || 'Job'}</strong> at {modalData.job.company || 'Company'} ({modalData.job.location || 'Location'})
                </div>
              )}
              <div className="modal-full-text">
                {modalData.content}
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setModalData(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobResultsTable;
