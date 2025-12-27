// RealtimeUpdatesComponent.tsx

import axiosInstance from '@/app/api/csrfToken';
import { headersConfig } from '@/app/components/shared/SharedHeaders'
import { brandingSettings } from "@/app/libraries/theme/BrandingService";

import DatePicker from "@/app/components/calendar/DatePicker";
import Checkbox from "@/app/libraries/menu/Checkbox";
import ClearFiltersButton from "@/app/libraries/menu/ClearFiltersButton";
import Dropdown from "@/app/libraries/menu/Dropdown";
import SortableTableHeaders from "@/app/libraries/menu/SortableTableHeaders";
import TagCloud from "@/app/libraries/menu/TagCloud";
import ToggleSwitch from "@/app/libraries/menu/ToggleSwitch";

import { initializeUserData } from "@/app/pages/onboarding/PersonaBuilderData";
import router from "@/app/projects/projectManagement/ProjectManagementSimulator";

import { useAuth } from '@/app/state/context/AuthContext';
import { User } from "@/app/users/User";

import { BaseRouter } from "next/dist/shared/lib/router/router";
import { Router } from "next/router";
import React, { useEffect, useState } from "react";
import { ChatSettings } from '@/app/notifications/NotificationChannelManager'

/* ---------- Realtime entity imports ---------- */
import {
  AppRealtimeData
} from "@/app/typings/entities/RealtimeDataEntity";


/* ---------- Realtime subscription ---------- */

export const subscribeToRealtimeUpdates = <
  TRealtime = AppRealtimeData
>(
  user: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  callback?: (payload: TRealtime) => void
) => {
  const socket = new WebSocket("ws://example.com/realtime");

  socket.onmessage = (event) => {
    try {
      const parsed = JSON.parse(event.data) as TRealtime;
      callback?.(parsed);
    } catch (err) {
      console.error("Invalid realtime payload:", err);
    }
  };

  socket.onerror = (err) => {
    console.error("Realtime socket error:", err);
  };

  return {
    unsubscribe: () => socket.close()
  };
};

/* ---------- Defaults ---------- */

const defaultChatSettings: ChatSettings = {
  realTimeChatEnabled: false,
  notificationEmailEnabled: false,
  enableEmojis: true,
  enableAudioChat: false,
  enableVideoChat: false,
  enableFileSharing: false,
  enableBlockchainCommunication: false,
  enableDecentralizedStorage: false,
  collaborationPreference1: undefined,
  collaborationPreference2: undefined,
  platforms: [],
  messageFormat: 'text',
  mentionUsers: true
};

/* ---------- Component ---------- */

const RealtimeUpdatesComponent: React.FC = () => {
  const { state: authState } = useAuth();
  const user = authState.user;

  const [realtimeData, setRealtimeData] = useState<AppRealtimeData | null>(null);
  const [chatSettings, setChatSettings] = useState<ChatSettings>(
    defaultChatSettings
  );

  /* ---------- Effects ---------- */

  useEffect(() => {
    if (!user) return;

    let subscription: ReturnType<typeof subscribeToRealtimeUpdates> | undefined;

    const initialize = async () => {
      try {
        await initializeUserData(user.id, user);
      } catch (error) {
        console.error("Error initializing user data:", error);
      }

      subscription = subscribeToRealtimeUpdates<AppRealtimeData>(
        user,
        handleRealtimeUpdate
      );
    };

    initialize();

    return () => {
      subscription?.unsubscribe();
    };
  }, [user]);

  /* ---------- Handlers ---------- */

  const handleRealtimeUpdate = (data: AppRealtimeData) => {
    setRealtimeData(data);

    setChatSettings((prev) => ({
      ...prev,
      realTimeChatEnabled: true
    }));

    user.unreadNotificationCount =
      (user.unreadNotificationCount ?? 0) + 1;
  };

  /* ---------- Guard ---------- */

  if (!user) {
    return <p>User is not authenticated.</p>;
  }

  /* ---------- Render ---------- */

  return (
    <div>
      <h2>Real-time Updates</h2>

      <p>Username: {user.username}</p>
      <p>Email: {user.email}</p>

      <pre>{JSON.stringify(realtimeData, null, 2)}</pre>

      <SortableTableHeaders
        headers={[]}
        onSort={() => {}}
        headersConfig={headersConfig}
      />

      <ClearFiltersButton
        label="Clear Filters"
        router={router as unknown as BaseRouter & Router}
        brandingSettings={brandingSettings}
        onClick={() => {}}
      />

      <Dropdown
        options={[]}
        selectedOption=""
        onSelectOption={() => {}}
      />

      <TagCloud
        tags={[]}
        onSelectTag={() => {}}
      />

      <Checkbox
        label="Enable Emojis"
        checked={chatSettings.enableEmojis}
        onChange={(checked) =>
          setChatSettings((prev) => ({
            ...prev,
            enableEmojis: checked
          }))
        }
      />

      <DatePicker
        selectedDate=""
        onSelectDate={() => {}}
      />

      <ToggleSwitch
        label="Real-time Chat"
        checked={chatSettings.realTimeChatEnabled}
        onChange={(checked) =>
          setChatSettings((prev) => ({
            ...prev,
            realTimeChatEnabled: checked
          }))
        }
      />
    </div>
  );
};

export default RealtimeUpdatesComponent;