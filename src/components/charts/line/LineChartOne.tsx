import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { month: 'Jan', sales: 180, revenue: 40 },
  { month: 'Feb', sales: 190, revenue: 30 },
  { month: 'Mar', sales: 170, revenue: 50 },
  { month: 'Apr', sales: 160, revenue: 40 },
  { month: 'May', sales: 175, revenue: 55 },
  { month: 'Jun', sales: 165, revenue: 40 },
  { month: 'Jul', sales: 170, revenue: 70 },
  { month: 'Aug', sales: 205, revenue: 100 },
  { month: 'Sep', sales: 230, revenue: 110 },
  { month: 'Oct', sales: 210, revenue: 120 },
  { month: 'Nov', sales: 240, revenue: 150 },
  { month: 'Dec', sales: 235, revenue: 140 },
];

export default function LineChartOne() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 w-full">
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
        Sales & Revenue Trends
      </h3>
      <div className="w-full" style={{ height: '310px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#465FFF" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#465FFF" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9CB9FF" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#9CB9FF" stopOpacity={0.1}/>
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
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }} 
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#465FFF"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorSales)"
              name="Sales"
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#9CB9FF"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              name="Revenue"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
