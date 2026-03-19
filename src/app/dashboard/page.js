// src/app/dashboard/page.jsx
'use client';

import { useRouter } from 'next/navigation';
import Dashboard from '@/components/Dashboard';

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Blobs */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-teal-200 opacity-40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] rounded-full bg-teal-300 opacity-30 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-cyan-100 opacity-50 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
          >
            ← Back
          </button>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: '#268E86', fontFamily: 'Georgia, serif' }}
          >
            Symptom Calendar
          </h1>
          <p className="text-sm text-gray-400 tracking-wide">
            Overview of daily COPD symptoms and activity
          </p>
        </div>

        {/* Calendar centered */}
        <Dashboard />
      </div>
    </div>
  );
}