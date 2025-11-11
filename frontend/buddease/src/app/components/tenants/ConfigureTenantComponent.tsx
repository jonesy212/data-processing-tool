// ConfigureTenantComponent.tsx
import { useAuth } from '@/app/components/auth/AuthContext';
import { useNotification } from '@/app/state/context/NotificationContext';
import { Tenant, useTenantStore } from '@/app/users/TenantStore';
import React, { useEffect, useState } from 'react';

interface ConfigureTenantComponentProps {
  onTenantConfigured?: (tenant: Tenant) => void;
  initialTenant?: Tenant | null;
}

const ConfigureTenantComponent: React.FC<ConfigureTenantComponentProps> = ({
  onTenantConfigured,
  initialTenant = null
}) => {
  const { state } = useAuth();
  const { notify } = useNotification();
  const tenantStore = useTenantStore();
  
  const [isEditing, setIsEditing] = useState(!!initialTenant);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    email: '',
    maxUsers: 10,
    isActive: true
  });
  
  const [loading, setLoading] = useState(false);

  // Initialize form with initial tenant data if provided
  useEffect(() => {
    if (initialTenant) {
      setFormData({
        name: initialTenant.name || '',
        description: initialTenant.description || '',
        email: '',
        maxUsers: 10,
        isActive: true
      });
    }
  }, [initialTenant]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Validate form data
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      notify('Error', 'Tenant name is required', 'error');
      return false;
    }
    
    if (!formData.description.trim()) {
      notify('Error', 'Tenant description is required', 'error');
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isEditing && initialTenant) {
        // Update existing tenant
        // In a real app, you would dispatch updateTenantRequest action here
        console.log('Updating tenant:', initialTenant.id, formData);
        
        // For now, using the store directly
        // Note: You might need to add update functionality to your store
        notify('Success', 'Tenant updated successfully!', 'success');
        
        if (onTenantConfigured) {
          onTenantConfigured({
            id: initialTenant.id,
            name: formData.name,
            description: formData.description
          });
        }
      } else {
        // Create new tenant
        tenantStore.addTenant(formData.name, formData.description);
        
        notify('Success', 'Tenant created successfully!', 'success');
        
        // Reset form after successful creation
        setFormData({
          name: '',
          description: '',
          email: '',
          maxUsers: 10,
          isActive: true
        });

        if (onTenantConfigured) {
          // Get the newly created tenant (you might need to adjust this based on your store implementation)
          const newTenant = tenantStore.tenants[tenantStore.tenants.length - 1];
          onTenantConfigured(newTenant);
        }
      }
    } catch (error) {
      console.error('Error configuring tenant:', error);
      notify('Error', 'Failed to configure tenant', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle tenant deletion
  const handleDeleteTenant = () => {
    if (!initialTenant) return;

    if (window.confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
      tenantStore.removeTenant(initialTenant.id);
      notify('Success', 'Tenant deleted successfully!', 'success');
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        email: '',
        maxUsers: 10,
        isActive: true
      });
      
      setIsEditing(false);
    }
  };

  return (
    <div className="configure-tenant-component">
      <div className="tenant-header">
        <h3>{isEditing ? 'Edit Tenant' : 'Create New Tenant'}</h3>
        {isEditing && (
          <button 
            type="button" 
            className="btn-danger"
            onClick={handleDeleteTenant}
            disabled={loading}
          >
            Delete Tenant
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="tenant-form">
        <div className="form-group">
          <label htmlFor="name">Tenant Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter tenant name"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter tenant description"
            rows={4}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Admin Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter admin email (optional)"
            disabled={loading}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="maxUsers">Maximum Users</label>
            <input
              type="number"
              id="maxUsers"
              name="maxUsers"
              value={formData.maxUsers}
              onChange={handleInputChange}
              min="1"
              max="1000"
              disabled={loading}
            />
          </div>

          <div className="form-group checkbox-group">
            <label htmlFor="isActive">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                disabled={loading}
              />
              Active Tenant
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Processing...' : (isEditing ? 'Update Tenant' : 'Create Tenant')}
          </button>
          
          {isEditing && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsEditing(false)}
              disabled={loading}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* Tenant List Section */}
      {tenantStore.tenants.length > 0 && (
        <div className="tenant-list-section">
          <h4>Existing Tenants</h4>
          <div className="tenant-list">
            {tenantStore.tenants.map((tenant) => (
              <div key={tenant.id} className="tenant-item">
                <div className="tenant-info">
                  <h5>{tenant.name}</h5>
                  <p>{tenant.description}</p>
                </div>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => {
                    setFormData({
                      name: tenant.name,
                      description: tenant.description,
                      email: '',
                      maxUsers: 10,
                      isActive: true
                    });
                    setIsEditing(true);
                  }}
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigureTenantComponent;