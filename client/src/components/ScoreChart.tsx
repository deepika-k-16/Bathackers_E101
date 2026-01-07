import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';

interface ResourceScoreProps {
  score: {
    budgetScore: number;
    timeScore: number;
    growthCapacity: number;
  };
}

export function ScoreChart({ score }: ResourceScoreProps) {
  const data = [
    { subject: 'Budget', A: score.budgetScore, fullMark: 100 },
    { subject: 'Time', A: score.timeScore, fullMark: 100 },
    { subject: 'Growth Cap', A: score.growthCapacity, fullMark: 100 },
  ];

  return (
    <div className="w-full h-[300px] flex justify-center items-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Score"
            dataKey="A"
            stroke="#4f46e5"
            strokeWidth={3}
            fill="#4f46e5"
            fillOpacity={0.2}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              borderRadius: '8px', 
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }} 
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
