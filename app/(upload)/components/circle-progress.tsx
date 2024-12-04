import { cn } from '@/lib/utils'

interface CircleProgressProps {
  progress: number
  size?: number
  strokeWidth?: number
  className?: string
  color?: string
}

export function CircleProgress({
  progress,
  size = 24,
  strokeWidth = 3,
  className,
  color = '#7ED4AD',
}: CircleProgressProps) {
  const normalizedProgress = Math.min(100, Math.max(0, progress))

  const center = size / 2
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference

  return (
    <div className={cn('relative inline-flex', className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90 transform"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="text-primary transition-all duration-300 ease-in-out"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
