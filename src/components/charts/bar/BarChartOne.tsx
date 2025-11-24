import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { month: 'Jan', sales: 168 },
  { month: 'Feb', sales: 385 },
  { month: 'Mar', sales: 201 },
  { month: 'Apr', sales: 298 },
  { month: 'May', sales: 187 },
  { month: 'Jun', sales: 195 },
  { month: 'Jul', sales: 291 },
  { month: 'Aug', sales: 110 },
  { month: 'Sep', sales: 215 },
  { month: 'Oct', sales: 390 },
  { month: 'Nov', sales: 280 },
  { month: 'Dec', sales: 112 },
];

export default function BarChartOne() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 w-full">
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
        Monthly Sales
      </h3>
      <div className="w-full" style={{ height: '180px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <defs>
              <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#465fff" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#465fff" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#666" fontSize={12} />
            <YAxis stroke="#666" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />
            <Bar dataKey="sales" fill="url(#colorBar)" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
