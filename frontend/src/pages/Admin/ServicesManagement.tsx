import React, { useEffect, useState } from "react";
import { Wrench, Plus, Search } from "lucide-react";
import { listAllServices, addService, AdminServiceDTO, ServiceItem } from "../../api/services";

const ServicesManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAdd, setShowAdd] = useState<boolean>(false);
  const [form, setForm] = useState<AdminServiceDTO>({ serviceName: "", description: "", price: undefined, serviceType: "" });

  useEffect(() => {
    (async () => {
      try {
        const data = await listAllServices();
        setServices(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Services Management</h1>
          <p className="text-gray-600 mt-1">Manage service types and pricing</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
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
              <p className="text-2xl font-bold text-gray-900">{services.length}</p>
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
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="p-12 text-center">
            <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No services found</p>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services
              .filter(s => !searchTerm || s.name?.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((s, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{s.name}</p>
                      {s.description ? (
                        <p className="text-sm text-gray-600 mt-1">{s.description}</p>
                      ) : null}
                    </div>
                    <Wrench className="w-6 h-6 text-blue-600" />
                  </div>
                  {typeof s.price === "number" ? (
                    <p className="mt-2 text-sm text-gray-700">${s.price.toFixed(2)}</p>
                  ) : null}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
            <h2 className="text-xl font-semibold">Add Service</h2>
            <div className="space-y-3">
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Service Name"
                value={form.serviceName || ""}
                onChange={e => setForm({ ...form, serviceName: e.target.value })}
              />
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Service Type (optional)"
                value={form.serviceType || ""}
                onChange={e => setForm({ ...form, serviceType: e.target.value })}
              />
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Price (optional)"
                type="number"
                value={form.price ?? ""}
                onChange={e => setForm({ ...form, price: e.target.value ? Number(e.target.value) : undefined })}
              />
              <textarea
                className="w-full border rounded px-3 py-2"
                placeholder="Description (optional)"
                value={form.description || ""}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded border">Cancel</button>
              <button
                onClick={async () => {
                  await addService(form);
                  const updated = await listAllServices();
                  setServices(updated);
                  setShowAdd(false);
                  setForm({ serviceName: "", description: "", price: undefined, serviceType: "" });
                }}
                className="px-4 py-2 rounded bg-blue-600 text-white"
                disabled={!form.serviceName}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesManagement;
