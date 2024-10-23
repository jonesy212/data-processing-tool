import React from "react";

import ChatCard from "@/app/components/cards/ChatCard";
import axios, { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import Group from "./Group";
import GroupChatMessage from "./GroupChatMessage";

interface EnhancedGroupChatDashboardProps {
    // Additional props if needed
  }
  
  const GROUPS_API_ENDPOINT = 'https://example.com/api/groups';
  const GROUP_CHAT_API_ENDPOINT = 'https://example.com/api/group-chat/messages';
  
  const EnhancedGroupChatDashboard: React.FC<EnhancedGroupChatDashboardProps> = () => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [groupChatMessages, seteGroupChatMessages] = useState<GroupChatMessage[]>([]);
  
    useEffect(() => {
      // Fetch all groups when the component mounts
      const fetchGroups = async () => {
        try {
          const response: AxiosResponse<Group[]> = await axios.get(GROUPS_API_ENDPOINT);
          setGroups(response.data);
        } catch (error) {
          console.error('Error fetching groups:', error);
          // Handle error appropriately
        }
      };
  
      fetchGroups();
  
      // Cleanup logic if needed
      return () => {
        // Any cleanup logic can go here
      };
    }, []); // Only fetch groups on mount, no dependencies
  
    useEffect(() => {
      // Fetch group chat messages when a group is selected
      const fetcheGroupChatMessages = async () => {
        if (selectedGroupId) {
          try {
            const response: AxiosResponse<GroupChatMessage[]> = await axios.get(GROUP_CHAT_API_ENDPOINT, {
              params: { groupId: selectedGroupId, limit: 10 }, // Adjust limit as needed
            });
  
            seteGroupChatMessages(response.data);
          } catch (error) {
            console.error('Error fetching group chat messages:', error);
            // Handle error appropriately
          }
        }
      };
  
      fetcheGroupChatMessages();
  
      // Cleanup logic if needed
      return () => {
        // Any cleanup logic can go here
      };
    }, [selectedGroupId]); // Re-fetch messages when groupId changes
  
    const handleGroupSelect = (groupId: string) => {
      setSelectedGroupId(groupId);
    };
  
    return (
      <div>
        <h2>All Groups</h2>
        <div className="group-list">
          {groups.map((group) => (
            <div key={group.id} onClick={() => handleGroupSelect(group.id)}>
              {group.name} - {group.isPublic ? 'Public' : 'Private'}
            </div>
          ))}
        </div>
  
        {selectedGroupId && (
          <div>
            <h2>Group Chat Dashboard</h2>
            <div className="group-chat-messages">
              {groupChatMessages.map((message) => (
                <ChatCard
                  key={message.id}
                  sender={message.sender}
                  message={message.message}
                  timestamp={message.timestamp}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  export default EnhancedGroupChatDashboard;