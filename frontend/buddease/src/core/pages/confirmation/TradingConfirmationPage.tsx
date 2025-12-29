// TradingConfirmationPage.tsx
import { TradeData } from "@/core/components/trading/TradeData";
import ConfirmationPage, { ConfirmationPageProps } from "@/core/pages/confirmation/ConfirmationPage";
import React from "react";

interface TradingConfirmationPageProps extends ConfirmationPageProps {
  tradeDetails: string;
  tradeData: TradeData;
}

const TradingConfirmationPage: React.FC<TradingConfirmationPageProps> = ({
  title,
  message,
  tradeData,
  onConfirm,
  tradeDetails,
}) => {
  return (
    <ConfirmationPage title={title} message={message} onConfirm={onConfirm}>
      {tradeDetails && <p>Trade Details: {tradeDetails}</p>}
    </ConfirmationPage>
  );
};

export default TradingConfirmationPage;
