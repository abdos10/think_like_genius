import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { WeeklyActivity } from "@/lib/types";
import { Chart, ChartConfiguration, LineController, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip } from "chart.js";

Chart.register(LineController, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

interface WeeklyChartProps {
  weeklyActivity: WeeklyActivity[];
  isLoading: boolean;
  averageScore?: number;
  totalTime?: number;
}

export function WeeklyChart({ weeklyActivity, isLoading, averageScore = 76, totalTime = 225 }: WeeklyChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  // Format total time in hours and minutes
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Set up and update chart when data changes
  useEffect(() => {
    if (!chartRef.current || weeklyActivity.length === 0) return;

    // Clean up previous chart instance
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Sort by day of week
    const dayOrder = { "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6, "Sun": 7 };
    const sortedActivity = [...weeklyActivity].sort((a, b) => 
      dayOrder[a.dayOfWeek as keyof typeof dayOrder] - dayOrder[b.dayOfWeek as keyof typeof dayOrder]
    );

    // Prepare data
    const labels = sortedActivity.map(day => day.dayOfWeek);
    const data = sortedActivity.map(day => day.minutesSpent);

    // Chart configuration
    const config: ChartConfiguration = {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Minutes Spent",
            data,
            backgroundColor: "rgba(67, 97, 238, 0.1)",
            borderColor: "rgba(67, 97, 238, 1)",
            borderWidth: 2,
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            display: true
          },
          x: {
            display: true
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    };

    // Create new chart
    chartInstance.current = new Chart(chartRef.current, config);

    // Clean up on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [weeklyActivity]);

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-bold font-heading mb-4">Weekly Activity</h3>
        <div className="h-64">
          {isLoading ? (
            <div className="flex items-center justify-center h-full w-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <canvas ref={chartRef} />
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Avg. Score: <span className="font-medium text-gray-800">{averageScore}%</span></span>
            <span>Total Time: <span className="font-medium text-gray-800">{formatTime(totalTime)}</span></span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
