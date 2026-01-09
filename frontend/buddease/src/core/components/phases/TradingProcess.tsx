TradingProcess.tsx
import axiosInstance from '@/core/api/csrfToken';
import React, { useState } from "react";

import * as TradingAPI from '@/core/api/ApiTradeCore';
import { TradingPhase } from "@/core/components/phases/crypto/CryptoTradingPhase";
import TradingConfirmationPage from "@/core/pages/confirmation/TradingConfirmationPage";
import RiskAssessmentPage from "@/core/pages/crypto/RiskAssessmentPage";
import ProfessionalTraderCalls from "@/core/pages/personas/ProfessionalTraderCalls";
import ProfessionalTraderContentManagement from "@/core/pages/personas/ProfessionalTraderContentManagement";
import ProfessionalTraderDashboard from "@/core/pages/personas/ProfessionalTraderDashboard";
import ProfessionalTraderProfile from "@/core/pages/personas/ProfessionalTraderProfile";
import VerificationPage from "@/core/pages/profile/VerificationPage";
import TradingAssetsStep from "@/core/phases/steps/trading/TradingAssetsStep";
import TradingBasicInfoStep from "@/core/phases/steps/trading/TradingBasicInfoStep";
import TradingReviewStep from "@/core/phases/steps/trading/TradingReviewStep";
import TradingSummaryStep from "@/core/phases/steps/trading/TradingSummaryStep";
import {
    NotificationTypeEnum,
    useNotification,
} from '@/core/state/context/NotificationContext';
import { useStepContext } from "@/core/state/context/StepContext";
import TraderTypesSelection from "./crypto/TraderTypesSelection";
import TradingPreferencesStep from "./TradingPreferencesStep";

const TradingProcess: React.FC = () => {
  const { notify } = useNotification();
  const [currentStep, setCurrentStep] = useState<TradingPhase>(
    TradingPhase.BASIC_INFO
  );

  const [tradeData, setTradeData] = useState<any>({
    // Initialize with default values or empty objects as needed
  });


  const handleSubmit = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const { currentStep, handleNext } = useStepContext();
    const handleStepSubmit = (data: any) => {
      setTradeData({ ...tradeData, ...data });
      handleNext();
    };
    console.log("Form submitted");
    // Do something with the trade data here
    setTradeData(tradeData);
    // If the form is valid, navigate to the next step
    // else, stay on the current step
    // Note: This is just an example, you can navigate to the next step
    // without validating the form data
    handleStepSubmit(tradeData);
  }


  // Mapping of step components to their respective phases
  const stepComponents: Record<TradingPhase, React.ComponentType<any>> = {
    [TradingPhase.BASIC_INFO]: TradingBasicInfoStep,
    [TradingPhase.ASSETS]: TradingAssetsStep,
    [TradingPhase.PREFERENCES]: TradingPreferencesStep,
    [TradingPhase.REVIEW]: TradingReviewStep,
    [TradingPhase.SUMMARY]: TradingSummaryStep,
    [TradingPhase.CONFIRMATION]: TradingConfirmationPage,
    [TradingPhase.VERIFICATION]: VerificationPage,
    [TradingPhase.RISK_ASSESSMENT]: RiskAssessmentPage,
    [TradingPhase.TRADER_TYPE_SELECTION]: TraderTypesSelection,
    [TradingPhase.PROFESSIONAL_TRADER_PROFILE]: ProfessionalTraderProfile,
    [TradingPhase.PROFESSIONAL_TRADER_DASHBOARD]: ProfessionalTraderDashboard,
    [TradingPhase.PROFESSIONAL_TRADER_CALLS]: ProfessionalTraderCalls,
    [TradingPhase.PROFESSIONAL_TRADER_CONTENT_MANAGEMENT]:
      ProfessionalTraderContentManagement,
  };

  // Function to handle submission of each step
  const handleStepSubmit = (data: any, nextStep: TradingPhase) => {
    setTradeData({ ...tradeData, ...data });
    setCurrentStep(nextStep);
  };

  const handleBasicInfoSubmit = (basicInfo: any) => {
    setTradeData({ ...tradeData, basicInfo });
    setCurrentStep(TradingPhase.ASSETS);
  };

  const handleAssetsSubmit = (assets: any) => {
    setTradeData({ ...tradeData, assets });
    setCurrentStep(TradingPhase.PREFERENCES);
  };

  const handlePreferencesSubmit = (preferences: any) => {
    setTradeData({ ...tradeData, preferences });
    setCurrentStep(TradingPhase.REVIEW);
  };

const handleReviewSubmit = async () => {
  try {
    const response = await axiosInstance.post(
      "/api/trading-process",
      tradeData
    );
    console.log("Server response:", response.data);
    setCurrentStep(TradingPhase.CONFIRMATION);
    
    // Updated success notification using object format
    notify({
      id: `trade_creation_success_${tradeData._id}_${Date.now()}`,
      message: "Trade has been successfully created",
      data: {
        entityType: 'trade',
        entityId: tradeData._id || 'new',
        action: 'create',
        tradeData: tradeData,
        responseData: response.data,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success' as const,
      metadata: {
        isTradingOperation: true,
        step: 'creation'
      }
    });
  } catch (error: any) {
    console.error("Error creating trade:", error);
    
    // Enhanced error notification for trading
    const axiosError = error as AxiosError;
    let userMessage = "Error creating trade";
    let errorType = "TRADE_CREATION_ERROR";
    let requiresImmediateAttention = false;
    
    if (axiosError.response) {
      const status = axiosError.response.status;
      const errorData = axiosError.response.data as any;
      
      // Trading-specific error handling
      switch (status) {
        case 400:
          userMessage = "Invalid trade data provided";
          if (errorData?.errorCode === 'INSUFFICIENT_FUNDS') {
            userMessage = "Insufficient funds for this trade";
            errorType = "INSUFFICIENT_FUNDS_ERROR";
            requiresImmediateAttention = true;
          } else if (errorData?.errorCode === 'INVALID_PRICE') {
            userMessage = "Invalid price for this instrument";
            errorType = "INVALID_PRICE_ERROR";
          }
          break;
        case 401:
          userMessage = "Authentication required to create trades";
          break;
        case 403:
          userMessage = "Trading permission denied";
          errorType = "TRADING_PERMISSION_ERROR";
          requiresImmediateAttention = true;
          break;
        case 404:
          userMessage = "Trading instrument not found";
          break;
        case 409:
          userMessage = "Trade conflict detected";
          if (errorData?.errorCode === 'DUPLICATE_ORDER') {
            userMessage = "Duplicate order detected";
            errorType = "DUPLICATE_ORDER_ERROR";
          }
          break;
        case 422:
          userMessage = "Trade validation failed";
          if (errorData?.validationErrors) {
            userMessage = `Trade validation failed: ${Object.values(errorData.validationErrors).join(', ')}`;
          }
          break;
        case 429:
          userMessage = "Too many trading requests - please wait";
          errorType = "TRADING_RATE_LIMIT_ERROR";
          break;
        case 500:
          userMessage = "Trading server error";
          requiresImmediateAttention = true;
          break;
        case 503:
          userMessage = "Trading service temporarily unavailable";
          requiresImmediateAttention = true;
          break;
        default:
          userMessage = "Trading operation failed";
      }
    } else if (axiosError.request) {
      userMessage = "Network error: Unable to connect to trading service";
      errorType = "TRADING_NETWORK_ERROR";
      requiresImmediateAttention = true;
    }
    
    // Using consistent object format with trading context
    notify({
      id: `trade_creation_error_${tradeData._id}_${Date.now()}`,
      message: userMessage,
      data: {
        entityType: 'trade',
        entityId: tradeData._id || 'new',
        action: 'create',
        tradeData: tradeData,
        tradingContext: {
          instrument: tradeData.instrument,
          orderType: tradeData.orderType,
          side: tradeData.side,
          quantity: tradeData.quantity,
          price: tradeData.price
        },
        originalError: axiosError.message,
        statusCode: axiosError.response?.status,
        errorType: errorType,
        errorData: axiosError.response?.data,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_ERROR,
      level: 'error' as const,
      metadata: {
        isTradingError: true,
        requiresImmediateAttention: requiresImmediateAttention,
        tradingPriority: getTradingErrorPriority(errorType)
      }
    });
    
    // Additional notification for critical trading errors
    if (requiresImmediateAttention) {
      notify({
        id: `trade_critical_error_${tradeData._id}_${Date.now()}`,
        message: "Critical trading error - please review immediately",
        data: {
          entityType: 'trade',
          entityId: tradeData._id,
          action: 'critical_error_alert',
          errorType: errorType,
          requiresManualReview: true
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.ALERT,
        level: 'critical' as const,
        autoDismiss: false // Don't auto-dismiss critical trading errors
      });
    }
  }
};
  
  
const handleConfirmation = async (tradeData: any) => {
  try {
    const response = await TradingAPI.confirmTradeCreation(tradeData);
    console.log("Server response:", response);

    // Success notification using object format
    const { notify } = useNotification();
    notify({
      id: `trade_confirmation_success_${tradeData._id}_${Date.now()}`,
      message: "Your trade has been successfully confirmed",
      data: {
        entityType: 'trade',
        entityId: tradeData._id || 'unknown',
        action: 'confirm',
        originalError: undefined, // Optional: not needed for success
        extra: {
          tradeData: tradeData,
          responseData: response,
          tradeDetails: {
            symbol: tradeData.symbol,
            side: tradeData.side,
            orderType: tradeData.orderType,
            quantity: tradeData.quantity
          }
        },
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success' as const,
      metadata: {
        isTradingOperation: true,
        confirmationStatus: 'confirmed'
      }
    });
    
  } catch (error: any) {
    console.error("Error confirming trade creation:", error);
    
    // Enhanced error notification for trade confirmation
    const axiosError = error as AxiosError;
    let userMessage = "There was an error confirming your trade";
    let errorType = "TRADE_CONFIRMATION_ERROR";
    let canRetry = true;
    
    if (axiosError.response) {
      const status = axiosError.response.status;
      const errorData = axiosError.response.data as any;
      
      switch (status) {
        case 400:
          userMessage = "Invalid trade confirmation data";
          if (errorData?.errorCode === 'ORDER_EXPIRED') {
            userMessage = "Trade order has expired";
            errorType = "ORDER_EXPIRED_ERROR";
            canRetry = false;
          } else if (errorData?.errorCode === 'ORDER_FILLED') {
            userMessage = "Trade order has already been filled";
            errorType = "ORDER_FILLED_ERROR";
            canRetry = false;
          }
          break;
        case 401:
          userMessage = "Authentication required to confirm trade";
          break;
        case 403:
          userMessage = "You don't have permission to confirm this trade";
          errorType = "CONFIRMATION_PERMISSION_ERROR";
          canRetry = false;
          break;
        case 404:
          userMessage = "Trade not found for confirmation";
          errorType = "TRADE_NOT_FOUND_ERROR";
          canRetry = false;
          break;
        case 409:
          userMessage = "Trade confirmation conflict";
          if (errorData?.errorCode === 'MARKET_CLOSED') {
            userMessage = "Cannot confirm trade - market is closed";
            errorType = "MARKET_CLOSED_ERROR";
          }
          break;
        case 410:
          userMessage = "Trade confirmation expired";
          errorType = "CONFIRMATION_EXPIRED_ERROR";
          canRetry = false;
          break;
        case 422:
          userMessage = "Trade confirmation validation failed";
          break;
        case 429:
          userMessage = "Too many confirmation attempts - please wait";
          errorType = "CONFIRMATION_RATE_LIMIT_ERROR";
          break;
        case 500:
          userMessage = "Server error while confirming trade";
          break;
      }
    } else if (axiosError.request) {
      userMessage = "Network error: Unable to confirm trade";
      errorType = "CONFIRMATION_NETWORK_ERROR";
    }
    
    // Using consistent object format with proper data structure
    const { notify } = useNotification();
    notify({
      id: `trade_confirmation_error_${tradeData._id}_${Date.now()}`,
      message: userMessage,
      data: {
        entityType: 'trade',
        entityId: tradeData._id || 'unknown',
        action: 'confirm',
        originalError: axiosError.message,
        extra: {
          tradeData: tradeData,
          statusCode: axiosError.response?.status,
          errorType: errorType,
          errorData: axiosError.response?.data,
          tradeContext: {
            symbol: tradeData.symbol,
            side: tradeData.side,
            orderType: tradeData.orderType
          }
        },
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_ERROR,
      level: 'error' as const,
      metadata: {
        isTradingError: true,
        canRetry: canRetry,
        requiresManualAction: !canRetry,
        errorCategory: 'trade_confirmation'
      }
    });
    
    // Provide retry guidance if applicable
    if (canRetry) {
      setTimeout(() => {
        notify({
          id: `trade_retry_suggestion_${tradeData._id}_${Date.now()}`,
          message: "You can try confirming this trade again",
          data: {
            entityType: 'trade',
            entityId: tradeData._id,
            action: 'retry_suggestion',
            extra: {
              suggestionType: 'retry',
              originalErrorType: errorType
            },
            timestamp: new Date().toISOString()
          },
          timestamp: new Date(),
          type: NotificationTypeEnum.INFO,
          level: 'info' as const,
          action: {
            label: "Retry Now",
            onClick: () => handleConfirmation(tradeData)
          }
        });
      }, 2000);
    } else {
      // For non-retryable errors, suggest alternative action
      notify({
        id: `trade_alternative_action_${tradeData._id}_${Date.now()}`,
        message: "This trade cannot be confirmed. Please create a new trade.",
        data: {
          entityType: 'trade',
          entityId: tradeData._id,
          action: 'alternative_action_suggestion',
          extra: {
            suggestionType: 'alternative_action',
            reason: errorType,
            originalError: userMessage
          },
          timestamp: new Date().toISOString()
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.WARNING,
        level: 'warning' as const,
        action: {
          label: "Create New Trade",
          onClick: () => resetTradeForm()
        }
      });
    }
  }
};
// Helper functions for trading error handling
const getTradingErrorPriority = (errorType: string): string => {
  const highPriorityErrors = [
    'INSUFFICIENT_FUNDS_ERROR',
    'TRADING_PERMISSION_ERROR',
    'TRADING_NETWORK_ERROR',
    'ORDER_FILLED_ERROR'
  ];
  
  const mediumPriorityErrors = [
    'INVALID_PRICE_ERROR',
    'DUPLICATE_ORDER_ERROR',
    'MARKET_CLOSED_ERROR',
    'CONFIRMATION_RATE_LIMIT_ERROR'
  ];
  
  if (highPriorityErrors.includes(errorType)) return 'high';
  if (mediumPriorityErrors.includes(errorType)) return 'medium';
  return 'low';
};

const resetTradeForm = () => {
  // Implementation for resetting trade form
  console.log("Resetting trade form...");
};

  
  const StepComponent = stepComponents[currentStep];

  return (
    <div>
      <StepComponent
        onSubmit={(data: any) => handleStepSubmit(data, currentStep)}
        tradeData={tradeData}
        onConfirm={() => handleConfirmation(tradeData)}
      />

      {currentStep === TradingPhase.BASIC_INFO && (
        <TradingBasicInfoStep onSubmit={handleBasicInfoSubmit} />
      )}
      {currentStep === TradingPhase.ASSETS && (
        <TradingAssetsStep onSubmit={handleAssetsSubmit} />
      )}
      {currentStep === TradingPhase.PREFERENCES && (
        <TradingPreferencesStep onSubmit={handlePreferencesSubmit} />
      )}
      {currentStep === TradingPhase.REVIEW && (
        <TradingReviewStep
          title="Review"
          tradeData={tradeData}
          onSubmit={handleReviewSubmit}
          onConfirm={() => handleConfirmation(tradeData)}
          content={"content"}
        />
      )}
      {currentStep === TradingPhase.SUMMARY && (
        <TradingSummaryStep
          title={"Summary"}
          tradeDetails={"tradeDetails"}
          tradeData={tradeData}
          onConfirm={() => handleConfirmation(tradeData)}
          message={"trade has been created"} onSubmit={handleSubmit}        />
      )}
      {currentStep === TradingPhase.CONFIRMATION && (
        <TradingConfirmationPage
          tradeData={tradeData}
          tradeDetails={"tradeDetails"}
          title={"Trade Confirmation"}
          onConfirm={() => handleConfirmation(tradeData)}
          message={"trade has been confirmed"}
        />
      )}
    </div>
  );
};

export default TradingProcess;
