// src/components/charts/ProgressPieChart.tsx
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { getProgressColor } from '@/utils/projectProgress';

interface ProgressPieChartProps {
  progress: number;
  size?: 'sm' | 'md' | 'lg'| 'xl';
  showBackground?: boolean;
  className?: string;
}

export default function ProgressPieChart({ 
  progress, 
  size = 'md', 
  showBackground = false,
  className = '' 
}: ProgressPieChartProps) {
  const progressColor = getProgressColor(progress);
  
  const progressData = [
    { name: 'Completed', value: progress },
    { name: 'Remaining', value: 100 - progress }
  ];

  const sizeConfig = {
    sm: { container: 'w-32 h-32', innerRadius: 25, outerRadius: 50 },
    md: { container: 'w-48 h-48', innerRadius: 35, outerRadius: 70 },
    lg: { container: 'w-64 h-64', innerRadius: 45, outerRadius: 90 },
        xl: { container: 'w-80 h-80', innerRadius: 55, outerRadius: 110 }

  };

  const { container, innerRadius, outerRadius } = sizeConfig[size];

  return (
    <div className={`${container} ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={progressData}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={0}
            dataKey="value"
            startAngle={90}
            endAngle={450}
            cornerRadius={10}
          >
            <Cell key="completed" fill={progressColor} />
            <Cell key="remaining" fill="#E5E7EB" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}