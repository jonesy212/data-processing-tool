import ChartComponent from "@/app/components/charts/ChartComponent";
import { NextApiRequest, NextApiResponse } from "next";
import React, { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import { ImageCard } from "../../cards";
import { DatasetModel } from "../../todos/tasks/DataSetModel";

interface VisualizationProps {
  type: "line" | "bar";
  data: number[][];
  labels: string[];
  datasets: DatasetModel[];
}

const Visualization: React.FC<VisualizationProps> = ({
  type,
  data,
  labels,
}) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [] as {
      label: string;
      data: number[];
      borderColor: string;
      fill: boolean;
    }[],
  });

  useEffect(() => {
    const chartDatasets = data.map((walk, index) => ({
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${index + 1}`,
      data: walk,
      borderColor: getRandomColor(),
      fill: type === "line" ? false : true,
    }));

    setChartData({
      labels: [],
      datasets: chartDatasets,
    });
      
       // Call the handler function
  
  handler({} as NextApiRequest, {} as NextApiResponse);
}, [type, data, labels]);

   
    
  const handler = (req: NextApiRequest, res: NextApiResponse) => {
    // Perform any server-side logic if needed
    res.status(200).json({ message: "Visualization API is working." });
  };

    
  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

    
  const getChartComponent = () => {
    switch (type) {
      case "line":
        return <Line data={chartData} options={{ maintainAspectRatio: false, responsive: true }} />;
      case "bar":
        return <Bar data={chartData} options={{ maintainAspectRatio: false, responsive: true }} />;
      default:
        return null;
    }
  };

  return (
    <div>
      {/* ChartComponent is used here */}
      <ChartComponent type={type} data={chartData} />

      {getChartComponent()}
      <div>
        <h1>Visualization</h1>
        {/* Integrate ImageCard component */}

        <ImageCard
          id={1} // Update with the appropriate id
          label="T-Test Results"
          imageSrc="/t_test_results.png" // Update the path based on your project structure
          onClick={() => {
            // Handle the click event if needed
          }}
        />
      </div>
    </div>
  );
};

export default Visualization;
export type { VisualizationProps };

