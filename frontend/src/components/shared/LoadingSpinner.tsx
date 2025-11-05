import React from "react";

interface LoadingSpinnerProps {
  label?: string;
  colorClassName?: string; // e.g. border-green-600
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ label = "Loading...", colorClassName = "border-green-600" }) => {
  return (
    <div className="p-12 text-center">
      <div className={`inline-block w-8 h-8 border-4 ${colorClassName} border-t-transparent rounded-full animate-spin`}></div>
      <p className="mt-4 text-gray-600">{label}</p>
    </div>
  );
};

export default LoadingSpinner;

