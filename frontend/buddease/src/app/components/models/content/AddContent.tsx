// AddContent.tsx
import { BaseData } from '@/app/components/models/data/Data';

import ContentItemComponent, { ContentItem } from '@/app/components/models/content/ContentItem';
import { TaskMetadata } from '@/app/configs/database/MetaDataOptions';
import { Persona } from "@/app/pages/personas/Persona";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import React, { FormEvent, useState } from "react";
import { Category } from '../../libraries/categories/generateCategoryProperties';
import { CustomSnapshotData, ItemUnion, SnapshotWithCriteria } from '../../snapshots';
import UserRoles from "../../users/UserRoles";
import { StatusType } from '../data/StatusType';
import { TaskData } from '../tasks/Task';
import ContentDetailsListItem from "./ContentDetailsListItem";
import ContentToolbar from "./ContentToolbar";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";


interface Content<
  T extends  BaseData<any, any> = BaseData<any, any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
 > {
  id: string | number | undefined;
  title: string;
  description: string;
  subscriberId: string,
  category:  Category | undefined,
  categoryProperties: string | CategoryProperties | undefined,
  timestamp: string | number | Date,
  length: number,
  items: ItemUnion[],
  data: T | SnapshotWithCriteria<T, K> | CustomSnapshotData<T, K, Meta> | null | undefined,
  contentItems?: ContentItem[]
}

interface ContentProps {
  onComplete: () => void; // Define the onComplete function type
}

interface ContentProps {
  onComplete: () => void;
}

const AddContent: React.FC<ContentProps> = ({ onComplete }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validate input fields
    if (!title.trim() || !description.trim()) {
      alert("Please fill in all fields");
      return;
    }

    // Create new content object
    const newContent: Content<any, any> = {
      id: Math.floor(Math.random() * 1000),
      title,
      description,
      subscriberId: "",
      category: undefined,
      timestamp: "",
      length: 0,
      data: undefined,
      categoryProperties: undefined,
      items: [],
      contentItems: []
    };

    // Send new content to server or perform other actions
    console.log("New content:", newContent);

    // Clear input fields
    setTitle("");
    setDescription("");
  };
  const handleBoldClick = () => {
    // Get the selection range
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
  
    // Create a <strong> element to represent bold text
    const boldElement = document.createElement('strong');
  
    // Surround the selected content with the <strong> element
    const range = selection.getRangeAt(0);
    range.surroundContents(boldElement);
  };
  



  const handleItalicClick = () => {
    // Get the selection range
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
  
    // Create an <i> element to represent italic text
    const italicElement = document.createElement('i');
  
    // Surround the selected content with the <i> element
    const range = selection.getRangeAt(0);
    range.surroundContents(italicElement);
  };
  
  const handleUnderlineClick = () => {
    // Get the selection range
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
  
    // Create a <u> element to represent underline
    const underlineElement = document.createElement('u');
  
    // Surround the selected content with the <u> element
    const range = selection.getRangeAt(0);
    range.surroundContents(underlineElement);
  };
  
  const handleStrikeThroughClick = () => {
    // Get the selection range
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
  
    // Create a <strike> element to represent strike-through
    const strikeThroughElement = document.createElement('strike');
  
    // Surround the selected content with the <strike> element
    const range = selection.getRangeAt(0);
    range.surroundContents(strikeThroughElement);
  };
  




  const handleHighlightClick = () => {
    // Get the selection range
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
  
    // Create a <span> element to represent the highlight
    const highlightSpan = document.createElement('span');
    highlightSpan.style.backgroundColor = 'yellow';
  
    // Surround the selected content with the <span> element
    const range = selection.getRangeAt(0);
    range.surroundContents(highlightSpan);
  };
  
  const handleAlignLeftClick = () => {
    // Get the selection range
    const selection = window.getSelection();
    if (!selection) return;
  
    // Create a <div> element to represent left alignment
    const alignmentDiv = document.createElement('div');
    alignmentDiv.style.textAlign = 'left';
  
    // Surround the selected content with the <div> element
    const range = selection.getRangeAt(0);
    range.surroundContents(alignmentDiv);
  };
  
  const handleAlignCenterClick = () => {
    // Get the selection range
    const selection = window.getSelection();
    if (!selection) return;
  
    // Create a <div> element to represent center alignment
    const alignmentDiv = document.createElement('div');
    alignmentDiv.style.textAlign = 'center';
  
    // Surround the selected content with the <div> element
    const range = selection.getRangeAt(0);
    range.surroundContents(alignmentDiv);
  };
  






  const handleAlignRightClick = () => {
    // Get the selection range
    const selection = window.getSelection();
    if (!selection) return;
  
    // Create a <div> element to represent the right alignment
    const alignmentDiv = document.createElement('div');
    alignmentDiv.style.textAlign = 'right';
  
    // Surround the selected content with the <div> element
    const range = selection.getRangeAt(0);
    range.surroundContents(alignmentDiv);
  };
  
  const handleJustifyClick = () => {
    // Get the selection range
    const selection = window.getSelection();
    if (!selection) return;
  
    // Create a <div> element to represent full justification
    const justificationDiv = document.createElement('div');
    justificationDiv.style.textAlign = 'justify';
  
    // Surround the selected content with the <div> element
    const range = selection.getRangeAt(0);
    range.surroundContents(justificationDiv);
  };
  
  const handleBulletListClick = () => {
    // Get the selection range
    const selection = window.getSelection();
    if (!selection) return;

    // Create a new <ul> element
    const unorderedList = document.createElement("ul");

    // Get the parent node of the selected range
    const parentNode = selection.anchorNode?.parentNode as HTMLElement;
    if (!parentNode) return;

    // Create a new <li> element
    const listItem = document.createElement("li");

    // Append the selected range to the <li> element
    listItem.appendChild(selection.getRangeAt(0).cloneContents());

    // Append the <li> element to the <ul> element
    unorderedList.appendChild(listItem);

    // Replace the parent node's content with the <ul> element
    parentNode.innerHTML = unorderedList.outerHTML;
  };

  
  



  const handleNumberedListClick = () => {
    // Get the selection range
    const selection = window.getSelection();
    if (!selection) return;
  
    // Create a new <ol> element
    const orderedList = document.createElement('ol');
  
    // Get the parent node of the selected range
    const parentNode = selection.anchorNode?.parentNode as HTMLElement;
    if (!parentNode) return;
  
    // Create a new <li> element
    const listItem = document.createElement('li');
  
    // Append the selected range to the <li> element
    listItem.appendChild(selection.getRangeAt(0).cloneContents());
  
    // Append the <li> element to the <ol> element
    orderedList.appendChild(listItem);
  
    // Replace the parent node's content with the <ol> element
    parentNode.innerHTML = orderedList.outerHTML;
  };
  
  const handleIndentClick = () => {
    // Get the selection range
    const selection = window.getSelection();
    if (!selection) return;
  
    // Create a <div> element to represent the indentation
    const indentation = document.createElement('div');
    indentation.style.marginLeft = '20px'; // Adjust the indentation as needed
  
    // Surround the selected content with the <div> element
    const range = selection.getRangeAt(0);
    range.surroundContents(indentation);
  };
  
  const handleOutdentClick = () => {
    // Get the selection range
    const selection = window.getSelection();
    if (!selection) return;
  
    // Get the parent node of the selected range
    const parentNode = selection.anchorNode?.parentNode;
    if (!parentNode || !(parentNode instanceof HTMLDivElement)) return;
  
    // Replace the parent node with its content
    const range = document.createRange();
    range.selectNodeContents(parentNode);
    selection.removeAllRanges();
    selection.addRange(range);
    parentNode.parentNode?.replaceChild(parentNode.firstChild!, parentNode);
  };
  
  const handleFontColorChange = (color: string) => {
    // Get the selection range
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
  
    // Create a span element to wrap the selected text
    const span = document.createElement('span');
    span.style.color = color;
  
    // Surround the selected text with the span element
    const range = selection.getRangeAt(0);
    range.surroundContents(span);
  };
  
  const handleHighlightColorChange = (color: string) => {
    // Get the selection range
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
  
    // Create a span element to wrap the selected text
    const span = document.createElement('span');
    span.style.backgroundColor = color;
  
    // Surround the selected text with the span element
    const range = selection.getRangeAt(0);
    range.surroundContents(span);
  };
  
  const handleFontSizeChange = (fontSize: number) => {
    // Get the selection range
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
  
    // Create a span element to wrap the selected text
    const span = document.createElement('span');
    span.style.fontSize = `${fontSize}px`;
  
    // Surround the selected text with the span element
    const range = selection.getRangeAt(0);
    range.surroundContents(span);
  };
  
  const handleFontFamilyChange = (fontFamily: string) => {
    // Change the font family of the selected text
    document.execCommand("fontName", false, fontFamily);
  };

  const handleImageInsert = () => {
    // Insert an image at the cursor position
    // Logic for handling image insertion goes here
  };

  const handleLinkInsert = () => {
    // Insert a link at the cursor position
    // Logic for handling link insertion goes here
  };

  const handleUndoClick = () => {
    // Undo the last action
    document.execCommand("undo");
  };

  const handleRedoClick = () => {
    // Redo the last undone action
    document.execCommand("redo");
  };

  return (
    <div>
      <h2>Add Content</h2>

      {/* Render ContentToolbar */}
      <ContentToolbar
        onBoldClick={handleBoldClick}
        onItalicClick={handleItalicClick}
        onUnderlineClick={handleUnderlineClick}
        onStrikeThroughClick={handleStrikeThroughClick}
        onHighlightClick={handleHighlightClick}
        onAlignLeftClick={handleAlignLeftClick}
        onAlignCenterClick={handleAlignCenterClick}
        onAlignRightClick={handleAlignRightClick}
        onJustifyClick={handleJustifyClick}
        onBulletListClick={handleBulletListClick}
        onNumberedListClick={handleNumberedListClick}
        onIndentClick={handleIndentClick}
        onOutdentClick={handleOutdentClick}
        onFontColorChange={handleFontColorChange}
        onHighlightColorChange={handleHighlightColorChange}
        onFontSizeChange={handleFontSizeChange}
        onFontFamilyChange={handleFontFamilyChange}
        onImageInsert={handleImageInsert}
        onLinkInsert={handleLinkInsert}
        onUndoClick={handleUndoClick}
        onRedoClick={handleRedoClick}

        // Add props for other formatting options as needed
      />

      {/* Render ContentDetailsListItem */}
      <ContentDetailsListItem
        item={{
          _id: "new",
          id: "new",
          title: "Sample Title",
          description: "Sample Description",
          status: "Sample Status",
          updatedAt: new Date(),
          participants: [
            {
              teamId: "1",
              roleInTeam: "Member",
              _id: "123",
              id: "123",
              memberName: "memberName",
              username: "username",
              email: "email",
              tier: "tier",
              uploadQuota: 0,
              fullName: "fullName",
              bio: "bio",
              userType: "userType",
              hasQuota: false,
              profilePicture: null,
              processingTasks: [],
              role: UserRoles.Member,
              persona: {} as Persona,
              snapshots: [],
              token: null
              // other properties
              ,


              avatarUrl: null,
              createdAt: new Date,
              updatedAt: undefined,
              isVerified: false,
              isAdmin: false,
              isActive: false,
              firstName: "",
              lastName: "",
              friends: [],
              blockedUsers: [],
              settings: null,
              interests: [],
              privacySettings: undefined,
              notifications: undefined,
              activityLog: [],
              socialLinks: undefined,
              relationshipStatus: null,
              hobbies: [],
              skills: [],
              achievements: [],
              profileVisibility: "",
              profileAccessControl: undefined,
              activityStatus: "",
              isAuthorized: false
            },
          ],
          analysisResults: [],

          startDate: new Date(),
          endDate: new Date(),
        }}
      />

      {/* Render ContentItem */}
      <ContentItemComponent
        item={{
          _id: "new",
          id: "0",
          title: "Sample Title",
          description: "Sample Description",
          status: "Sample Status",
          updatedAt: new Date(),
          subtitle: "Sample Subtitle",
          value: "Sample Value",
          participants: [
            {
              _id: "123",
              id: "123",
              teamId: "1",
              roles: [],
              storeId: 9009,
              roleInTeam: "Member",
              memberName: "memberName",
              username: "username",
              email: "email",
              tier: "tier",
              uploadQuota: 0,
              fullName: "fullName",
              bio: "bio",
              userType: "userType",
              hasQuota: false,
              profilePicture: null,
              processingTasks: [],
              role: UserRoles.Administrator,
              bannerUrl: "",
              persona: {} as Persona,
              snapshots: [],
              token: null,
              followers: [],
              preferences: {
                refreshUI: () => {}
              },
              
              avatarUrl: null,
              createdAt: new Date,
              updatedAt: undefined,
              isVerified: false,
              isAdmin: false,
              isActive: false,
              firstName: "",
              lastName: "",
              friends: [],
              blockedUsers: [],
              settings: null,
              interests: [],
              privacySettings: undefined,
              notifications: undefined,
              activityLog: [],
              socialLinks: undefined,
              relationshipStatus: null,
              hobbies: [],
              skills: [],
              achievements: [],
              profileVisibility: "",
              profileAccessControl: undefined,
              activityStatus: "",
              isAuthorized: false,
              childIds: [],
              relatedData: []
            },
          ],
          analysisResults: [],
          startDate: new Date(),
          endDate: new Date(),
        }}
      />

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default AddContent;
export { taskContent };
export type { Content, ContentProps };




const taskContent: Content<TaskData, TaskMetadata> = {
  id: "task-001",
  title: "Develop Feature X",
  description: "Implement the new feature as per the requirements.",
  subscriberId: "user-001",
  category: "Development",
  categoryProperties: "Frontend",
  timestamp: new Date(),
  length: 3,
  items: [
    {
      id: "update-001",
      title: "Initial Task Created",
      body: "The task was initially created and assigned to John.",
      heading: "Task Created",
      type: "text",
      status: StatusType.Pending,
      userId: "user-001",
      updatedAt: new Date("2023-01-01"),
    },
    {
      id: "update-002",
      title: "Task Status Updated",
      body: "The status of the task has been changed to 'In Progress'.",
      heading: "Status Update",
      type: "text",
      status: StatusType.InProgress,
      userId: "user-002",
      updatedAt: new Date("2023-01-05"),
    },
    {
      id: "update-003",
      title: "Task Completed",
      body: "The task has been completed successfully.",
      heading: "Completion",
      type: "text",
      status: StatusType.Completed,
      userId: "user-001",
      updatedAt: new Date("2023-01-10"),
    },
  ],
  data: null,
  contentItems: [],
  // relatedData: [],
  phase: null,
  metadata: undefined,
  username: "",
  storeId: "",
  role: "",
};
