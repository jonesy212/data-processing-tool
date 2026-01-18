// ProjectCreationForm.tsx
import type { ClientProjectEntity, ProjectType } from '@/core/models/projects/Project';
import { useAuth } from '@/core/state/context/AuthContext';
import { useNotification } from '@/core/state/context/NotificationContext';
import type { AllStatus } from '@/core/state/stores/DetailsListStore';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

interface ProjectCreationFormProps {
  onSubmit?: (project: ClientProjectEntity) => void;
  onCancel?: () => void;
  initialData?: Partial<ClientProjectEntity>;
  teams?: Array<{ id: string; name: string }>;
  users?: Array<{ id: string; name: string }>;
  mode?: 'create' | 'edit';
}

const ProjectCreationForm: React.FC<ProjectCreationFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  teams = [],
  users = [],
  mode = 'create'
}) => {
  const { state: authState } = useAuth();
  const { notify } = useNotification();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<ClientProjectEntity>>({
    name: '',
    title: '',
    description: '',
    status: 'draft' as AllStatus,
    type: ProjectType.Default,
    isActive: true,
    priority: 'medium',
    members: [],
    leader: null,
    currentTeam: undefined,
    startDate: undefined,
    endDate: undefined,
    dueDate: null,
    budget: null,
    cryptoBudget: 0,
    phases: [],
    currentPhase: null,
    progress: 0,
    tasks: [],
    comments: [],
    ideas: [],
    attachments: [],
    associatedWallet: '',
    cryptoTransactions: [],
    tradingStrategy: 'moderate',
    hasCryptoSection: false,
    videoUrl: '',
    videoThumbnail: '',
    videoDuration: 0,
    analysisType: undefined,
    analysisResults: [],
    tags: [],
    categories: [],
    customProperty: '',
    visibility: 'private',
    collaborationOptions: [],
    communicationChannels: {
      audio: false,
      video: false,
      text: true
    }
  });

  // Initialize form with initial data
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }));
    }
  }, [initialData]);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Handle number input changes
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? null : Number(value)
    }));
  };

  // Handle date changes
  const handleDateChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value ? new Date(value) : undefined
    }));
  };

  // Handle member selection
  const handleMemberToggle = (memberId: string) => {
    setFormData(prev => {
      const currentMembers = prev.members || [];
      const isSelected = currentMembers.includes(memberId);
      
      return {
        ...prev,
        members: isSelected 
          ? currentMembers.filter(id => id !== memberId)
          : [...currentMembers, memberId]
      };
    });
  };

  // Handle leader selection
  const handleLeaderChange = (leaderId: string) => {
    setFormData(prev => ({
      ...prev,
      leader: leaderId || null
    }));
  };

  // Handle team selection
  const handleTeamChange = (teamId: string) => {
    setFormData(prev => ({
      ...prev,
      currentTeam: teamId || undefined
    }));
  };

  // Handle crypto section toggle
  const handleCryptoSectionToggle = (enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      hasCryptoSection: enabled,
      cryptoBudget: enabled ? prev.cryptoBudget || 0 : 0,
      tradingStrategy: enabled ? 'moderate' : undefined
    }));
  };

  // Handle collaboration options
  const handleCollaborationToggle = (optionType: string, enabled: boolean) => {
    setFormData(prev => {
      const currentOptions = prev.collaborationOptions || [];
      const existingOption = currentOptions.find(opt => opt.type === optionType);
      
      let newOptions;
      if (enabled && !existingOption) {
        newOptions = [...currentOptions, { type: optionType as any, enabled: true }];
      } else if (!enabled && existingOption) {
        newOptions = currentOptions.filter(opt => opt.type !== optionType);
      } else {
        newOptions = currentOptions;
      }
      
      return {
        ...prev,
        collaborationOptions: newOptions
      };
    });
  };

  // Handle communication channels
  const handleCommunicationToggle = (channel: keyof typeof formData.communicationChannels, enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      communicationChannels: {
        ...prev.communicationChannels,
        [channel]: enabled
      }
    }));
  };

  // Handle tags input
  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!formData.name?.trim()) {
      notify('Error', 'Project name is required', 'error');
      return false;
    }

    if (!formData.title?.trim()) {
      notify('Error', 'Project title is required', 'error');
      return false;
    }

    if (!formData.description?.trim()) {
      notify('Error', 'Project description is required', 'error');
      return false;
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      notify('Error', 'End date cannot be before start date', 'error');
      return false;
    }

    if (formData.budget !== null && formData.budget < 0) {
      notify('Error', 'Budget cannot be negative', 'error');
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
      // Prepare the complete project data
      const projectData: ClientProjectEntity = {
        // Base fields
        id: formData.id || `proj-${Date.now()}`,
        createdAt: formData.createdAt || new Date(),
        updatedAt: new Date(),
        
        // Required fields
        name: formData.name!,
        title: formData.title!,
        description: formData.description!,
        status: formData.status!,
        type: formData.type!,
        isActive: formData.isActive!,
        
        // Optional fields with defaults
        priority: formData.priority,
        members: formData.members || [],
        leader: formData.leader,
        currentTeam: formData.currentTeam,
        startDate: formData.startDate,
        endDate: formData.endDate,
        dueDate: formData.dueDate,
        budget: formData.budget,
        cryptoBudget: formData.cryptoBudget,
        phases: formData.phases || [],
        currentPhase: formData.currentPhase,
        progress: formData.progress || 0,
        tasks: formData.tasks || [],
        comments: formData.comments || [],
        ideas: formData.ideas || [],
        attachments: formData.attachments || [],
        associatedWallet: formData.associatedWallet,
        cryptoTransactions: formData.cryptoTransactions || [],
        tradingStrategy: formData.tradingStrategy,
        hasCryptoSection: formData.hasCryptoSection || false,
        videoUrl: formData.videoUrl,
        videoThumbnail: formData.videoThumbnail,
        videoDuration: formData.videoDuration || 0,
        analysisType: formData.analysisType,
        analysisResults: formData.analysisResults || [],
        tags: formData.tags || [],
        categories: formData.categories || [],
        customProperty: formData.customProperty,
        visibility: formData.visibility || 'private',
        collaborationOptions: formData.collaborationOptions || [],
        communicationChannels: formData.communicationChannels || {
          audio: false,
          video: false,
          text: true
        },
        
        // Metadata
        createdBy: authState.user?.id || 'unknown',
        updatedBy: authState.user?.id || 'unknown',
        
        // Status flags
        isArchived: false,
        isCompleted: false,
        isBeingEdited: false,
        isBeingDeleted: false,
        isBeingCompleted: false,
        isBeingReassigned: false
      };

      // Call onSubmit callback if provided
      if (onSubmit) {
        await onSubmit(projectData);
      }

      // Show success message
      notify('Success', `Project ${mode === 'create' ? 'created' : 'updated'} successfully!`, 'success');

    } catch (error) {
      console.error('Error saving project:', error);
      notify('Error', `Failed to ${mode === 'create' ? 'create' : 'update'} project`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="project-creation-form">
      <div className="form-header">
        <h2>{mode === 'create' ? 'Create New Project' : 'Edit Project'}</h2>
        {onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="project-form">
        {/* Basic Information Section */}
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label htmlFor="name">Project Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              placeholder="Enter project name"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="title">Project Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title || ''}
              onChange={handleInputChange}
              placeholder="Enter project title"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              placeholder="Enter project description"
              rows={4}
              required
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Project Type *</label>
              <select
                id="type"
                name="type"
                value={formData.type || ProjectType.Default}
                onChange={handleInputChange}
                disabled={loading}
              >
                {Object.values(ProjectType).map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status *</label>
              <select
                id="status"
                name="status"
                value={formData.status || 'draft'}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority || 'medium'}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-group checkbox-group">
              <label htmlFor="isActive">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive || false}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                Active Project
              </label>
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="form-section">
          <h3>Timeline</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate ? formData.startDate.toISOString().split('T')[0] : ''}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate ? formData.endDate.toISOString().split('T')[0] : ''}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">Due Date</label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate ? formData.dueDate.toISOString().split('T')[0] : ''}
              onChange={(e) => handleDateChange('dueDate', e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {/* Team & Collaboration Section */}
        <div className="form-section">
          <h3>Team & Collaboration</h3>
          
          {teams.length > 0 && (
            <div className="form-group">
              <label htmlFor="currentTeam">Assigned Team</label>
              <select
                id="currentTeam"
                name="currentTeam"
                value={formData.currentTeam || ''}
                onChange={(e) => handleTeamChange(e.target.value)}
                disabled={loading}
              >
                <option value="">No team assigned</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {users.length > 0 && (
            <>
              <div className="form-group">
                <label htmlFor="leader">Project Leader</label>
                <select
                  id="leader"
                  name="leader"
                  value={formData.leader || ''}
                  onChange={(e) => handleLeaderChange(e.target.value)}
                  disabled={loading}
                >
                  <option value="">No leader assigned</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Team Members</label>
                <div className="members-list">
                  {users.map(user => (
                    <div key={user.id} className="member-checkbox">
                      <label>
                        <input
                          type="checkbox"
                          checked={(formData.members || []).includes(user.id)}
                          onChange={() => handleMemberToggle(user.id)}
                          disabled={loading}
                        />
                        {user.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Budget Section */}
        <div className="form-section">
          <h3>Budget & Financials</h3>
          
          <div className="form-group">
            <label htmlFor="budget">Total Budget</label>
            <input
              type="number"
              id="budget"
              name="budget"
              value={formData.budget || ''}
              onChange={handleNumberChange}
              placeholder="Enter total budget"
              min="0"
              step="0.01"
              disabled={loading}
            />
          </div>

          <div className="form-group checkbox-group">
            <label htmlFor="hasCryptoSection">
              <input
                type="checkbox"
                id="hasCryptoSection"
                name="hasCryptoSection"
                checked={formData.hasCryptoSection || false}
                onChange={(e) => handleCryptoSectionToggle(e.target.checked)}
                disabled={loading}
              />
              Include Crypto Section
            </label>
          </div>

          {formData.hasCryptoSection && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cryptoBudget">Crypto Budget</label>
                <input
                  type="number"
                  id="cryptoBudget"
                  name="cryptoBudget"
                  value={formData.cryptoBudget || 0}
                  onChange={handleNumberChange}
                  placeholder="Enter crypto budget"
                  min="0"
                  step="0.01"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="tradingStrategy">Trading Strategy</label>
                <select
                  id="tradingStrategy"
                  name="tradingStrategy"
                  value={formData.tradingStrategy || 'moderate'}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  <option value="conservative">Conservative</option>
                  <option value="moderate">Moderate</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Collaboration Features */}
        <div className="form-section">
          <h3>Collaboration Features</h3>
          
          <div className="form-group">
            <label>Communication Channels</label>
            <div className="channels-list">
              <label>
                <input
                  type="checkbox"
                  checked={formData.communicationChannels?.text || false}
                  onChange={(e) => handleCommunicationToggle('text', e.target.checked)}
                  disabled={loading}
                />
                Text Chat
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={formData.communicationChannels?.audio || false}
                  onChange={(e) => handleCommunicationToggle('audio', e.target.checked)}
                  disabled={loading}
                />
                Audio Calls
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={formData.communicationChannels?.video || false}
                  onChange={(e) => handleCommunicationToggle('video', e.target.checked)}
                  disabled={loading}
                />
                Video Calls
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Collaboration Options</label>
            <div className="collaboration-options">
              <label>
                <input
                  type="checkbox"
                  checked={formData.collaborationOptions?.some(opt => opt.type === 'brainstorming') || false}
                  onChange={(e) => handleCollaborationToggle('brainstorming', e.target.checked)}
                  disabled={loading}
                />
                Brainstorming
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={formData.collaborationOptions?.some(opt => opt.type === 'file-sharing') || false}
                  onChange={(e) => handleCollaborationToggle('file-sharing', e.target.checked)}
                  disabled={loading}
                />
                File Sharing
              </label>
            </div>
          </div>
        </div>

        {/* Metadata Section */}
        <div className="form-section">
          <h3>Metadata</h3>
          
          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={(formData.tags || []).join(', ')}
              onChange={(e) => handleTagsChange(e.target.value)}
              placeholder="Enter tags separated by commas"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="visibility">Visibility</label>
            <select
              id="visibility"
              name="visibility"
              value={formData.visibility || 'private'}
              onChange={handleInputChange}
              disabled={loading}
            >
              <option value="private">Private</option>
              <option value="team">Team</option>
              <option value="public">Public</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="customProperty">Custom Property</label>
            <input
              type="text"
              id="customProperty"
              name="customProperty"
              value={formData.customProperty || ''}
              onChange={handleInputChange}
              placeholder="Enter custom property"
              disabled={loading}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Processing...' : (mode === 'create' ? 'Create Project' : 'Update Project')}
          </button>
          
          {onCancel && (
            <button
              type="button"
              className="btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProjectCreationForm;