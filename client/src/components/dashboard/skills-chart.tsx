import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UserSkill } from "@/lib/types";
import { Chart, ChartConfiguration, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from "chart.js";

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface SkillsChartProps {
  userSkills: UserSkill[];
  isLoading: boolean;
}

export function SkillsChart({ userSkills, isLoading }: SkillsChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  // Set up and update chart when skills change
  useEffect(() => {
    if (!chartRef.current || userSkills.length === 0) return;

    // Clean up previous chart instance
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Prepare data
    const labels = userSkills.map(skill => skill.skill?.name || `Skill ${skill.skillId}`);
    const data = userSkills.map(skill => skill.progress);

    // Chart configuration
    const config: ChartConfiguration = {
      type: "radar",
      data: {
        labels,
        datasets: [
          {
            label: "Your Skills",
            data,
            backgroundColor: "rgba(67, 97, 238, 0.2)",
            borderColor: "rgba(67, 97, 238, 1)",
            pointBackgroundColor: "rgba(67, 97, 238, 1)",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(67, 97, 238, 1)",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: {
              display: true,
            },
            suggestedMin: 0,
            suggestedMax: 100,
            ticks: {
              stepSize: 20,
            },
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
  }, [userSkills]);

  return (
    <Card className="lg:col-span-2">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold font-heading">Thinking Skills</h3>
          <select className="text-sm border border-gray-300 rounded-md px-2 py-1">
            <option>All Time</option>
            <option>Last 3 Months</option>
            <option>Last Month</option>
          </select>
        </div>
        <div className="flex justify-center h-80">
          {isLoading ? (
            <div className="flex items-center justify-center h-full w-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <canvas ref={chartRef} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
