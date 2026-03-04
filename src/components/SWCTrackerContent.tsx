'use client';

import { Button } from '@/components/ui/button';
import { StudentData } from '@/utils/functions/googleSheets';
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Loader2,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface SWCTrackerContentProps {
  students: StudentData[];
}

export default function SWCTrackerContent({
  students,
}: SWCTrackerContentProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');

  // Sync state
  const [syncing, setSyncing] = useState(false);
  const [newStudents, setNewStudents] = useState<StudentData[]>([]);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [inserting, setInserting] = useState(false);

  const itemsPerPage = 50;

  // Helper to extract year from roll number (first 4 digits found)
  const getYearFromRoll = (roll: string) => {
    const match = roll.match(/20\d{2}/);
    return match ? match[0] : 'Unknown';
  };

  // Filter Logic
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      searchQuery === '' ||
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.mobile.includes(searchQuery);

    const matchesDept =
      selectedDept === 'All' || student.department === selectedDept;

    const year = getYearFromRoll(student.rollNumber);
    const matchesYear = selectedYear === 'All' || year === selectedYear;

    return matchesSearch && matchesDept && matchesYear;
  });

  const totalItems = filteredStudents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Reset page when filters change
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Extract unique values for dropdowns
  const departments = [
    'All',
    ...Array.from(new Set(students.map((s) => s.department))).sort(),
  ];
  const years = [
    'All',
    ...Array.from(new Set(students.map((s) => getYearFromRoll(s.rollNumber))))
      .filter((y) => y !== 'Unknown')
      .sort(),
  ];

  const downloadCSV = () => {
    if (students.length === 0) {
      toast.error('No students data to download');
      return;
    }

    const headers = ['roll', 'email', 'name', 'phone'];
    const csvContent = [
      headers.join(','),
      ...students.map((s) => {
        const escapeCSV = (str: string) => `"${str.replace(/"/g, '""')}"`;
        return [
          s.rollNumber || '',
          s.collegeEmail || s.personalEmail || '',
          escapeCSV(s.name || ''),
          s.mobile || '',
        ].join(',');
      }),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'swc_funds_tracker.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Sync – fetch new entries not yet in SWC-2026 table
  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/swc/sync-check');
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const found: StudentData[] = data.newStudents ?? [];
      if (found.length === 0) {
        toast.success('Database is up to date – no new entries found.');
      } else {
        setNewStudents(found);
        setShowSyncModal(true);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to check for new entries. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  // Insert new students into SWC-2026
  const handleInsert = async () => {
    setInserting(true);
    try {
      const res = await fetch('/api/swc/sync-insert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: newStudents }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      toast.success(`${data.inserted} new record(s) added to the database.`);
      setShowSyncModal(false);
      setNewStudents([]);
    } catch (err) {
      console.error(err);
      toast.error('Failed to insert data. Please try again.');
    } finally {
      setInserting(false);
    }
  };

  const handleIgnore = () => {
    setShowSyncModal(false);
    setNewStudents([]);
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search Bar */}
          <div className="md:col-span-5 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by Name, Roll No, or Mobile..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Department Dropdown */}
          <div className="md:col-span-2">
            <select
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all appearance-none cursor-pointer"
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setCurrentPage(1);
              }}
              style={{ backgroundImage: 'none' }}
            >
              {departments.map((dept) => (
                <option
                  key={dept}
                  value={dept}
                  className="bg-[#0f0f13] text-white"
                >
                  {dept === 'All' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>

          {/* Year Dropdown */}
          <div className="md:col-span-2">
            <select
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all appearance-none cursor-pointer"
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setCurrentPage(1);
              }}
            >
              {years.map((year) => (
                <option
                  key={year}
                  value={year}
                  className="bg-[#0f0f13] text-white"
                >
                  {year === 'All' ? 'All Years' : year}
                </option>
              ))}
            </select>
          </div>

          {/* Sync Button */}
          <div className="md:col-span-1 flex">
            <Button
              onClick={handleSync}
              disabled={syncing}
              variant="outline"
              className="bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border-violet-500/30 w-full h-full min-h-[42px]"
              title="Check for new entries from sheets"
            >
              {syncing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Download CSV Button */}
          <div className="md:col-span-2 flex">
            <Button
              onClick={downloadCSV}
              variant="outline"
              className="bg-zinc-800 hover:bg-zinc-700 text-white border-white/10 w-full h-full min-h-[42px]"
            >
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
          </div>
        </div>

        {/* Syncing overlay hint */}
        {syncing && (
          <div className="flex items-center gap-2 text-sm text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-xl px-4 py-3">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>
              Fetching latest data from all sheets — this may take a moment&hellip;
            </span>
          </div>
        )}

        {/* Table Container - Grid */}
        <div className="w-full bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-violet-500/10 flex flex-col">
          {/* Header Row */}
          <div className="hidden md:grid grid-cols-5 gap-4 p-4 border-b border-white/10 bg-white/5 text-sm font-semibold text-gray-300">
            <div>Name</div>
            <div>Department</div>
            <div>Roll Number</div>
            <div>Mobile</div>
            <div>Status</div>
          </div>

          {/* Data Rows */}
          <div className="divide-y divide-white/5">
            {currentStudents.length > 0 ? (
              currentStudents.map((student, index) => (
                <div
                  key={`${student.rollNumber}-${index}`}
                  className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-4 p-4 hover:bg-white/[0.02] transition-colors group"
                >
                  {/* Mobile Labels included for responsiveness */}
                  <div className="flex flex-col md:block">
                    <span className="md:hidden text-xs text-gray-500 mb-1">
                      Name
                    </span>
                    <span className="text-sm font-medium text-white">
                      {student.name}
                    </span>
                  </div>
                  <div className="flex flex-col md:block">
                    <span className="md:hidden text-xs text-gray-500 mb-1">
                      Department
                    </span>
                    <span className="text-sm text-gray-400">
                      {student.department || '—'}
                    </span>
                  </div>
                  <div className="flex flex-col md:block">
                    <span className="md:hidden text-xs text-gray-500 mb-1">
                      Roll Number
                    </span>
                    <span className="text-sm font-mono text-violet-300">
                      {student.rollNumber}
                    </span>
                  </div>
                  <div className="flex flex-col md:block">
                    <span className="md:hidden text-xs text-gray-500 mb-1">
                      Mobile
                    </span>
                    <span className="text-sm text-gray-400">
                      {student.mobile || '—'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      Paid
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-gray-500">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                    <Search className="w-6 h-6 opacity-40" />
                  </div>
                  <p>No results found matching your criteria.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-2">
            <div className="text-sm text-gray-400">
              Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of{' '}
              {totalItems} entries
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className={`p-2 rounded-lg border border-white/10 transition-colors ${currentPage > 1
                    ? 'bg-white/5 hover:bg-white/10 text-white cursor-pointer'
                    : 'bg-white/5 text-gray-600 cursor-not-allowed'
                  }`}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                <span className="px-4 py-2 rounded-lg bg-violet-600/20 border border-violet-600/30 text-violet-300 font-medium select-none">
                  Page {currentPage} of {totalPages}
                </span>
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className={`p-2 rounded-lg border border-white/10 transition-colors ${currentPage < totalPages
                    ? 'bg-white/5 hover:bg-white/10 text-white cursor-pointer'
                    : 'bg-white/5 text-gray-600 cursor-not-allowed'
                  }`}
              >
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Sync Modal ── */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleIgnore}
          />

          {/* Modal Panel */}
          <div className="relative z-10 w-full max-w-2xl bg-[#0f0f18] border border-white/10 rounded-2xl shadow-2xl shadow-violet-500/20 flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-white">
                  New Entries Detected
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  {newStudents.length} record
                  {newStudents.length !== 1 ? 's' : ''} found in sheets but not
                  yet in the database
                </p>
              </div>
              <button
                onClick={handleIgnore}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body – scrollable table */}
            <div className="overflow-y-auto flex-1 p-4">
              <div className="w-full bg-black/20 border border-white/10 rounded-xl overflow-hidden">
                {/* Table Header */}
                <div className="hidden sm:grid grid-cols-4 gap-3 px-4 py-3 border-b border-white/10 bg-white/5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <div>Roll No.</div>
                  <div>Name</div>
                  <div>Email</div>
                  <div>Mobile</div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-white/5">
                  {newStudents.map((s, i) => (
                    <div
                      key={`${s.rollNumber}-${i}`}
                      className="grid grid-cols-1 sm:grid-cols-4 gap-1 sm:gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors"
                    >
                      <span className="text-sm font-mono text-violet-300">
                        {s.rollNumber}
                      </span>
                      <span className="text-sm text-white">{s.name || '—'}</span>
                      <span className="text-sm text-gray-400 truncate">
                        {s.collegeEmail || s.personalEmail || '—'}
                      </span>
                      <span className="text-sm text-gray-400">
                        {s.mobile || '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10 shrink-0">
              <Button
                onClick={handleIgnore}
                disabled={inserting}
                variant="outline"
                className="bg-white/5 hover:bg-white/10 text-gray-300 border-white/10"
              >
                Ignore
              </Button>
              <Button
                onClick={handleInsert}
                disabled={inserting}
                className="bg-violet-600 hover:bg-violet-500 text-white border-0"
              >
                {inserting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding…
                  </>
                ) : (
                  <>Add {newStudents.length} record{newStudents.length !== 1 ? 's' : ''} to Database</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
