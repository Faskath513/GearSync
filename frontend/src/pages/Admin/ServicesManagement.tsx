import React, { useState } from "react";
import { Wrench, Plus, Search, Edit, Trash2, X } from "lucide-react";
import { addService, deleteService, listAllServices, ServiceItem, updateService } from "../../api/services";
import useApi from "../../hooks/useApi";

interface ServiceFormData {
  serviceName: string;
  category: string;
  description?: string;
  basePrice: number;
  estimatedDurationMinutes: number;
}

const ServicesManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: services, loading, error, refetch } = useApi<ServiceItem[]>(() => listAllServices(), []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  const filtered = (services || []).filter((s) =>
    s.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddService = async (data: ServiceFormData) => {
    try {
  // payload conforms to backend ServiceDTO
  await addService(data as any);
      setShowAddModal(false);
      await refetch();
      alert("Service added successfully!");
    } catch (error: any) {
      console.error("Error adding service:", error);
      alert(error.response?.data || "Failed to add service");
    }
  };

  const handleUpdateService = async (data: ServiceFormData) => {
    if (!selectedService?.id) return;

    try {
  await updateService(selectedService.id, data as any);
      setShowEditModal(false);
      setSelectedService(null);
      await refetch();
      alert("Service updated successfully!");
    } catch (error: any) {
      console.error("Error updating service:", error);
      alert(error.response?.data || "Failed to update service");
    }
  };

  const handleDeleteService = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;

    try {
      await deleteService(id);
      await refetch();
      alert("Service deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting service:", error);
      alert(error.response?.data || "Failed to delete service");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Services Management</h1>
          <p className="text-gray-600 mt-1">Manage service types and pricing</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Service
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Services</p>
              <p className="text-2xl font-bold text-gray-900">{(services || []).length}</p>
            </div>
            <Wrench className="w-10 h-10 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">Loading services...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-600">Error loading services</div>
        ) : (filtered || []).length === 0 ? (
          <div className="p-12 text-center">
            <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No services found</p>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((s: ServiceItem) => (
              <div key={s.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-grow">
                    <p className="font-semibold">{s.serviceName}</p>
                    <p className="text-sm text-gray-600">{s.description || 'No description'}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-600">
                        {s.category || 'Uncategorized'}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        ${s.basePrice?.toFixed(2) ?? '-'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedService(s);
                        setShowEditModal(true);
                      }}
                      className="p-2 text-blue-600 hover:text-blue-800"
                      title="Edit Service"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => s.id && handleDeleteService(s.id)}
                      className="p-2 text-red-600 hover:text-red-800"
                      title="Delete Service"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

        {/* Add Service Modal */}
        {showAddModal && (
          <ServiceFormModal
            title="Add New Service"
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAddService}
          />
        )}

        {/* Edit Service Modal */}
        {showEditModal && selectedService && (
          <ServiceFormModal
            title="Edit Service"
            onClose={() => {
              setShowEditModal(false);
              setSelectedService(null);
            }}
            onSubmit={handleUpdateService}
            initialData={selectedService}
          />
        )}
    </div>
  );
};

interface ServiceFormModalProps {
  title: string;
  onClose: () => void;
  onSubmit: (data: ServiceFormData) => void;
  initialData?: ServiceItem;
}

const ServiceFormModal: React.FC<ServiceFormModalProps> = ({
  title,
  onClose,
  onSubmit,
  initialData
}) => {
  const [formData, setFormData] = useState<ServiceFormData>({
    serviceName: initialData?.serviceName || "",
    category: initialData?.category || "OTHER",
    description: initialData?.description || "",
    basePrice: initialData?.basePrice ?? 0,
    estimatedDurationMinutes: initialData?.estimatedDurationMinutes ?? 30
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Name*
            </label>
            <input
              type="text"
              value={formData.serviceName}
              onChange={(e) =>
                setFormData({ ...formData, serviceName: e.target.value })
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="MAINTENANCE">Maintenance</option>
              <option value="REPAIR">Repair</option>
              <option value="INSPECTION">Inspection</option>
              <option value="TIRE_SERVICE">Tire Service</option>
              <option value="ELECTRICAL">Electrical</option>
              <option value="BODYWORK">Bodywork</option>
              <option value="DIAGNOSTIC">Diagnostic</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.basePrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    basePrice: e.target.value ? parseFloat(e.target.value) : 0
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Duration (minutes)
              </label>
              <input
                type="number"
                step="1"
                min={1}
                value={formData.estimatedDurationMinutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimatedDurationMinutes: e.target.value ? parseInt(e.target.value) : 0
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              {initialData ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServicesManagement;
