// ProductLaunchDetails.tsx
import React from "react";
import CommonDetails from "../models/CommonData";
import Project from "../projects/Project";

// Define the type for product launch data
export interface ProductLaunchData {
  productId: Project["id"];
  productName: string;
  productDescription: string;
  launchDate: Date;
  price: number;
  inventory: number;
  // Add more properties as needed
}

// Example usage:
const productLaunchData: ProductLaunchData = {
  productId: "prod123",
  productName: "Exciting Product",
  productDescription: "Description of the product launch",
  launchDate: new Date("2024-01-30"),
  price: 29.99,
  inventory: 100,
  // Add more data for the product launch
};

const ProductLaunchDetails: React.FC<{ productData: ProductLaunchData }> = ({ productData }) => (
  productData ? <CommonDetails data={{
    title: 'Product Launch Details',
    description: 'Product launch data',
    data: productData
  }} /> : <div>Product data not available</div>
);

export { ProductLaunchDetails };
