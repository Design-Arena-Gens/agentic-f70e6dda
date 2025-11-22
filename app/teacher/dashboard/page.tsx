'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSignOutAlt, FaClipboardList, FaHistory } from 'react-icons/fa';

interface Teacher {
  id: string;
  name: string;
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [teacher, setTeacher] = useState<Teacher | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const role = localStorage.getItem('role');

    if (!userStr || role !== 'teacher') {
      router.push('/');
      return;
    }

    setTeacher(JSON.parse(userStr));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    router.push('/');
  };

  if (!teacher) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">Welcome, {teacher.name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition duration-200"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div
            onClick={() => router.push('/teacher/record-absence')}
            className="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition duration-200 cursor-pointer border-2 border-transparent hover:border-blue-500"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <FaClipboardList className="text-3xl text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Record Absences</h2>
            </div>
            <p className="text-gray-600">
              Mark student absences for today's classes and sessions
            </p>
          </div>

          <div
            onClick={() => router.push('/teacher/history')}
            className="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition duration-200 cursor-pointer border-2 border-transparent hover:border-blue-500"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-green-100 p-4 rounded-full">
                <FaHistory className="text-3xl text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">View History</h2>
            </div>
            <p className="text-gray-600">
              View your absence recording history and past records
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
