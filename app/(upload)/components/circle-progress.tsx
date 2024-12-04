import { cn } from '@/lib/utils'

interface CircleProgressProps {
  innerProgress: number
  outerProgress: number
  size?: number
  strokeWidth?: number
  className?: string
  color?: string
}

export function CircleProgress({
  innerProgress,
  outerProgress,
  size = 24,
  strokeWidth = 3,
  className,
  color = '#7ED4AD',
}: CircleProgressProps) {
  const normalizedInnerProgress = Math.min(100, Math.max(0, innerProgress))
  const normalizedOuterProgress = Math.min(100, Math.max(0, outerProgress))

  const center = size / 2
  // Outer ring radius
  const outerRadius = (size - strokeWidth) / 2
  // Inner ring radius (slightly smaller)
  const innerRadius = outerRadius - (strokeWidth * 1.5)
  
  const outerCircumference = 2 * Math.PI * outerRadius
  const innerCircumference = 2 * Math.PI * innerRadius
  const outerStrokeDashoffset = outerCircumference - (normalizedOuterProgress / 100) * outerCircumference
  const innerStrokeDashoffset = innerCircumference - (normalizedInnerProgress / 100) * innerCircumference

  return (
    <div className={cn('relative inline-flex', className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90 transform"
      >
        {/* Outer ring background */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-100"
        />
        {/* Outer ring progress (actual progress) */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={outerCircumference}
          strokeDashoffset={outerStrokeDashoffset}
          className="text-primary opacity-30"
        />
        {/* Inner ring background */}
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-100"
        />
        {/* Inner ring progress (actual progress) */}
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={innerCircumference}
          strokeDashoffset={innerStrokeDashoffset}
          className="text-primary transition-all duration-300 ease-in-out"
        />
      </svg>
    </div>
  )
}
