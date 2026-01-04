FeatureFiles.tsx
app/features/prompts/FeatureFiles.tsx
import { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import { useNotification } from "@/core/state/context/NotificationContext";
import { FeaturePrompt } from '@/core/typings/promptTypes';
import {
    FolderOutlined,
    LinkOutlined,
    LockOutlined,
    SearchOutlined,
    TeamOutlined,
    UploadOutlined
} from '@ant-design/icons';
import {
    Button,
    Card,
    Input,
    List,
    Modal,
    Select,
    Space,
    Tag,
    Upload
} from 'antd';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
Types
export interface Subject {
  id: string;
  name: string;
  description?: string;
  color: string;
}

export interface Conversation {
  id: string;
  title: string;
  subjectId: string;
  prompts: string[]; // FeaturePrompt IDs in order
  participants: string[]; // User IDs
  accessLevel: 'private' | 'team' | 'public' | 'community';
  createdAt: Date;
}

export interface DocumentFile {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  subjectIds: string[];
  conversationIds: string[];
  accessLevel: 'private' | 'team' | 'public' | 'community';
  uploadedBy: string;
  uploadedAt: Date;
}

interface FeatureFilesState {
  subjects: Subject[];
  prompts: FeaturePrompt[];
  conversations: Conversation[];
  documents: DocumentFile[];
  searchQuery: string;
  selectedSubject: string | null;
  selectedAccessLevel: string | null;
}

const FeatureFiles: React.FC = () => {
  const dispatch = useDispatch();
  const { notify } = useNotification();
  
  const [state, setState] = useState<FeatureFilesState>({
    subjects: [],
    prompts: [],
    conversations: [],
    documents: [],
    searchQuery: '',
    selectedSubject: null,
    selectedAccessLevel: null
  });

  const [isLinkModalVisible, setIsLinkModalVisible] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<FeaturePrompt | null>(null);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);

  // Sample data - replace with actual API calls
app/features/prompts/FeatureFiles.tsx - Updated sample subjects
const sampleSubjects: Subject[] = [
  // Project Management & Collaboration
  { id: '1', name: 'Project Planning', color: '#1890ff' },
  { id: '2', name: 'Team Collaboration', color: '#52c41a' },
  { id: '3', name: 'Task Management', color: '#faad14' },
  { id: '4', name: 'Communication Tools', color: '#13c2c2' },
  
  // Product Development Phases
  { id: '5', name: 'Ideation & Brainstorming', color: '#722ed1' },
  { id: '6', name: 'Product Design', color: '#eb2f96' },
  { id: '7', name: 'Development', color: '#fa541c' },
  { id: '8', name: 'Testing & QA', color: '#a0d911' },
  { id: '9', name: 'Launch & Deployment', color: '#2f54eb' },
  
  // Data & Analytics
  { id: '10', name: 'Data Analysis', color: '#f759ab' },
  { id: '11', name: 'Market Research', color: '#9254de' },
  { id: '12', name: 'User Analytics', color: '#36cfc9' },
  { id: '13', name: 'Performance Metrics', color: '#ff7a45' },
  
  // Crypto & Blockchain
  { id: '14', name: 'Cryptocurrency Trading', color: '#ff4d4f' },
  { id: '15', name: 'Portfolio Management', color: '#597ef7' },
  { id: '16', name: 'Market Analysis', color: '#ffa940' },
  { id: '17', name: 'Blockchain Technology', color: '#73d13d' },
  { id: '18', name: 'Crypto Community', color: '#ffec3d' },
  
  // Communication Features
  { id: '19', name: 'Audio Communication', color: '#4096ff' },
  { id: '20', name: 'Video Conferencing', color: '#ff4d4f' },
  { id: '21', name: 'Real-time Chat', color: '#36cfc9' },
  { id: '22', name: 'File Sharing', color: '#ff7a45' },
  
  // Innovation & Strategy
  { id: '23', name: 'Innovation Strategy', color: '#722ed1' },
  { id: '24', name: 'Product Roadmap', color: '#eb2f96' },
  { id: '25', name: 'Competitive Analysis', color: '#faad14' },
  
  // Global Collaboration
  { id: '26', name: 'International Teams', color: '#389e0d' },
  { id: '27', name: 'Cross-cultural Communication', color: '#d48806' },
  { id: '28', name: 'Remote Work Tools', color: '#0958d9' },
  
  // Business & Growth
  { id: '29', name: 'Business Development', color: '#c41d7f' },
  { id: '30', name: 'Marketing Strategy', color: '#d46b08' },
  { id: '31', name: 'Customer Engagement', color: '#08979c' },
  { id: '32', name: 'Revenue Growth', color: '#d4380d' }
];

  // Load initial data
  useEffect(() => {
    setState(prev => ({
      ...prev,
      subjects: sampleSubjects,
      prompts: [],
      conversations: [],
      documents: []
    }));
  }, []);

  // Filtered data based on search and filters
  const filteredPrompts = state.prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                         prompt.content.toLowerCase().includes(state.searchQuery.toLowerCase());
    const matchesSubject = !state.selectedSubject || prompt.subjects.includes(state.selectedSubject);
    const matchesAccess = !state.selectedAccessLevel || prompt.accessLevel === state.selectedAccessLevel;
    
    return matchesSearch && matchesSubject && matchesAccess;
  });

  const filteredDocuments = state.documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(state.searchQuery.toLowerCase());
    const matchesSubject = !state.selectedSubject || doc.subjectIds.includes(state.selectedSubject);
    const matchesAccess = !state.selectedAccessLevel || doc.accessLevel === state.selectedAccessLevel;
    
    return matchesSearch && matchesSubject && matchesAccess;
  });

  // Subject Management
  const handleCreateSubject = (name: string, color: string) => {
    const newSubject: Subject = {
      id: Date.now().toString(),
      name,
      color
    };
    setState(prev => ({
      ...prev,
      subjects: [...prev.subjects, newSubject]
    }));
  };

FeaturePrompt Management
const handleCreatePrompt = (promptData: Omit<FeaturePrompt, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const newPrompt: FeaturePrompt = {
      ...promptData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setState(prev => ({
      ...prev,
      prompts: [...prev.prompts, newPrompt]
    }));
    
    // Success notification using consistent object format
    const { notify } = useNotification();
    notify({
      id: `feature_prompt_create_success_${newPrompt.id}_${Date.now()}`,
      message: `"${promptData.title}" created successfully`,
      data: {
        entityType: 'feature_prompt',
        entityId: newPrompt.id,
        action: 'create',
        promptData: {
          title: promptData.title,
          description: promptData.description,
          category: promptData.category,
          priority: promptData.priority
        },
        promptId: newPrompt.id,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success' as const,
      metadata: {
        promptCategory: promptData.category,
        promptPriority: promptData.priority,
        isFeaturePrompt: true
      }
    });
    
  } catch (error: any) {
    console.error("Error creating feature prompt:", error);
    
    // Error notification for local state operations
    const { notify } = useNotification();
    notify({
      id: `feature_prompt_create_error_${Date.now()}`,
      message: `Failed to create feature prompt: "${promptData.title}"`,
      data: {
        entityType: 'feature_prompt',
        action: 'create',
        promptData: promptData,
        originalError: error.message,
        errorType: 'FEATURE_PROMPT_CREATE_ERROR',
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_ERROR,
      level: 'error' as const
    });
    
    // Optional: Re-throw or handle the error as needed
    throw error;
  }
};

Also update other FeaturePrompt operations for consistency:

const handleUpdatePrompt = (promptId: string, updatedData: Partial<FeaturePrompt>) => {
  try {
    setState(prev => ({
      ...prev,
      prompts: prev.prompts.map(prompt => 
        prompt.id === promptId 
          ? { 
              ...prompt, 
              ...updatedData, 
              updatedAt: new Date() 
            } 
          : prompt
      )
    }));
    
    // Success notification for update
    const { notify } = useNotification();
    const updatedPrompt = getPromptById(promptId); // Assuming you have this helper
    
    notify({
      id: `feature_prompt_update_success_${promptId}_${Date.now()}`,
      message: `Feature prompt updated successfully`,
      data: {
        entityType: 'feature_prompt',
        entityId: promptId,
        action: 'update',
        updatedData: updatedData,
        promptTitle: updatedPrompt?.title || 'Unknown',
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success' as const
    });
    
  } catch (error: any) {
    console.error("Error updating feature prompt:", error);
    
    const { notify } = useNotification();
    notify({
      id: `feature_prompt_update_error_${promptId}_${Date.now()}`,
      message: `Failed to update feature prompt`,
      data: {
        entityType: 'feature_prompt',
        entityId: promptId,
        action: 'update',
        updatedData: updatedData,
        originalError: error.message,
        errorType: 'FEATURE_PROMPT_UPDATE_ERROR',
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_ERROR,
      level: 'error' as const
    });
    
    throw error;
  }
};

const handleDeletePrompt = (promptId: string) => {
  try {
    const promptToDelete = getPromptById(promptId);
    
    setState(prev => ({
      ...prev,
      prompts: prev.prompts.filter(prompt => prompt.id !== promptId)
    }));
    
    // Success notification for delete
    const { notify } = useNotification();
    notify({
      id: `feature_prompt_delete_success_${promptId}_${Date.now()}`,
      message: `"${promptToDelete?.title || 'Feature prompt'}" deleted successfully`,
      data: {
        entityType: 'feature_prompt',
        entityId: promptId,
        action: 'delete',
        promptTitle: promptToDelete?.title,
        promptCategory: promptToDelete?.category,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success' as const,
      metadata: {
        isDeleted: true,
        deletionTime: new Date().toISOString()
      }
    });
    
  } catch (error: any) {
    console.error("Error deleting feature prompt:", error);
    
    const { notify } = useNotification();
    notify({
      id: `feature_prompt_delete_error_${promptId}_${Date.now()}`,
      message: `Failed to delete feature prompt`,
      data: {
        entityType: 'feature_prompt',
        entityId: promptId,
        action: 'delete',
        originalError: error.message,
        errorType: 'FEATURE_PROMPT_DELETE_ERROR',
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_ERROR,
      level: 'error' as const
    });
    
    throw error;
  }
};

Helper function (assuming it exists or needs to be created)
const getPromptById = (promptId: string): FeaturePrompt | undefined => {
  // Implementation depends on how you access your state
  // This is just a placeholder
  return state.prompts.find(prompt => prompt.id === promptId);
};


  // Conversation Linking
  const handleLinkToConversation = (promptId: string, conversationId: string) => {
    setState(prev => ({
      ...prev,
      prompts: prev.prompts.map(prompt => 
        prompt.id === promptId 
          ? { ...prompt, conversationId }
          : prompt
      )
    }));
  };

  const handleCreateConversation = (subjectId: string, title: string) => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title,
      subjectId,
      prompts: [],
      participants: [],
      accessLevel: 'private',
      createdAt: new Date()
    };
    setState(prev => ({
      ...prev,
      conversations: [...prev.conversations, newConversation]
    }));
  };

  // Document Management
  const handleUploadDocument = (file: File, subjectIds: string[], accessLevel: string) => {
    try {
      const newDocument: DocumentFile = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
        size: file.size,
        subjectIds,
        conversationIds: [],
        accessLevel: accessLevel as any,
        uploadedBy: 'current-user', // Replace with actual user
        uploadedAt: new Date()
      };
      setState(prev => ({
        ...prev,
        documents: [...prev.documents, newDocument]
      }));
      
      // Success notification using consistent object format
      const { notify } = useNotification();
      notify({
        id: `document_upload_success_${newDocument.id}_${Date.now()}`,
        message: `"${file.name}" uploaded successfully`,
        data: {
          entityType: 'document',
          entityId: newDocument.id,
          action: 'upload',
          documentInfo: {
            name: file.name,
            type: file.type,
            size: file.size,
            subjectCount: subjectIds.length,
            accessLevel: accessLevel
          },
          fileData: {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            lastModified: file.lastModified
          },
          timestamp: new Date().toISOString()
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const,
        metadata: {
          documentType: file.type,
          fileSize: file.size,
          accessLevel: accessLevel,
          isLocalUpload: true // Flag for local vs API upload
        }
      });
      
    } catch (error: any) {
      console.error("Error uploading document:", error);
      
      // Error notification for local upload failure
      const { notify } = useNotification();
      notify({
        id: `document_upload_error_${Date.now()}`,
        message: `Failed to upload "${file.name}"`,
        data: {
          entityType: 'document',
          action: 'upload',
          documentInfo: {
            name: file.name,
            type: file.type,
            size: file.size
          },
          fileData: {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size
          },
          originalError: error.message,
          errorType: 'DOCUMENT_UPLOAD_ERROR',
          timestamp: new Date().toISOString()
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error' as const
      });
      
      // Re-throw the error if needed
      throw error;
    }
  };

  // Access Control
  const handleUpdateAccess = (itemId: string, type: 'prompt' | 'conversation' | 'document', accessLevel: string) => {
    const updateState = (prev: FeatureFilesState) => {
      if (type === 'prompt') {
        return {
          ...prev,
          prompts: prev.prompts.map(p => 
            p.id === itemId ? { ...p, accessLevel: accessLevel as any } : p
          )
        };
      } else if (type === 'conversation') {
        return {
          ...prev,
          conversations: prev.conversations.map(c => 
            c.id === itemId ? { ...c, accessLevel: accessLevel as any } : c
          )
        };
      } else {
        return {
          ...prev,
          documents: prev.documents.map(d => 
            d.id === itemId ? { ...d, accessLevel: accessLevel as any } : d
          )
        };
      }
    };
    
    setState(updateState);
  };

  // Search and Filter
  const handleSearch = (query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  };

  const handleSubjectFilter = (subjectId: string | null) => {
    setState(prev => ({ ...prev, selectedSubject: subjectId }));
  };

  const handleAccessFilter = (accessLevel: string | null) => {
    setState(prev => ({ ...prev, selectedAccessLevel: accessLevel }));
  };

  // Automation - Auto-tagging suggestion (simplified)
  const suggestTags = (content: string): string[] => {
    // Simple keyword extraction - replace with NLP service
    const keywords = content.toLowerCase().match(/\b(\w+)\b/g) || [];
    return [...new Set(keywords)].slice(0, 5);
  };

  const getAccessLevelIcon = (level: string) => {
    switch (level) {
      case 'private': return <LockOutlined style={{ color: '#ff4d4f' }} />;
      case 'team': return <TeamOutlined style={{ color: '#1890ff' }} />;
      case 'public': return <LockOutlined style={{ color: '#52c41a' }} />;
      case 'community': return <TeamOutlined style={{ color: '#faad14' }} />;
      default: return <LockOutlined />;
    }
  };

  return (
    <div className="feature-files-container p-6">
      {/* Header with Search and Filters */}
      <div className="filters-section mb-6">
        <Space size="large" wrap>
          <Input
            placeholder="Search prompts, conversations, documents..."
            prefix={<SearchOutlined />}
            value={state.searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
          />
          
          <Select
            placeholder="Filter by Subject"
            value={state.selectedSubject}
            onChange={handleSubjectFilter}
            style={{ width: 200 }}
            allowClear
          >
            {state.subjects.map(subject => (
              <Select.Option key={subject.id} value={subject.id}>
                <Tag color={subject.color}>{subject.name}</Tag>
              </Select.Option>
            ))}
          </Select>
          
          <Select
            placeholder="Filter by Access"
            value={state.selectedAccessLevel}
            onChange={handleAccessFilter}
            style={{ width: 150 }}
            allowClear
          >
            <Select.Option value="private">Private</Select.Option>
            <Select.Option value="team">Team</Select.Option>
            <Select.Option value="public">Public</Select.Option>
            <Select.Option value="community">Community</Select.Option>
          </Select>
          
          <Button 
            type="primary" 
            icon={<UploadOutlined />}
            onClick={() => setUploadModalVisible(true)}
          >
            Upload Document
          </Button>
        </Space>
      </div>

      {/* Main Content Grid */}
      <div className="content-grid grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prompts Section */}
        <Card title="Prompts" extra={<Button type="link">Create New</Button>}>
          <List
            dataSource={filteredPrompts}
            renderItem={prompt => (
              <List.Item
                actions={[
                  <Button 
                    type="link" 
                    icon={<LinkOutlined />}
                    onClick={() => {
                      setSelectedPrompt(prompt);
                      setIsLinkModalVisible(true);
                    }}
                  >
                    Link
                  </Button>,
                  <Select
                    defaultValue={prompt.accessLevel}
                    onChange={(value) => handleUpdateAccess(prompt.id, 'prompt', value)}
                    style={{ width: 100 }}
                  >
                    <Select.Option value="private">Private</Select.Option>
                    <Select.Option value="team">Team</Select.Option>
                    <Select.Option value="public">Public</Select.Option>
                    <Select.Option value="community">Community</Select.Option>
                  </Select>
                ]}
              >
                <List.Item.Meta
                  avatar={getAccessLevelIcon(prompt.accessLevel)}
                  title={prompt.title}
                  description={
                    <div>
                      <div>{prompt.content.substring(0, 100)}...</div>
                      <div className="mt-2">
                        {prompt.subjects.map(subjectId => {
                          const subject = state.subjects.find(s => s.id === subjectId);
                          return subject ? (
                            <Tag key={subjectId} color={subject.color}>
                              {subject.name}
                            </Tag>
                          ) : null;
                        })}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>

        {/* Documents Section */}
        <Card title="Documents" extra={<span>Total: {filteredDocuments.length}</span>}>
          <List
            dataSource={filteredDocuments}
            renderItem={doc => (
              <List.Item
                actions={[
                  <Select
                    defaultValue={doc.accessLevel}
                    onChange={(value) => handleUpdateAccess(doc.id, 'document', value)}
                    style={{ width: 100 }}
                  >
                    <Select.Option value="private">Private</Select.Option>
                    <Select.Option value="team">Team</Select.Option>
                    <Select.Option value="public">Public</Select.Option>
                    <Select.Option value="community">Community</Select.Option>
                  </Select>
                ]}
              >
                <List.Item.Meta
                  avatar={<FolderOutlined />}
                  title={
                    <Space>
                      {doc.name}
                      {getAccessLevelIcon(doc.accessLevel)}
                    </Space>
                  }
                  description={
                    <div>
                      <div>Size: {(doc.size / 1024 / 1024).toFixed(2)} MB</div>
                      <div className="mt-1">
                        {doc.subjectIds.map(subjectId => {
                          const subject = state.subjects.find(s => s.id === subjectId);
                          return subject ? (
                            <Tag key={subjectId} color={subject.color}>
                              {subject.name}
                            </Tag>
                          ) : null;
                        })}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </div>

      {/* Subjects Overview */}
      <Card title="Subjects" className="mt-6">
        <div className="subjects-grid grid grid-cols-2 md:grid-cols-4 gap-4">
          {state.subjects.map(subject => (
            <Card 
              key={subject.id} 
              size="small"
              style={{ borderLeft: `4px solid ${subject.color}` }}
            >
              <div className="text-center">
                <div className="font-semibold">{subject.name}</div>
                <div className="text-gray-500 text-sm">
                  {state.prompts.filter(p => p.subjects.includes(subject.id)).length} prompts
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Link FeaturePrompt Modal */}
      <Modal
        title="Link FeaturePrompt to Conversation"
        visible={isLinkModalVisible}
        onCancel={() => setIsLinkModalVisible(false)}
        footer={null}
      >
        {selectedPrompt && (
          <div>
            <p>Link "{selectedPrompt.title}" to:</p>
            <Select style={{ width: '100%' }} placeholder="Select conversation">
              {state.conversations.map(conv => (
                <Select.Option key={conv.id} value={conv.id}>
                  {conv.title}
                </Select.Option>
              ))}
            </Select>
            <div className="mt-4 text-right">
              <Button type="primary">Link</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Upload Document Modal */}
      <Modal
        title="Upload Document"
        visible={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
      >
        <Upload.Dragger
          multiple
          beforeUpload={(file) => {
            // Handle file upload
            handleUploadDocument(file, [], 'private');
            setUploadModalVisible(false);
            return false; // Prevent automatic upload
          }}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">Click or drag file to upload</p>
        </Upload.Dragger>
        
        <div className="mt-4">
          <div>Assign to Subjects:</div>
          <Select mode="multiple" style={{ width: '100%' }} placeholder="Select subjects">
            {state.subjects.map(subject => (
              <Select.Option key={subject.id} value={subject.id}>
                <Tag color={subject.color}>{subject.name}</Tag>
              </Select.Option>
            ))}
          </Select>
        </div>
      </Modal>
    </div>
  );
};

export default FeatureFiles;