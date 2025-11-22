'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaSync } from 'react-icons/fa';
import { format } from 'date-fns';

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
  timestamp: string;
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

export default function MonitorAbsences() {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [absences, setAbsences] = useState<AbsenceRecord[]>([]);
  const [students, setStudents] = useState<{ [key: string]: Student }>({});
  const [classes, setClasses] = useState<{ [key: string]: Class }>({});
  const [teachers, setTeachers] = useState<{ [key: string]: Teacher }>({});
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const loadData = async () => {
    setLoading(true);
    try {
      const [absencesData, studentsData, classesData, teachersData] = await Promise.all([
        fetch('/api/absences').then(res => res.json()),
        fetch('/api/students').then(res => res.json()),
        fetch('/api/classes').then(res => res.json()),
        fetch('/api/teachers').then(res => res.json()),
      ]);

      setAbsences(absencesData);

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const role = localStorage.getItem('role');

    if (!userStr || role !== 'admin') {
      router.push('/');
      return;
    }

    setAdmin(JSON.parse(userStr));
    loadData();
  }, [router]);

  const filteredAbsences = absences.filter(a => a.date === filterDate);

  const stats = {
    total: filteredAbsences.length,
    uniqueStudents: new Set(filteredAbsences.map(a => a.studentId)).size,
    classes: new Set(filteredAbsences.map(a => a.classId)).size,
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
          <h1 className="text-2xl font-bold">Monitor Absences</h1>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <label className="text-gray-700 font-bold">Filter by Date:</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
              />
            </div>
            <button
              onClick={loadData}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition duration-200"
            >
              <FaSync />
              Refresh
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
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Absence Records for {format(new Date(filterDate), 'MMMM dd, yyyy')}
          </h2>
          {loading ? (
            <div className="text-center py-8 text-gray-600">Loading...</div>
          ) : filteredAbsences.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              No absences recorded for this date
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 px-4 text-gray-700 font-bold">Student</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-bold">Class</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-bold">Session</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-bold">Recorded By</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-bold">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAbsences.map((absence) => (
                    <tr key={absence.id} className="border-b border-gray-200 hover:bg-gray-50">
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
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {format(new Date(absence.timestamp), 'HH:mm')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
