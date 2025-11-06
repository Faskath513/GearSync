import React from "react";
import { Clock, Calendar } from "lucide-react";

const ServiceHistory: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Service History</h1>
        <p className="text-gray-600 mt-1">View your past service records</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-12 text-center">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No service history yet</p>
        </div>
      </div>
    </div>
  );
};

export default ServiceHistory;
