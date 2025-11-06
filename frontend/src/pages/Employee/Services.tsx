import React from "react";
import { Wrench } from "lucide-react";

const Services: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Services</h1>
        <p className="text-gray-600 mt-1">View available services</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-12 text-center">
          <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No services available</p>
        </div>
      </div>
    </div>
  );
};

export default Services;
