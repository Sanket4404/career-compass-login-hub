
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

interface LoginActivityChartProps {
  data: Record<string, number>;
}

export const LoginActivityChart = ({ data }: LoginActivityChartProps) => {
  // Convert data object to array format for Recharts
  const chartData = Object.entries(data)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-14); // Show last 14 days

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="date" 
            angle={-45} 
            textAnchor="end" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            allowDecimals={false}
            tick={{ fontSize: 12 }}
          />
          <Tooltip />
          <Bar 
            dataKey="count" 
            name="Logins" 
            fill="#8B5CF6" 
            radius={[4, 4, 0, 0]} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
