// TradingProcess.tsx
import axiosInstance from "@/app/api/axiosInstance";
import { useState } from "react";

import VerificationPage from "@/app/pages/profile/VerificationPage";
import TradingConfirmationPage from "@/app/pages/confirmation/TradingConfirmationPage";
import * as TradingAPI from './../../api/ApiTrading'
import TradingBasicInfoStep from "./steps/TradingBasicInfoStep";
import TradingReviewStep from "../trading/TradingReviewStep";
import TradingPreferencesStep from "./TradingPreferencesStep";
import TradingSummaryStep from "./steps/TradingSummaryStep";
import { TradingPhase } from "./crypto/CryptoTradingPhase";
import TradingAssetsStep from "./steps/TradingAssetsStep";
import { NotificationTypeEnum, useNotification } from "../support/NotificationContext";
import RiskAssessmentPage from "@/app/pages/crypto/RiskAssessmentPage";
import TraderTypesSelection from "./crypto/TraderTypesSelection";
import ProfessionalTraderProfile from "@/app/pages/personas/ProfessionalTraderProfile";
import ProfessionalTraderDashboard from "@/app/pages/personas/ProfessionalTraderDashboard";
import ProfessionalTraderCalls from "@/app/pages/personas/ProfessionalTraderCalls";
import ProfessionalTraderContentManagement from "@/app/pages/personas/ProfessionalTraderContentManagement";
import TradeData from "../trading/TradeData";


// 

const TradingProcess: React.FC = () => {
  const { notify } = useNotification();
  const [currentStep, setCurrentStep] = useState<TradingPhase>(
    TradingPhase.BASIC_INFO
  );

  const [tradeData, setTradeData] = useState<any>({
    // Initialize with default values or empty objects as needed
  });

    
    
    
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
      [TradingPhase.PROFESSIONAL_TRADER_CONTENT_MANAGEMENT]: ProfessionalTraderContentManagement
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
      const response = await axiosInstance.post("/api/trading-process", tradeData);
      console.log("Server response:", response.data);
      setCurrentStep(TradingPhase.CONFIRMATION);
      notify(
        "tradeCreationSuccess" + tradeData._id,
        "Trade has been successfully created",
        "success",
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );
    } catch (error) {
      console.error("Error creating trade:", error);
      notify(
        "tradeCreationFailure" + tradeData._id,
        "Error creating trade",
        "error",
        new Date(),
        NotificationTypeEnum.OperationError
      );
    }
  };

  const handleConfirmation = async (tradeData: any) => {
    try {
      // Example: Send confirmation request to the server using Axios
      const response = await TradingAPI.confirmTradeCreation(tradeData);

      // Handle the server response if needed
      console.log("Server response:", response);

      // Notify user of successful trade confirmation
      notify(
        "tradeConfirmationSuccess" + tradeData._id,
        "Your trade has been successfully confirmed",
        "TradeConfirmationSuccess",
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );

      // Perform additional actions as needed, such as updating the UI or navigating to a different page
    } catch (error) {
      // Handle any network or unexpected errors
      console.error("Error confirming trade creation:", error);
      notify(
        "tradeConfirmationFailure" + tradeData._id,
        "There was an error confirming your trade, please try again",
        "TradeConfirmationError",
        new Date(),
        NotificationTypeEnum.OperationError
      );
    }
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
        <TradingReviewStep onSubmit={handleReviewSubmit} />
      )}
      {currentStep === TradingPhase.SUMMARY && (
        <TradingSummaryStep tradeData={tradeData} />
      )}
      {currentStep === TradingPhase.CONFIRMATION && (
        <TradingConfirmationPage
          tradeData={tradeData}
          onConfirm={() => handleConfirmation(tradeData)}
        />
      )}
    </div>
  );
};

export default TradingProcess;
