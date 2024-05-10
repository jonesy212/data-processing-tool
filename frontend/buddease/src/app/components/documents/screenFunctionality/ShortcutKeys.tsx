import { Message } from "@/app/generators/GenerateChatInterfaces";

import React from "react";

import { WritableDraft } from "../../state/redux/ReducerGenerator";
import { addMessage } from "../../state/redux/slices/ChatSlice";

import { TooltipActions } from "../../actions/TooltipActions";
import { GesterEvent, UIActions } from "../../actions/UIActions";

import { saveCryptoPortfolioData } from "../editing/autosave";
import { CustomEventListener, ReactiveEventHandler } from "../../event/DynamicEventHandlerExample";
import { sanitizeData } from "../../security/SanitizationFunctions";


const ShortCutKeys: CustomEventListener = {
  // Define state using useState hook

  handleMouseEvent: (event:ReactiveEventHandler) => {
    // Sanitize input value before processing
    const syntheticEvent = event as React.SyntheticEvent;
    const sanitizedData = sanitizeData(syntheticEvent.currentTarget.toString());
    console.log("Sanitized data:", sanitizedData);
    ShortCutKeys.handleMouseClick(event);
  },




  // Simulating the functions you want to call
  handleKeyboardShortcuts: (event: React.SyntheticEvent) => {
    // Logic for handling keyboard shortcuts
    console.log("Handling keyboard shortcuts:", event);

    // Create a basic Message object with the string content
    const message: Partial<Message> = {
      content: "Handling keyboard shortcuts", // Providing content here
      // You can provide other properties as needed
    };

    // Call addMessage with the created Message object
    addMessage(message as WritableDraft<Message>); // Type assertion to Message
  },



  

  //     addMessage(message as WritableDraft<Message>);

  //     // Check if custom logic is provided, use it; otherwise, use the default logic
  //     const eventHandler = customLogic || (() => { });

  //     // Call the corresponding event handler
  //     eventHandler(event as ReactiveEventHandler);
  //   },

}


export default ShortCutKeys;
 