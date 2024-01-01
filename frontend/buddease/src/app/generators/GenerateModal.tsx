import React from 'react';

interface ModalProps {
  isOpen: boolean;
  closeModal: () => void;
  // Add other modal-specific props here
}

const ModalGenerator: React.FC<ModalProps> = ({ isOpen, closeModal, children }) => {
  // You can use state or props to control the content of the modal

  return (
    <div>
      {isOpen && (
        <div className="modal">
          <div className="modal-content">
            {/* Modal content goes here */}
            {children}
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModalGenerator;
