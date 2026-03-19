'use client';

import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/visitor-stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data.stats ?? []);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="p-6 rounded-lg border border-gray-700 bg-gray-900">
      <h2 className="text-xl font-semibold text-white mb-6">Page Visitor Stats</h2>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : stats.length === 0 ? (
        <p className="text-gray-400">No data yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs uppercase text-gray-500 border-b border-gray-700">
              <tr>
                <th className="py-3 pr-6">Page</th>
                <th className="py-3 pr-6">Total Visits</th>
                <th className="py-3 pr-6">Unique Visitors</th>
                <th className="py-3">Last Visit</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((row) => (
                <tr key={row.page} className="border-b border-gray-800 hover:bg-gray-800 transition-colors">
                  <td className="py-3 pr-6 font-mono text-teal-400">{row.page}</td>
                  <td className="py-3 pr-6">{row.totalVisits}</td>
                  <td className="py-3 pr-6">{row.uniqueVisitors}</td>
                  <td className="py-3 text-gray-500 text-xs">
                    {new Date(row.updatedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}