import React from "react";

import { useEffect, useState } from "react";
import Logger, {
  AnalyticsLogger,
  AnimationLogger,
  AudioLogger,
  BugLogger,
  CalendarLogger,
  ChannelLogger,
  ChatLogger,
  CollaborationLogger,
  CommunityLogger,
  ComponentLogger,
  ConfigLogger,
  ContentLogger,
  DataLogger,
  DexLogger,
  DocumentLogger,
  ErrorLogger,
  ExchangeLogger,
  FileLogger,
  FormLogger,
  IntegrationLogger,
  PaymentLogger,
  SearchLogger,
  SecurityLogger,
  TaskLogger,
  TeamLogger,
  TenantLogger,
  UILogger,
  VideoLogger,
  WebLogger,
} from "./Logger"; // Import all logger classes

// Define a higher-order component (HOC) to enhance logging functionality
const withLogging = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  logger?: typeof Logger
) => {
  return (props: P) => {
    useEffect(() => {
      // Log the component mount event
      Logger.log(
        "Component Mount",
        `Component ${WrappedComponent.name} mounted`
      );

      return () => {
        // Log the component unmount event
        Logger.log(
          "Component Unmount",
          `Component ${WrappedComponent.name} unmounted`
        );
      };
    }, []);

    return <WrappedComponent {...props} />;
  };
};

const LogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      // Simulate fetching logs from an API
      const response = await fetch("/api/logs");
      const data = await response.json();
      setLogs(data.logs);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching logs:", error);
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Log Viewer</h2>
      {loading ? (
        <p>Loading logs...</p>
      ) : (
        <ul>
          {logs.map((log, index) => (
            <li key={index}>{log}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Enhance the LogViewer component with logging functionality using different logger classes
const EnhancedLogViewerWithLogger = withLogging(LogViewer, Logger);
const EnhancedLogViewerWithUILogger = withLogging(LogViewer, UILogger);
const EnhancedLogViewerWithAudioLogger = withLogging(LogViewer, AudioLogger);
const EnhancedLogViewerWithConfigLogger = withLogging(LogViewer, ConfigLogger);
const EnhancedLogViewerWithDexLogger = withLogging(LogViewer, DexLogger);
const EnhancedLogViewerWithSearchLogger = withLogging(LogViewer, SearchLogger);
const EnhancedLogViewerWithTeamLogger = withLogging(LogViewer, TeamLogger);
const EnhancedLogViewerWithAnalyticsLogger = withLogging(
  LogViewer,
  AnalyticsLogger
);
const EnhancedLogViewerWithAnimationLogger = withLogging(
  LogViewer,
  AnimationLogger
);
const EnhancedLogViewerWithBugLogger = withLogging(LogViewer, BugLogger);
const EnhancedLogViewerWithCalendarLogger = withLogging(
  LogViewer,
  CalendarLogger
);
const EnhancedLogViewerWithChannelLogger = withLogging(
  LogViewer,
  ChannelLogger
);
const EnhancedLogViewerWithChatLogger = withLogging(LogViewer, ChatLogger);
const EnhancedLogViewerWithCollaborationLogger = withLogging(
  LogViewer,
  CollaborationLogger
);
const EnhancedLogViewerWithCommunityLogger = withLogging(
  LogViewer,
  CommunityLogger
);
const EnhancedLogViewerWithComponentLogger = withLogging(
  LogViewer,
  ComponentLogger
);
const EnhancedLogViewerWithContentLogger = withLogging(
  LogViewer,
  ContentLogger
);
const EnhancedLogViewerWithDataLogger = withLogging(LogViewer, DataLogger);
const EnhancedLogViewerWithDocumentLogger = withLogging(
  LogViewer,
  DocumentLogger
);
const EnhancedLogViewerWithErrorLogger = withLogging(LogViewer, ErrorLogger);
const EnhancedLogViewerWithExchangeLogger = withLogging(
  LogViewer,
  ExchangeLogger
);
const EnhancedLogViewerWithFileLogger = withLogging(LogViewer, FileLogger);
const EnhancedLogViewerWithFormLogger = withLogging(LogViewer, FormLogger);
const EnhancedLogViewerWithIntegrationLogger = withLogging(
  LogViewer,
  IntegrationLogger
);
const EnhancedLogViewerWithPaymentLogger = withLogging(
  LogViewer,
  PaymentLogger
);
const EnhancedLogViewerWithSecurityLogger = withLogging(
  LogViewer,
  SecurityLogger
);
const EnhancedLogViewerWithTaskLogger = withLogging(LogViewer, TaskLogger);
const EnhancedLogViewerWithTenantLogger = withLogging(LogViewer, TenantLogger);
const EnhancedLogViewerWithVideoLogger = withLogging(LogViewer, VideoLogger);
const EnhancedLogViewerWithWebLogger = withLogging(LogViewer, WebLogger);

export {
  EnhancedLogViewerWithAnalyticsLogger,
  EnhancedLogViewerWithAnimationLogger,
  EnhancedLogViewerWithAudioLogger,
  EnhancedLogViewerWithBugLogger,
  EnhancedLogViewerWithCalendarLogger,
  EnhancedLogViewerWithChannelLogger,
  EnhancedLogViewerWithChatLogger,
  EnhancedLogViewerWithCollaborationLogger,
  EnhancedLogViewerWithCommunityLogger,
  EnhancedLogViewerWithComponentLogger,
  EnhancedLogViewerWithConfigLogger,
  EnhancedLogViewerWithContentLogger,
  EnhancedLogViewerWithDataLogger,
  EnhancedLogViewerWithDexLogger,
  EnhancedLogViewerWithDocumentLogger,
  EnhancedLogViewerWithErrorLogger,
  EnhancedLogViewerWithExchangeLogger,
  EnhancedLogViewerWithFileLogger,
  EnhancedLogViewerWithFormLogger,
  EnhancedLogViewerWithIntegrationLogger,
  EnhancedLogViewerWithLogger,
  EnhancedLogViewerWithPaymentLogger,
  EnhancedLogViewerWithSearchLogger,
  EnhancedLogViewerWithSecurityLogger,
  EnhancedLogViewerWithTaskLogger,
  EnhancedLogViewerWithTeamLogger,
  EnhancedLogViewerWithTenantLogger,
  EnhancedLogViewerWithUILogger,
  EnhancedLogViewerWithVideoLogger,
  EnhancedLogViewerWithWebLogger,
};
