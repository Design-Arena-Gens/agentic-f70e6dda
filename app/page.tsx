'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaUserTie, FaUserShield } from 'react-icons/fa';

export default function Home() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'admin' | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role: selectedRole }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('role', selectedRole!);

        if (selectedRole === 'teacher') {
          router.push('/teacher/dashboard');
        } else {
          router.push('/admin/dashboard');
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
            Student Absence Tracker
          </h1>
          <p className="text-center text-gray-600 mb-8">Select your role to continue</p>

          <div className="space-y-4">
            <button
              onClick={() => setSelectedRole('teacher')}
              className="w-full flex items-center justify-center gap-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 transform hover:scale-105"
            >
              <FaUserTie className="text-2xl" />
              <span className="text-lg">Teacher Login</span>
            </button>

            <button
              onClick={() => setSelectedRole('admin')}
              className="w-full flex items-center justify-center gap-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 transform hover:scale-105"
            >
              <FaUserShield className="text-2xl" />
              <span className="text-lg">Administration Login</span>
            </button>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 font-semibold mb-2">Demo Credentials:</p>
            <p className="text-xs text-gray-600">Teacher: teacher1 / teacher123</p>
            <p className="text-xs text-gray-600">Admin: admin / admin123</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full">
        <button
          onClick={() => {
            setSelectedRole(null);
            setError('');
            setUsername('');
            setPassword('');
          }}
          className="mb-4 text-blue-500 hover:text-blue-700 text-sm"
        >
          ← Back to role selection
        </button>

        <div className="flex items-center justify-center mb-6">
          {selectedRole === 'teacher' ? (
            <FaUserTie className="text-5xl text-blue-500" />
          ) : (
            <FaUserShield className="text-5xl text-purple-500" />
          )}
        </div>

        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          {selectedRole === 'teacher' ? 'Teacher' : 'Administration'} Login
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Enter your credentials to continue
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${
              selectedRole === 'teacher' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-purple-500 hover:bg-purple-600'
            } text-white font-bold py-3 px-4 rounded-lg transition duration-200 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 font-semibold mb-2">Demo Credentials:</p>
          {selectedRole === 'teacher' ? (
            <>
              <p className="text-xs text-gray-600">Username: teacher1</p>
              <p className="text-xs text-gray-600">Password: teacher123</p>
            </>
          ) : (
            <>
              <p className="text-xs text-gray-600">Username: admin</p>
              <p className="text-xs text-gray-600">Password: admin123</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
