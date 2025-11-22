'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import { format } from 'date-fns';

interface Teacher {
  id: string;
  name: string;
}

interface AbsenceRecord {
  id: string;
  studentId: string;
  classId: string;
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

export default function TeacherHistory() {
  const router = useRouter();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [absences, setAbsences] = useState<AbsenceRecord[]>([]);
  const [students, setStudents] = useState<{ [key: string]: Student }>({});
  const [classes, setClasses] = useState<{ [key: string]: Class }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const role = localStorage.getItem('role');

    if (!userStr || role !== 'teacher') {
      router.push('/');
      return;
    }

    const user = JSON.parse(userStr);
    setTeacher(user);

    Promise.all([
      fetch(`/api/absences?teacherId=${user.id}`).then(res => res.json()),
      fetch('/api/students').then(res => res.json()),
      fetch('/api/classes').then(res => res.json()),
    ]).then(([absencesData, studentsData, classesData]) => {
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

      setLoading(false);
    });
  }, [router]);

  if (!teacher) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push('/teacher/dashboard')}
            className="hover:bg-blue-700 p-2 rounded-lg transition duration-200"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <h1 className="text-2xl font-bold">Absence History</h1>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-600">Loading...</div>
          ) : absences.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              No absence records found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 px-4 text-gray-700 font-bold">Date</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-bold">Session</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-bold">Class</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-bold">Student</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-bold">Recorded At</th>
                  </tr>
                </thead>
                <tbody>
                  {absences.map((absence) => (
                    <tr key={absence.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-800">
                        {format(new Date(absence.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="py-3 px-4 text-gray-800">{absence.session}</td>
                      <td className="py-3 px-4 text-gray-800">
                        {classes[absence.classId]
                          ? `${classes[absence.classId].year} - ${classes[absence.classId].name}`
                          : 'Unknown'}
                      </td>
                      <td className="py-3 px-4 text-gray-800">
                        {students[absence.studentId]?.name || 'Unknown'}
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {format(new Date(absence.timestamp), 'MMM dd, yyyy HH:mm')}
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
