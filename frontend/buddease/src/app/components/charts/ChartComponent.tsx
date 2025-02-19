// ChartComponent.tsx
import type { ChartOptions } from 'chart.js';
import React from 'react';
import { Bar, Line } from 'react-chartjs-2';

interface ChartComponentProps {
  type: 'line' | 'bar';
  data: any;
  options?: ChartOptions; // Include ChartOptions from 'react-chartjs-2'
}

const ChartComponent: React.FC<ChartComponentProps> = ({
  type,
  data,
  options,
}) => {
  const defaultOptions: ChartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    // Add more default options as needed
  };

  const mergedOptions = { ...defaultOptions, ...options };

  switch (type) {
    case "line":
      return (
        <Line data={data} options={mergedOptions as ChartOptions<"line">} />
      );
    case "bar":
      return <Bar data={data} options={mergedOptions as ChartOptions<"bar">} />;
    default:
      console.error(`Unsupported chart type: ${type}`);
      return null;
  }
};

export default ChartComponent;
