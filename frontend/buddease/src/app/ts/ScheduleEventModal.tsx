// ScheduleEventModal.tsx
import { Button, Form, Input, Modal, Select } from "antd";
import moment from "moment";
import React, { useState } from "react";
import { CalendarEvent, useCalendarManagerStore } from '../components/state/stores/CalendarEvent';

const { Option } = Select;

interface ScheduleEventModalProps {
  visible: boolean;
  onCancel: () => void;
  eventId?: string;
}

const ScheduleEventModal: React.FC<ScheduleEventModalProps> = ({ visible, onCancel }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTimezone, setSelectedTimezone] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [agenda, setAgenda] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedCollaborationTool, setSelectedCollaborationTool] = useState("");

  const calendarManagerStore = useCalendarManagerStore();

  const handleOk = () => {
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: title,
      description: description,
      date: moment().toDate(),
      timezone: selectedTimezone,
      participants: selectedParticipants,
      agenda: agenda,
      language: selectedLanguage,
      collaborationTool: selectedCollaborationTool,
      // Add more event properties as needed
    };

    calendarManagerStore.addEvent(newEvent);
    onCancel();
  };

  return (
    <Modal
      title="Schedule Event"
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
          Schedule
        </Button>,
      ]}
    >
      <Form>
        <Form.Item label="Event Title">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </Form.Item>
        <Form.Item label="Event Description">
          <Input.TextArea value={description} onChange={(e) => setDescription(e.target.value)} />
        </Form.Item>
        <Form.Item label="Timezone">
          <Select value={selectedTimezone} onChange={(value) => setSelectedTimezone(value)}>
            {/* Options for different timezones */}
          </Select>
        </Form.Item>
        <Form.Item label="Participants">
          <Select
            mode="multiple"
            value={selectedParticipants}
            onChange={(values) => setSelectedParticipants(values)}
          >
            {/* Options for selecting participants */}
          </Select>
        </Form.Item>
        <Form.Item label="Agenda">
          <Input.TextArea value={agenda} onChange={(e) => setAgenda(e.target.value)} />
        </Form.Item>
        <Form.Item label="Language">
          <Select value={selectedLanguage} onChange={(value) => setSelectedLanguage(value)}>
            {/* Options for selecting language */}
          </Select>
        </Form.Item>
        <Form.Item label="Collaboration Tool">
          <Select
            value={selectedCollaborationTool}
            onChange={(value) => setSelectedCollaborationTool(value)}
          >
            {/* Options for selecting collaboration tool */}
          </Select>
        </Form.Item>
        {/* Add more form items for additional features */}
      </Form>
    </Modal>
  );
};

export default ScheduleEventModal;
