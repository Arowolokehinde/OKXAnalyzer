'use client';

const MiniChart = ({ data, positive, height = 40, width = 100 }) => {
  const chartHeight = typeof height === 'number' ? height : parseInt(height);
  const chartWidth = typeof width === 'number' ? width : '100%';
  
  // Calculate points for the path
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * (typeof chartWidth === 'number' ? chartWidth : 100);
    const y = chartHeight - (value / 100) * chartHeight;
    return `${x},${y}`;
  }).join(' ');
  
  // Create the path
  const linePath = `M${points}`;
  
  // Create the area path (for the gradient fill)
  const areaPath = `M0,${chartHeight} ${points} L${typeof chartWidth === 'number' ? chartWidth : 100},${chartHeight} Z`;
  
  return (
    <svg 
      width={chartWidth} 
      height={chartHeight} 
      viewBox={`0 0 ${typeof chartWidth === 'number' ? chartWidth : 100} ${chartHeight}`}
      preserveAspectRatio="none"
      className="overflow-visible"
    >
      {/* Gradient fill */}
      <defs>
        <linearGradient id={`gradient-${positive ? 'up' : 'down'}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={positive ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'} />
          <stop offset="100%" stopColor={positive ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)'} />
        </linearGradient>
      </defs>
      
      {/* Area fill */}
      <path
        d={areaPath}
        fill={`url(#gradient-${positive ? 'up' : 'down'})`}
        strokeWidth="0"
      />
      
      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke={positive ? '#22c55e' : '#ef4444'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Current value dot */}
      <circle
        cx={typeof chartWidth === 'number' ? chartWidth : 100}
        cy={chartHeight - (data[data.length - 1] / 100) * chartHeight}
        r="2"
        fill={positive ? '#22c55e' : '#ef4444'}
      />
    </svg>
  );
};

export default MiniChart;