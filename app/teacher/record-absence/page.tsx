'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaCheck } from 'react-icons/fa';
import { format } from 'date-fns';

interface Class {
  id: string;
  name: string;
  year: string;
}

interface Student {
  id: string;
  name: string;
}

interface Teacher {
  id: string;
  name: string;
}

const SESSIONS = [
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
];

export default function RecordAbsence() {
  const router = useRouter();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedSession, setSelectedSession] = useState(SESSIONS[0]);
  const [absentStudents, setAbsentStudents] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const role = localStorage.getItem('role');

    if (!userStr || role !== 'teacher') {
      router.push('/');
      return;
    }

    setTeacher(JSON.parse(userStr));

    fetch('/api/classes')
      .then(res => res.json())
      .then(data => setClasses(data));
  }, [router]);

  useEffect(() => {
    if (selectedClass) {
      fetch(`/api/students?classId=${selectedClass}`)
        .then(res => res.json())
        .then(data => setStudents(data));
    } else {
      setStudents([]);
    }
    setAbsentStudents(new Set());
  }, [selectedClass]);

  const toggleStudent = (studentId: string) => {
    const newSet = new Set(absentStudents);
    if (newSet.has(studentId)) {
      newSet.delete(studentId);
    } else {
      newSet.add(studentId);
    }
    setAbsentStudents(newSet);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (absentStudents.size === 0) {
      alert('No students marked as absent');
      return;
    }

    setLoading(true);

    try {
      const promises = Array.from(absentStudents).map(studentId =>
        fetch('/api/absences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId,
            classId: selectedClass,
            teacherId: teacher?.id,
            date: selectedDate,
            session: selectedSession,
          }),
        })
      );

      await Promise.all(promises);
      setSuccess(true);
      setTimeout(() => {
        router.push('/teacher/dashboard');
      }, 2000);
    } catch (error) {
      alert('Error recording absences');
    } finally {
      setLoading(false);
    }
  };

  if (!teacher) return null;

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <FaCheck className="text-3xl text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Success!</h2>
          <p className="text-gray-600">Absences recorded successfully</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold">Record Absences</h1>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                >
                  <option value="">Select a class</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.year} - {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Session
                </label>
                <select
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                >
                  {SESSIONS.map(session => (
                    <option key={session} value={session}>
                      {session}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedClass && students.length > 0 && (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">
                    Select Absent Students ({absentStudents.size} selected)
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {students.map(student => (
                      <label
                        key={student.id}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition duration-200 ${
                          absentStudents.has(student.id)
                            ? 'bg-red-50 border-red-500'
                            : 'bg-white border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={absentStudents.has(student.id)}
                          onChange={() => toggleStudent(student.id)}
                          className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                        />
                        <span className="ml-3 text-gray-800">{student.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || absentStudents.size === 0}
                  className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 ${
                    loading || absentStudents.size === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Recording...' : `Record ${absentStudents.size} Absence(s)`}
                </button>
              </>
            )}

            {selectedClass && students.length === 0 && (
              <div className="text-center text-gray-600 py-8">
                No students found in this class
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
