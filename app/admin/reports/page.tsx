'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaFileDownload, FaCalendarDay, FaCalendarWeek } from 'react-icons/fa';
import { format, startOfWeek, endOfWeek, subDays } from 'date-fns';

interface Admin {
  id: string;
  name: string;
}

interface AbsenceRecord {
  id: string;
  studentId: string;
  classId: string;
  teacherId: string;
  date: string;
  session: string;
}

interface Student {
  id: string;
  name: string;
}

interface Class {
  id: string;
  name: string;
  year: string;
}

interface Teacher {
  id: string;
  name: string;
}

export default function Reports() {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [reportType, setReportType] = useState<'daily' | 'weekly'>('daily');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [absences, setAbsences] = useState<AbsenceRecord[]>([]);
  const [students, setStudents] = useState<{ [key: string]: Student }>({});
  const [classes, setClasses] = useState<{ [key: string]: Class }>({});
  const [teachers, setTeachers] = useState<{ [key: string]: Teacher }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const role = localStorage.getItem('role');

    if (!userStr || role !== 'admin') {
      router.push('/');
      return;
    }

    setAdmin(JSON.parse(userStr));

    Promise.all([
      fetch('/api/students').then(res => res.json()),
      fetch('/api/classes').then(res => res.json()),
      fetch('/api/teachers').then(res => res.json()),
    ]).then(([studentsData, classesData, teachersData]) => {
      const studentMap: { [key: string]: Student } = {};
      studentsData.forEach((s: Student) => {
        studentMap[s.id] = s;
      });
      setStudents(studentMap);

      const classMap: { [key: string]: Class } = {};
      classesData.forEach((c: Class) => {
        classMap[c.id] = c;
      });
      setClasses(classMap);

      const teacherMap: { [key: string]: Teacher } = {};
      teachersData.forEach((t: Teacher) => {
        teacherMap[t.id] = t;
      });
      setTeachers(teacherMap);
    });
  }, [router]);

  const generateReport = async () => {
    setLoading(true);
    try {
      let startDate, endDate;

      if (reportType === 'daily') {
        startDate = selectedDate;
        endDate = selectedDate;
      } else {
        const date = new Date(selectedDate);
        startDate = format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        endDate = format(endOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      }

      const response = await fetch(`/api/absences?startDate=${startDate}&endDate=${endDate}`);
      const data = await response.json();
      setAbsences(data);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    let startDate, endDate, title;

    if (reportType === 'daily') {
      startDate = selectedDate;
      endDate = selectedDate;
      title = `Daily Absence Report - ${format(new Date(selectedDate), 'MMMM dd, yyyy')}`;
    } else {
      const date = new Date(selectedDate);
      startDate = format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      endDate = format(endOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      title = `Weekly Absence Report - ${format(new Date(startDate), 'MMM dd')} to ${format(new Date(endDate), 'MMM dd, yyyy')}`;
    }

    let csv = `${title}\n\n`;
    csv += 'Date,Student,Class,Session,Recorded By\n';

    absences.forEach(absence => {
      const student = students[absence.studentId]?.name || 'Unknown';
      const cls = classes[absence.classId]
        ? `${classes[absence.classId].year} - ${classes[absence.classId].name}`
        : 'Unknown';
      const teacher = teachers[absence.teacherId]?.name || 'Unknown';

      csv += `${absence.date},"${student}","${cls}",${absence.session},"${teacher}"\n`;
    });

    csv += `\nTotal Absences: ${absences.length}\n`;
    csv += `Unique Students: ${new Set(absences.map(a => a.studentId)).size}\n`;
    csv += `Classes Affected: ${new Set(absences.map(a => a.classId)).size}\n`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `absence-report-${reportType}-${selectedDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const stats = {
    total: absences.length,
    uniqueStudents: new Set(absences.map(a => a.studentId)).size,
    classes: new Set(absences.map(a => a.classId)).size,
  };

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="hover:bg-purple-700 p-2 rounded-lg transition duration-200"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <h1 className="text-2xl font-bold">Generate Reports</h1>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Report Configuration</h2>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Report Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="daily"
                    checked={reportType === 'daily'}
                    onChange={(e) => setReportType(e.target.value as 'daily')}
                    className="mr-2"
                  />
                  <FaCalendarDay className="mr-2 text-blue-500" />
                  Daily Report
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="weekly"
                    checked={reportType === 'weekly'}
                    onChange={(e) => setReportType(e.target.value as 'weekly')}
                    className="mr-2"
                  />
                  <FaCalendarWeek className="mr-2 text-green-500" />
                  Weekly Report
                </label>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                {reportType === 'daily' ? 'Select Date' : 'Select Week (any date in the week)'}
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
              />
            </div>
          </div>

          <button
            onClick={generateReport}
            disabled={loading}
            className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>

        {absences.length > 0 && (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Report Summary</h2>
                <button
                  onClick={downloadReport}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-200"
                >
                  <FaFileDownload />
                  Download CSV
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-red-800 text-sm font-semibold mb-1">Total Absences</div>
                  <div className="text-3xl font-bold text-red-600">{stats.total}</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-blue-800 text-sm font-semibold mb-1">Unique Students</div>
                  <div className="text-3xl font-bold text-blue-600">{stats.uniqueStudents}</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-green-800 text-sm font-semibold mb-1">Classes Affected</div>
                  <div className="text-3xl font-bold text-green-600">{stats.classes}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Detailed Records</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-3 px-4 text-gray-700 font-bold">Date</th>
                      <th className="text-left py-3 px-4 text-gray-700 font-bold">Student</th>
                      <th className="text-left py-3 px-4 text-gray-700 font-bold">Class</th>
                      <th className="text-left py-3 px-4 text-gray-700 font-bold">Session</th>
                      <th className="text-left py-3 px-4 text-gray-700 font-bold">Recorded By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {absences.map((absence) => (
                      <tr key={absence.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-800">
                          {format(new Date(absence.date), 'MMM dd, yyyy')}
                        </td>
                        <td className="py-3 px-4 text-gray-800">
                          {students[absence.studentId]?.name || 'Unknown'}
                        </td>
                        <td className="py-3 px-4 text-gray-800">
                          {classes[absence.classId]
                            ? `${classes[absence.classId].year} - ${classes[absence.classId].name}`
                            : 'Unknown'}
                        </td>
                        <td className="py-3 px-4 text-gray-800">{absence.session}</td>
                        <td className="py-3 px-4 text-gray-800">
                          {teachers[absence.teacherId]?.name || 'Unknown'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
