import {
    ButtonGenerator,
    useButtonGeneratorProps, // Updated import
} from "@/app/generators/GenerateButtons";
import React from "react";

interface VideoToolbarProps {
  onRecord: () => void;
  onUpload: () => void;
  onEdit: () => void;
  onManage: () => void;
  onProductManagement: () => void;
  onAdManagement: () => void;
  onScheduleManagement: () => void;
  handleSpeechToText: () => void;
  handleTextToSpeech: () => void;
  handleAIVideoAnalysis: () => void;
}

const VideoToolbar: React.FC<VideoToolbarProps> = ({
  onRecord,
  onUpload,
  onEdit,
  onManage,
  onProductManagement,
  onAdManagement,
  onScheduleManagement,
  handleSpeechToText,
  handleTextToSpeech,
  handleAIVideoAnalysis,
}) => {
  // Use the new hook to get button props
  const { buttonProps } = useButtonGeneratorProps();

  return (
    <div className="video-toolbar">
      {/* Record Video Button */}
      <ButtonGenerator
        {...buttonProps}
        label={{ "record-video": "Record Video" }}
        onSubmit={onRecord}
      />

      {/* Upload Video Button */}
      <ButtonGenerator
        {...buttonProps}
        label={{ "upload-video": "Upload Video" }}
        onSubmit={onUpload}
      />

      {/* Edit Video Button */}
      <ButtonGenerator
        {...buttonProps}
        label={{ "edit-video": "Edit Video" }}
        onSubmit={onEdit}
      />

      {/* Manage Videos Button */}
      <ButtonGenerator
        {...buttonProps}
        label={{ "manage-videos": "Manage Videos" }}
        onSubmit={onManage}
      />

      {/* Product Management Button */}
      <ButtonGenerator
        {...buttonProps}
        label={{ "product-management": "Product Management" }}
        onSubmit={onProductManagement}
      />

      {/* Ad Management Button */}
      <ButtonGenerator
        {...buttonProps}
        label={{ "ad-management": "Ad Management" }}
        onSubmit={onAdManagement}
      />

      {/* Schedule Management Button */}
      <ButtonGenerator
        {...buttonProps}
        label={{ "schedule-management": "Schedule Management" }}
        onSubmit={onScheduleManagement}
      />

      {/* AI-powered Features */}
      <div className="ai-features">
        {/* Speech-to-Text Button */}
        <ButtonGenerator
          {...buttonProps}
          label={{ "speech-to-text": "Speech to Text" }}
          onSubmit={handleSpeechToText}
        />

        {/* Text-to-Speech Button */}
        <ButtonGenerator
          {...buttonProps}
          label={{ "text-to-speech": "Text to Speech" }}
          onSubmit={handleTextToSpeech}
        />

        {/* AI Video Analysis Button */}
        <ButtonGenerator
          {...buttonProps}
          label={{ "ai-video-analysis": "AI Video Analysis" }}
          onSubmit={handleAIVideoAnalysis}
        />
      </div>

      {/* Additional futuristic features can be added here */}

      {/* Standard ButtonGenerator component */}
      <div className="standard-features">
        <ButtonGenerator {...buttonProps} />
        {/* Render other elements */}
      </div>
    </div>
  );
};

export default VideoToolbar;