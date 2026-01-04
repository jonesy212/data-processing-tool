SupportTicketComponent.tsx
SupportTicketComponent.ts
app/features/support/SupportTicketComponent.tsx
import UserSupportPhase from '@/core/features/support/UserSupportPhaseComponent';
import { RootState } from '@/core/state/redux/slices/RootSlice';
import { provideCustomerSupport } from '@/core/state/slices/ApiManagerSlice';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

Support Ticket Types
export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  phase: UserSupportPhase;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  customerId: string;
  category: SupportCategory;
  attachments?: AttachmentType[];
  messages: SupportMessage[];
  tags: string[];
  estimatedResolutionTime?: Date;
  actualResolutionTime?: Date;
  satisfactionRating?: number;
}

export interface SupportMessage {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
  isInternal: boolean;
  attachments?: AttachmentType[];
}


export enum SupportTicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  WAITING_CUSTOMER = 'waiting_customer',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  ESCALATED = 'escalated'
}

export enum SupportTicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical'
}

export enum SupportCategory {
  TECHNICAL = 'technical',
  BILLING = 'billing',
  FEATURE_REQUEST = 'feature_request',
  BUG_REPORT = 'bug_report',
  ACCOUNT = 'account',
  GENERAL = 'general'
}

interface SupportTicketComponentProps {
  ticket?: SupportTicket;
  mode?: 'create' | 'view' | 'edit';
  onTicketUpdate?: (ticket: SupportTicket) => void;
  onTicketClose?: (ticketId: string) => void;
}

const SupportTicketComponent: React.FC<SupportTicketComponentProps> = ({
  ticket,
  mode = 'view',
  onTicketUpdate,
  onTicketClose
}) => {
  const dispatch = useDispatch();
  const supportTickets = useSelector((state: RootState) => state.apiManager.supportTickets);
  
  const [currentTicket, setCurrentTicket] = useState<SupportTicket>(
    ticket || createNewTicket()
  );
  const [newMessage, setNewMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

const supportTicketsEnabled = useSelector(
    (state: RootState) => state.userSupportFeedbackPreferences.supportTicketsEnabled
  );

  // Hide component if support tickets are disabled
  if (!supportTicketsEnabled) {
    return (
      <div className="p-4 text-center text-gray-500">
        Support tickets are currently disabled
      </div>
    );
  }
  // Create a new support ticket
  function createNewTicket(): SupportTicket {
    return {
      id: `ticket-${Date.now()}`,
      title: '',
      description: '',
      status: SupportTicketStatus.OPEN,
      priority: SupportTicketPriority.MEDIUM,
      phase: UserSupportPhase.PLANNING,
      createdAt: new Date(),
      updatedAt: new Date(),
      customerId: 'current-user', // In real app, get from auth context
      category: SupportCategory.GENERAL,
      messages: [],
      tags: []
    };
  }

  // Handle ticket creation/update
  const handleSaveTicket = () => {
    if (mode === 'create') {
      const newTicket: SupportTicket = {
        ...currentTicket,
        id: `ticket-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      dispatch(provideCustomerSupport(newTicket));
    } else {
      const updatedTicket: SupportTicket = {
        ...currentTicket,
        updatedAt: new Date()
      };
      dispatch(provideCustomerSupport(updatedTicket));
      onTicketUpdate?.(updatedTicket);
    }
  };

  // Add a new message to the ticket
  const handleAddMessage = () => {
    if (!newMessage.trim()) return;

    const message: SupportMessage = {
      id: `msg-${Date.now()}`,
      userId: 'current-user', // In real app, get from auth context
      content: newMessage,
      timestamp: new Date(),
      isInternal: isInternalNote
    };

    const updatedTicket: SupportTicket = {
      ...currentTicket,
      messages: [...currentTicket.messages, message],
      updatedAt: new Date(),
      status: isInternalNote ? currentTicket.status : SupportTicketStatus.IN_PROGRESS
    };

    setCurrentTicket(updatedTicket);
    setNewMessage('');
    setIsInternalNote(false);
    
    if (mode !== 'create') {
      dispatch(provideCustomerSupport(updatedTicket));
      onTicketUpdate?.(updatedTicket);
    }
  };

  // Update ticket status
  const handleStatusChange = (newStatus: SupportTicketStatus) => {
    const updatedTicket: SupportTicket = {
      ...currentTicket,
      status: newStatus,
      updatedAt: new Date()
    };

    if (newStatus === SupportTicketStatus.RESOLVED) {
      updatedTicket.actualResolutionTime = new Date();
    }

    setCurrentTicket(updatedTicket);
    
    if (mode !== 'create') {
      dispatch(provideCustomerSupport(updatedTicket));
      onTicketUpdate?.(updatedTicket);
    }
  };

  // Update ticket priority
  const handlePriorityChange = (newPriority: SupportTicketPriority) => {
    const updatedTicket: SupportTicket = {
      ...currentTicket,
      priority: newPriority,
      updatedAt: new Date()
    };

    setCurrentTicket(updatedTicket);
    
    if (mode !== 'create') {
      dispatch(provideCustomerSupport(updatedTicket));
      onTicketUpdate?.(updatedTicket);
    }
  };

  // Update support phase
  const handlePhaseChange = (newPhase: UserSupportPhase) => {
    const updatedTicket: SupportTicket = {
      ...currentTicket,
      phase: newPhase,
      updatedAt: new Date()
    };

    setCurrentTicket(updatedTicket);
    
    if (mode !== 'create') {
      dispatch(provideCustomerSupport(updatedTicket));
      onTicketUpdate?.(updatedTicket);
    }
  };

  // Handle file attachments
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  // Close ticket
  const handleCloseTicket = () => {
    const closedTicket: SupportTicket = {
      ...currentTicket,
      status: SupportTicketStatus.CLOSED,
      updatedAt: new Date(),
      actualResolutionTime: new Date()
    };

    dispatch(provideCustomerSupport(closedTicket));
    onTicketClose?.(currentTicket.id);
  };

  // Calculate ticket age
  const getTicketAge = () => {
    const created = new Date(currentTicket.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get status color
  const getStatusColor = (status: SupportTicketStatus) => {
    switch (status) {
      case SupportTicketStatus.OPEN: return 'bg-blue-100 text-blue-800';
      case SupportTicketStatus.IN_PROGRESS: return 'bg-yellow-100 text-yellow-800';
      case SupportTicketStatus.RESOLVED: return 'bg-green-100 text-green-800';
      case SupportTicketStatus.CLOSED: return 'bg-gray-100 text-gray-800';
      case SupportTicketStatus.ESCALATED: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: SupportTicketPriority) => {
    switch (priority) {
      case SupportTicketPriority.LOW: return 'bg-green-100 text-green-800';
      case SupportTicketPriority.MEDIUM: return 'bg-yellow-100 text-yellow-800';
      case SupportTicketPriority.HIGH: return 'bg-orange-100 text-orange-800';
      case SupportTicketPriority.URGENT: return 'bg-red-100 text-red-800';
      case SupportTicketPriority.CRITICAL: return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="support-ticket-component bg-white rounded-lg shadow-lg p-6">
      {/* Ticket Header */}
      <div className="ticket-header mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            {mode === 'create' ? (
              <input
                type="text"
                placeholder="Ticket Title"
                value={currentTicket.title}
                onChange={(e) => setCurrentTicket({...currentTicket, title: e.target.value})}
                className="text-2xl font-bold border-b-2 border-gray-300 focus:border-blue-500 outline-none w-full"
              />
            ) : (
              <h1 className="text-2xl font-bold">{currentTicket.title}</h1>
            )}
            <p className="text-gray-600">Ticket #{currentTicket.id}</p>
          </div>
          
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentTicket.status)}`}>
              {currentTicket.status.replace('_', ' ').toUpperCase()}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(currentTicket.priority)}`}>
              {currentTicket.priority.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Ticket Metadata */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
          <div>
            <strong>Created:</strong> {currentTicket.createdAt.toLocaleDateString()}
          </div>
          <div>
            <strong>Age:</strong> {getTicketAge()} days
          </div>
          <div>
            <strong>Category:</strong> {currentTicket.category}
          </div>
          <div>
            <strong>Phase:</strong> {currentTicket.phase}
          </div>
        </div>
      </div>

      {/* Ticket Description */}
      <div className="ticket-description mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        {mode === 'create' || mode === 'edit' ? (
          <textarea
            value={currentTicket.description}
            onChange={(e) => setCurrentTicket({...currentTicket, description: e.target.value})}
            rows={4}
            className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe your issue in detail..."
          />
        ) : (
          <p className="text-gray-700 bg-gray-50 p-4 rounded-md">
            {currentTicket.description}
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="ticket-controls mb-6 flex flex-wrap gap-4">
        {/* Status Control */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={currentTicket.status}
            onChange={(e) => handleStatusChange(e.target.value as SupportTicketStatus)}
            className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.values(SupportTicketStatus).map(status => (
              <option key={status} value={status}>
                {status.replace('_', ' ').toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Control */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            value={currentTicket.priority}
            onChange={(e) => handlePriorityChange(e.target.value as SupportTicketPriority)}
            className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.values(SupportTicketPriority).map(priority => (
              <option key={priority} value={priority}>
                {priority.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Phase Control */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Support Phase
          </label>
          <select
            value={currentTicket.phase}
            onChange={(e) => handlePhaseChange(e.target.value as UserSupportPhase)}
            className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.values(UserSupportPhase).map(phase => (
              <option key={phase} value={phase}>
                {phase}
              </option>
            ))}
          </select>
        </div>

        {/* Save/Close Buttons */}
        <div className="flex items-end gap-2">
          <button
            onClick={handleSaveTicket}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            {mode === 'create' ? 'Create Ticket' : 'Save Changes'}
          </button>
          
          {mode !== 'create' && currentTicket.status !== SupportTicketStatus.CLOSED && (
            <button
              onClick={handleCloseTicket}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Close Ticket
            </button>
          )}
        </div>
      </div>

      {/* Message Thread */}
      <div className="message-thread mb-6">
        <h3 className="text-lg font-semibold mb-4">Conversation</h3>
        
        <div className="space-y-4 max-h-96 overflow-y-auto p-4 border border-gray-200 rounded-md">
          {currentTicket.messages.map(message => (
            <div
              key={message.id}
              className={`p-3 rounded-lg ${
                message.isInternal 
                  ? 'bg-yellow-50 border border-yellow-200' 
                  : 'bg-blue-50 border border-blue-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium">
                  {message.isInternal ? 'Internal Note' : `User ${message.userId}`}
                </span>
                <span className="text-sm text-gray-500">
                  {message.timestamp.toLocaleString()}
                </span>
              </div>
              <p className="text-gray-700">{message.content}</p>
            </div>
          ))}
          
          {currentTicket.messages.length === 0 && (
            <p className="text-gray-500 text-center py-8">No messages yet</p>
          )}
        </div>

        {/* New Message Input */}
        <div className="mt-4">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            rows={3}
            className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isInternalNote}
                  onChange={(e) => setIsInternalNote(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">Internal Note</span>
              </label>
              
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="text-sm text-gray-600"
              />
            </div>
            
            <button
              onClick={handleAddMessage}
              disabled={!newMessage.trim()}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Send Message
            </button>
          </div>
        </div>
      </div>

      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="attachments mb-6">
          <h4 className="text-md font-semibold mb-2">Attachments</h4>
          <div className="space-y-2">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">{file.name}</span>
                <span className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTicketComponent;