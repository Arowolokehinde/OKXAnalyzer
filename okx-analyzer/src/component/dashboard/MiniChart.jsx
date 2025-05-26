'use client';

const MiniChart = ({ data, positive }) => {
  const chartHeight = 40;
  const chartWidth = 100;
  
  // Calculate points for the path
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * chartWidth;
    const y = chartHeight - (value / 100) * chartHeight;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg width={chartWidth} height={chartHeight} className="overflow-visible">
      <defs>
        <linearGradient id={`gradient-${positive ? 'up' : 'down'}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={positive ? 'rgb(16, 185, 129, 0.3)' : 'rgb(239, 68, 68, 0.3)'} />
          <stop offset="100%" stopColor={positive ? 'rgb(16, 185, 129, 0)' : 'rgb(239, 68, 68, 0)'} />
        </linearGradient>
      </defs>
      
      {/* Area fill */}
      <path
        d={`M0,${chartHeight} ${points} ${chartWidth},${chartHeight} Z`}
        fill={`url(#gradient-${positive ? 'up' : 'down'})`}
      />
      
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={positive ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)'}
        strokeWidth="1.5"
      />
    </svg>
  );
};

export default MiniChart;