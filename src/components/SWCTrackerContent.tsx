'use client';

import { ArrowLeft, CheckCircle2, Search } from 'lucide-react';
import { useState } from 'react';

interface StudentData {
  timestamp: string;
  name: string;
  department: string;
  rollNumber: string;
  mobile: string;
  collegeEmail: string;
  personalEmail: string;
  whatsapp: string;
  emergency: string;
}

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
      // Optional: Scroll to top of table or window
      // window.scrollTo({ top: 0, behavior: 'smooth' });
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

  return (
    <div className="flex flex-col gap-6">
      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Search Bar */}
        <div className="md:col-span-6 relative">
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
        <div className="md:col-span-3">
          <select
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all appearance-none cursor-pointer"
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setCurrentPage(1);
            }}
            style={{ backgroundImage: 'none' }} // Remove default arrow to style custom if needed, usually browser default is fine for MVP but let's keep it simple
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
        <div className="md:col-span-3">
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
      </div>

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
                    {student.department}
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
                    {student.mobile}
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
              className={`p-2 rounded-lg border border-white/10 transition-colors ${
                currentPage > 1
                  ? 'bg-white/5 hover:bg-white/10 text-white cursor-pointer'
                  : 'bg-white/5 text-gray-600 cursor-not-allowed'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              {/* Simplified Page Indicator */}
              <span className="px-4 py-2 rounded-lg bg-violet-600/20 border border-violet-600/30 text-violet-300 font-medium select-none">
                Page {currentPage} of {totalPages}
              </span>
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className={`p-2 rounded-lg border border-white/10 transition-colors ${
                currentPage < totalPages
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
  );
}
