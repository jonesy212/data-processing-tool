import React, { FC } from "react";
import { DAppAdapterProps } from "../crossPlatformLayer/src/src/platform/DAppAdapter";
import { DAppAdapterConfig, DappProps } from "./DAppAdapterConfig";

class CustomDAppAdapter<T extends DappProps> {
  private adapter: FC<DAppAdapterProps>;

  constructor(config: DAppAdapterConfig<T>) {
    interface AdapterProps extends DAppAdapterProps {
      appName: string;
      appVersion: string;
      dappProps: T;
    }

    const AdapterComponent: FC<AdapterProps> = (props) => {
      const { appName, appVersion, dappProps, ...rest } = props;

      // Your component logic here

      return (
        <React.Fragment>
          {/* Pass individual properties as children */}
          <div>{appName}</div>
          <div>{appVersion}</div>
          {/* Add more properties as needed */}
        </React.Fragment>
      );
    };

    this.adapter = AdapterComponent as FC<DAppAdapterProps>;
  }

  enableRealtimeCollaboration() {
    // Implement your logic here if needed
    return this;
  }

  enableChatFunctionality() {
    // Implement your logic here if needed
    return this;
  }

  // Add more methods as needed

  getInstance() {
    return this.adapter;
  }
}

// Example usage
const dappConfig: DAppAdapterConfig<DappProps> = {
  appName: "",
  appVersion: "",
  dappProps: {} as DappProps,
};

const customDapp = new CustomDAppAdapter<DappProps>(dappConfig);
const DAppComponent = customDapp.getInstance();

// Now you can use DAppComponent for rendering
