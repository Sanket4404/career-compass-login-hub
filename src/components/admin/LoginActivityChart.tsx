
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
import { format, subDays, isSameDay } from 'date-fns';
import { LoginActivity } from '@/lib/supabase';

interface LoginActivityChartProps {
  data: LoginActivity[];
}

export const LoginActivityChart = ({ data }: LoginActivityChartProps) => {
  // Generate data for the last 14 days
  const today = new Date();
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const date = subDays(today, 13 - i);
    return {
      date: format(date, 'yyyy-MM-dd'),
      displayDate: format(date, 'MMM dd'),
      count: 0
    };
  });

  // Count logins for each day
  data.forEach(login => {
    const loginDate = new Date(login.login_time);
    const dayIndex = last14Days.findIndex(day => 
      isSameDay(new Date(day.date), loginDate)
    );
    
    if (dayIndex !== -1) {
      last14Days[dayIndex].count += 1;
    }
  });

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={last14Days}
          margin={{ top: 10, right: 30, left: 0, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="displayDate" 
            angle={-45} 
            textAnchor="end" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            allowDecimals={false}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value) => [`${value} login${value !== 1 ? 's' : ''}`, 'Logins']}
            labelFormatter={(label) => `Date: ${label}`}
          />
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
