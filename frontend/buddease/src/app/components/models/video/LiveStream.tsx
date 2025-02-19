import { ButtonGenerator } from "@/app/generators/GenerateButtons";
import { ModalGenerator } from "@/app/generators/GenerateModal";
import React, { useState } from "react";
import FileUploadModal from "../../cards/modal/FileUploadModal";

interface LiveStreamProps {
  isOwner: boolean; // Flag to determine if the user is the owner
}

const LiveStream: React.FC<LiveStreamProps> = ({ isOwner }) => {
  // State to manage the order form modal visibility
  const [orderFormVisible, setOrderFormVisible] = useState(false);

  // Function to toggle the order form modal visibility
  const toggleOrderFormModal = () => {
    setOrderFormVisible(prevState => !prevState);
  };

  // Function to handle order submission
  const handleOrderSubmit = (formData: any) => {
    // Handle order submission logic...
    console.log("Order form submitted with data:", formData);
    // Close the order form modal
    toggleOrderFormModal();
  };


  const handleCloseModal = () => {
    // Implement the logic to close the modal here
    setOrderFormVisible(false);
  };


  const handleFileUpload = (files: FileList) => {
    //
    // Implement the logic to handle file upload here
    console.log("Files uploaded:", files);
  }
  
  return (
    <div>
      {/* Display for users */}
      {!isOwner && (
        <div>
          <h2>Live Stream for Customers</h2>
          {/* Display inventory, next-up items, etc. */}
          {/* Show product picture, description, and order button */}
          <div>
            <img src="product-image.jpg" alt="Product" />
            <p>Product Description</p>
            {/* Button to open order form modal */}
            <ButtonGenerator
              label={{"order-form-modal": "Order"}}
              onSubmit={toggleOrderFormModal} />
          </div>
        </div>
      )}

      {/* Display for owners */}
      {isOwner && (
        <div>
          <h2>Live Stream for Owners</h2>
          {/* Owner-specific toolbar and content */}
          {/* Example: Manage inventory, analytics, etc. */}
        </div>
      )}

      {/* Order form modal */}
      <ModalGenerator
            isOpen={{isModalOpen: orderFormVisible }}
            closeModal={() => {
              console.log("Modal closed");
              // Change from onCloseFileUploadModal(); to handleCloseModal();
              handleCloseModal();
            } }
            modalComponent={FileUploadModal}
            onFileUpload={(files: FileList) => {
              // Implement logic to handle file upload
              console.log("Files uploaded:", files);
              onHandleFileUpload(files); // Call the provided function to handle file upload
            } }
            children={null} title={""}
          />
        {/* Order form component */}
        <form onSubmit={handleOrderSubmit}>
          {/* Form fields for user information */}
          {/* Example: Name, address, payment details, etc. */}
          <input type="text" placeholder="Name" />
          <input type="text" placeholder="Address" />
          <input type="text" placeholder="Payment Details" />
          {/* Submit button */}
          <ButtonGenerator
            label={{ "order-now": "Order Now" }}
            type="submit"
          />
        </form>
    </div>
  );
};

export default LiveStream;




















// convert actions:
// Define action types
enum LiveStreamActionTypes {
  TOGGLE_ORDER_FORM_MODAL = "TOGGLE_ORDER_FORM_MODAL",
  SUBMIT_ORDER = "SUBMIT_ORDER",
  // Add more action types as needed
}

// Define action interfaces
interface ToggleOrderFormModalAction {
  type: LiveStreamActionTypes.TOGGLE_ORDER_FORM_MODAL;
}

interface SubmitOrderAction {
  type: LiveStreamActionTypes.SUBMIT_ORDER;
  formData: any; // Define the type of form data
}

// Define a union type for all actions
type LiveStreamAction = ToggleOrderFormModalAction | SubmitOrderAction;

// Define action creators
const toggleOrderFormModal = (): ToggleOrderFormModalAction => ({
  type: LiveStreamActionTypes.TOGGLE_ORDER_FORM_MODAL,
});

const submitOrder = (formData: any): SubmitOrderAction => ({
  type: LiveStreamActionTypes.SUBMIT_ORDER,
  formData,
});

export {
  LiveStreamActionTypes, submitOrder, toggleOrderFormModal
};

