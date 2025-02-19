// createVisualizations.ts
import { Line, Bar } from "react-chartjs-2";
import { VisualizationData } from "../users/User";
import { ChartData } from "chart.js";
import { VisualizationType } from "./chat/CommonInterfaces";
import React from "react";



// Function to create line chart visualization
export const createLineChart = (data: VisualizationData): JSX.Element => {
  const chartData: ChartData<"line"> = {
    datasets: data.data.datasets, // Access the datasets property from data.data
    labels: data.data.labels,
  };

  return <Line
    data={chartData}
    options={{ maintainAspectRatio: false }}
  />;
}




  // Function to create bar chart visualization
  export const createBarChart = (data: VisualizationData): JSX.Element => {

  const chartData: ChartData<"bar"> = {
    datasets: data.data.datasets, // Access the datasets property from data.data
    labels: data.data.labels,
  };

  return <Bar data={chartData} options={{ maintainAspectRatio: false, responsive: true }} />;
};

// Function to create table visualization
export const createTable = (data: any[]): JSX.Element => {
  // Implement logic to generate table from data
  return (
    <table>
      {/* Render table rows and columns based on data */}
    </table>
  );
};

// Function to create visualization based on visualization type
export const createVisualization = (type: VisualizationType, data: VisualizationData | any[]): JSX.Element | null => {
  switch (type) {
    case "line":
      return createLineChart(data as VisualizationData);
    case "bar":
      return createBarChart(data as VisualizationData);
    case "table":
      return createTable(data as any[]);
    default:
      return null;
  }
};
