// TradingConfirmationPage.tsx
import React from "react";
import ConfirmationPage, { ConfirmationPageProps } from "./ConfirmationPage";
import {TradeData} from "@/app/components/trading/TradeData";

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
