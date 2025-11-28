import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface ScoreChartProps {
  score: number;
  label: string;
  color: string;
}

export const ScoreChart: React.FC<ScoreChartProps> = ({ score, label, color }) => {
  const data = [{ name: 'score', value: score, fill: color }];

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-surface rounded-xl border border-white/5 shadow-lg w-full">
      <div className="relative h-32 w-32">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart 
            innerRadius="70%" 
            outerRadius="100%" 
            barSize={10} 
            data={data} 
            startAngle={90} 
            endAngle={-270}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: '#334155' }}
              dataKey="value"
              cornerRadius={30} // Use number, not string with px
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-2xl font-bold text-white">{score}</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-medium text-gray-400 uppercase tracking-wider">{label}</span>
    </div>
  );
};
