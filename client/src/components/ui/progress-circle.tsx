import { cn } from "@/lib/utils";

interface ProgressCircleProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  textClassName?: string;
  circleClassName?: string;
  showText?: boolean;
}

export function ProgressCircle({
  progress,
  size = 48,
  strokeWidth = 4,
  textClassName,
  circleClassName,
  showText = true,
}: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        <circle
          className="text-gray-200"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={cn("transition-all duration-300 ease-in-out", circleClassName)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {showText && (
        <div className={cn("absolute inset-0 flex items-center justify-center text-sm font-bold", textClassName)}>
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
}
