// stepTypes.ts
// StepTypes.ts - Optimized hybrid solution for your project management + crypto app
// ============================================================================
// CORE TYPES - Define your app's specific domains
// ============================================================================

export type AppStepType = 
  | 'onboarding'        // User registration & setup
  | 'ideation'          // Brainstorming phase
  | 'team-building'     // Team collaboration  
  | 'product-launch'    // Launch phase
  | 'data-analysis'     // Data analysis phase
  | 'crypto-management' // Crypto portfolio management
  | 'crypto-trading'    // Crypto trading
  | 'community'         // Community engagement
  | 'communication'     // Audio/video/text communication
  | 'task-management';  // Project task management

// ============================================================================
// DOMAIN INTERFACES - App-specific data structures
// ============================================================================

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  phase: AppStepType;
  teamMembers?: string[];
  tasks?: Task[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo?: string;
}

export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  value: number;
  change: number;
}

export interface TradeData {
  assetId: string;
  action: 'buy' | 'sell';
  amount: number;
  price: number;
}

export interface CommunicationData {
  type: 'audio' | 'video' | 'text';
  participants: string[];
  recording?: boolean;
  messages?: Message[];
}

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
}

// ============================================================================
// COMPOSABLE BUILDING BLOCKS - Reusable prop interfaces
// ============================================================================

export interface CommonStepProps {
  title: string;
  currentStep?: number;
  totalSteps?: number;
  isLoading?: boolean;
  projectId?: string;
}

export interface NavigationProps {
  onNext?: () => void;
  onPrevious?: () => void;
  onCompletePhase?: (data: any) => void;
}

export interface ProjectProps {
  projectData?: ProjectData;
  onUpdateProject?: (updates: Partial<ProjectData>) => void;
}

export interface TaskProps {
  tasks?: Task[];
  onAddTask?: (task: Omit<Task, 'id'>) => void;
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
}

export interface CryptoProps {
  cryptoAssets?: CryptoAsset[];
  portfolioValue?: number;
  onTrade?: (trade: TradeData) => void;
  onAddAsset?: (asset: Omit<CryptoAsset, 'id'>) => void;
}

export interface CommunicationProps {
  communicationData?: CommunicationData;
  onStartCommunication?: (type: CommunicationData['type']) => void;
  onSendMessage?: (message: Omit<Message, 'id' | 'timestamp'>) => void;
}

export interface CommunityProps {
  communityMembers?: string[];
  onJoinCommunity?: () => void;
  onPostMessage?: (content: string) => void;
}

export interface FormProps {
  formData?: any;
  onInputChange?: (field: string, value: any) => void;
}

export interface ActionProps {
  onSubmit?: (data?: any) => void;
  onConfirm?: () => void;
  onSave?: () => void;
}

// ============================================================================
// DISCRIMINATED UNION TYPES - Type-safe step definitions
// ============================================================================

export interface OnboardingStepProps extends
  CommonStepProps,
  Required<NavigationProps>,
  Required<Pick<FormProps, 'formData' | 'onInputChange'>>,
  Required<Pick<ActionProps, 'onSubmit'>> {
  type: 'onboarding';
}

export interface IdeationStepProps extends
  CommonStepProps,
  NavigationProps,
  ProjectProps,
  CommunicationProps {
  type: 'ideation';
  brainstormingSessionId?: string;
  onGenerateIdea?: (idea: string) => void;
  onVoteIdea?: (ideaId: string, vote: 'up' | 'down') => void;
}

export interface ProductLaunchStepProps extends
  CommonStepProps,
  NavigationProps,
  ProjectProps,
  TaskProps {
  type: 'product-launch';
  launchDate?: Date;
  marketingMaterials?: string[];
  onScheduleLaunch?: (date: Date) => void;
}

export interface DataAnalysisStepProps extends
  CommonStepProps,
  NavigationProps,
  ProjectProps {
  type: 'data-analysis';
  metrics?: Record<string, number>;
  insights?: string[];
  onAnalyzeData?: (data: any) => void;
  onGenerateReport?: () => void;
}

export interface CryptoTradingStepProps extends
  CommonStepProps,
  NavigationProps,
  CryptoProps {
  type: 'crypto-trading';
  marketData?: any;
  selectedAsset?: string;
  onExecuteTrade: (trade: TradeData) => Promise<void>;
}

export interface CryptoManagementStepProps extends
  CommonStepProps,
  CryptoProps,
  CommunityProps {
  type: 'crypto-management';
  onViewPortfolio: () => void;
  onSetAlerts?: (assetId: string, conditions: any) => void;
}

export interface CommunicationStepProps extends
  CommonStepProps,
  CommunicationProps {
  type: 'communication';
  activeCommunication?: CommunicationData;
  onToggleRecording?: () => void;
  onInviteParticipant?: (userId: string) => void;
}

// ============================================================================
// UNION TYPE - All possible step types
// ============================================================================

export type AppStepProps = 
  | OnboardingStepProps
  | IdeationStepProps
  | ProductLaunchStepProps
  | DataAnalysisStepProps
  | CryptoTradingStepProps
  | CryptoManagementStepProps
  | CommunicationStepProps;

// ============================================================================
// COMPOSABLE TYPE - Maximum reusability
// ============================================================================

export type ComposableAppStepProps = CommonStepProps & {
  type: AppStepType;
} & Partial<NavigationProps & ProjectProps & TaskProps & CryptoProps & 
           CommunicationProps & CommunityProps & FormProps & ActionProps>;

// ============================================================================
// UTILITY TYPES & HELPERS
// ============================================================================

// Extract required props for specific step type
export type RequiredPropsFor<T extends AppStepType> = 
  T extends 'onboarding' ? OnboardingStepProps :
  T extends 'ideation' ? IdeationStepProps :
  T extends 'product-launch' ? ProductLaunchStepProps :
  T extends 'data-analysis' ? DataAnalysisStepProps :
  T extends 'crypto-trading' ? CryptoTradingStepProps :
  T extends 'crypto-management' ? CryptoManagementStepProps :
  T extends 'communication' ? CommunicationStepProps : never;

// Type guard helpers
export function isOnboardingStep(props: AppStepProps): props is OnboardingStepProps {
  return props.type === 'onboarding';
}

export function isIdeationStep(props: AppStepProps): props is IdeationStepProps {
  return props.type === 'ideation';
}

export function isCryptoTradingStep(props: AppStepProps): props is CryptoTradingStepProps {
  return props.type === 'crypto-trading';
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

// Create step props with type safety
export function createStepProps<T extends AppStepType>(
  type: T,
  baseProps: CommonStepProps,
  specificProps: Partial<RequiredPropsFor<T>>
): RequiredPropsFor<T> {
  return {
    type,
    ...baseProps,
    ...specificProps
  } as RequiredPropsFor<T>;
}

// Step factory for common patterns
export const StepFactory = {
  createOnboarding: (props: Omit<OnboardingStepProps, 'type'>): OnboardingStepProps => ({
    type: 'onboarding',
    ...props
  }),
  
  createIdeation: (props: Omit<IdeationStepProps, 'type'>): IdeationStepProps => ({
    type: 'ideation',
    ...props
  }),
  
  createCryptoTrading: (props: Omit<CryptoTradingStepProps, 'type'>): CryptoTradingStepProps => ({
    type: 'crypto-trading',
    ...props
  }),
};

// ============================================================================
// REACT COMPONENTS & HOOKS
// ============================================================================

// Type-safe step renderer
export const AppStepRenderer: React.FC<AppStepProps> = (props) => {
  switch (props.type) {
    case 'onboarding':
      return <OnboardingStep {...props} />;
    case 'ideation':
      return <IdeationStep {...props} />;
    case 'product-launch':
      return <ProductLaunchStep {...props} />;
    case 'data-analysis':
      return <DataAnalysisStep {...props} />;
    case 'crypto-trading':
      return <CryptoTradingStep {...props} />;
    case 'crypto-management':
      return <CryptoManagementStep {...props} />;
    case 'communication':
      return <CommunicationStep {...props} />;
    default:
      const _exhaustiveCheck: never = props;
      return null;
  }
};


// Hook for step-specific logic
export function useStep<T extends AppStepType>(type: T, props: RequiredPropsFor<T>) {
  const commonLogic = {
    canProceed: !props.isLoading,
    stepNumber: props.currentStep,
    totalSteps: props.totalSteps,
    isFirstStep: props.currentStep === 1,
    isLastStep: props.currentStep === props.totalSteps,
  };

  switch (type) {
    case 'onboarding':
      return {
        ...commonLogic,
        isRegistrationComplete: Boolean(props.formData?.email && props.formData?.password),
        requiredFields: ['email', 'password', 'firstName', 'lastName'],
      };
    case 'ideation':
      return {
        ...commonLogic,
        canGenerateIdeas: true,
        maxParticipants: 10,
        availableTools: ['whiteboard', 'sticky-notes', 'vote-system'],
      };
    case 'crypto-trading':
      return {
        ...commonLogic,
        canTrade: props.cryptoAssets && props.cryptoAssets.length > 0,
        supportedAssets: ['BTC', 'ETH', 'SOL', 'ADA'],
        tradingHours: '24/7',
        minTradeAmount: 10,
      };
    default:
      return commonLogic;
  }
}

// Phase progression helper
export function getNextPhase(current: AppStepType): AppStepType | null {
  const phaseOrder: AppStepType[] = [
    'onboarding',
    'ideation',
    'team-building',
    'task-management',
    'product-launch',
    'data-analysis',
    'crypto-management',
    'community'
  ];
  
  const currentIndex = phaseOrder.indexOf(current);
  return currentIndex < phaseOrder.length - 1 ? phaseOrder[currentIndex + 1] : null;
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

// Example 1: Type-safe step creation
const onboardingExample = StepFactory.createOnboarding({
  title: 'Create Account',
  currentStep: 1,
  totalSteps: 5,
  formData: { email: '', password: '' },
  onInputChange: (field, value) => console.log(field, value),
  onNext: () => console.log('Next'),
  onPrevious: () => console.log('Previous'),
  onSubmit: () => console.log('Submit'),
});

// Example 2: Flexible composable component
export const FlexibleStep: React.FC<ComposableAppStepProps> = (props) => {
  const stepLogic = useStep(props.type, props as any);
  
  return (
    <div className="step-container">
      <h2>{props.title}</h2>
      <div className="step-info">
        Step {props.currentStep} of {props.totalSteps}
      </div>
      {props.content}
      {props.formData && <Form data={props.formData} onChange={props.onInputChange} />}
      {props.onNext && (
        <button 
          onClick={props.onNext}
          disabled={!stepLogic.canProceed}
        >
          Next
        </button>
      )}
      {props.onSubmit && (
        <button onClick={props.onSubmit}>
          Submit
        </button>
      )}
    </div>
  );
};