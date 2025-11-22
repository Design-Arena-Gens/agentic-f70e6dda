'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSignOutAlt, FaChartBar, FaUsers, FaFileAlt } from 'react-icons/fa';

interface Admin {
  id: string;
  name: string;
  role: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const role = localStorage.getItem('role');

    if (!userStr || role !== 'admin') {
      router.push('/');
      return;
    }

    setAdmin(JSON.parse(userStr));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    router.push('/');
  };

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Administration Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">Welcome, {admin.name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-purple-700 hover:bg-purple-800 px-4 py-2 rounded-lg transition duration-200"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div
            onClick={() => router.push('/admin/monitor')}
            className="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition duration-200 cursor-pointer border-2 border-transparent hover:border-purple-500"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-purple-100 p-4 rounded-full">
                <FaChartBar className="text-3xl text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Monitor Absences</h2>
            </div>
            <p className="text-gray-600">
              View real-time absence data and statistics
            </p>
          </div>

          <div
            onClick={() => router.push('/admin/teachers')}
            className="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition duration-200 cursor-pointer border-2 border-transparent hover:border-purple-500"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <FaUsers className="text-3xl text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Manage Teachers</h2>
            </div>
            <p className="text-gray-600">
              Add, edit, or remove teacher accounts
            </p>
          </div>

          <div
            onClick={() => router.push('/admin/reports')}
            className="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition duration-200 cursor-pointer border-2 border-transparent hover:border-purple-500"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-green-100 p-4 rounded-full">
                <FaFileAlt className="text-3xl text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Generate Reports</h2>
            </div>
            <p className="text-gray-600">
              Create daily and weekly absence reports
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
