// src/app/dashboard/page.jsx
'use client';

import { useRouter } from 'next/navigation';
import Dashboard from '@/components/Dashboard';

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen relative overflow-hidden">
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

        {/* Calendar */}
        <Dashboard />

        {/* Avslutt button */}
        <div className="flex justify-center mt-10 mb-4">
          <button
            onClick={() => router.push('/')}
            className="px-10 py-3 rounded-xl text-sm font-bold tracking-widest uppercase transition-all hover:opacity-80"
            style={{
              background: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(38,142,134,0.2)',
              color: '#268E86',
              backdropFilter: 'blur(10px)',
            }}
          >
            Avslutt
          </button>
        </div>

      </div>
    </div>
  );
}