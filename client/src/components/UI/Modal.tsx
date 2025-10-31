import React from "react";
import ReactDOM from "react-dom";
import X from "./icons/X";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="text-end"><X size={24} onClick={onClose} color="#ccc"/></span>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;