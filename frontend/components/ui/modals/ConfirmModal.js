import Modal from "./Modal";
import Button from "../buttons/Button";
import { FiAlertTriangle, FiTrash2, FiCheck } from "react-icons/fi";

/**
 * Reusable ConfirmModal component for confirmation dialogs
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Modal open state
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onConfirm - Confirm handler
 * @param {string} props.title - Modal title
 * @param {string} props.message - Confirmation message
 * @param {string} props.type - Confirmation type (danger, warning, info)
 * @param {string} props.confirmText - Confirm button text
 * @param {string} props.cancelText - Cancel button text
 * @param {boolean} props.loading - Loading state
 */
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  type = "warning",
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false
}) => {
  const icons = {
    danger: <FiTrash2 className="text-red-400" size={24} />,
    warning: <FiAlertTriangle className="text-yellow-400" size={24} />,
    info: <FiCheck className="text-blue-400" size={24} />
  };

  const confirmVariants = {
    danger: "danger",
    warning: "warning",
    info: "primary"
  };

  const footer = (
    <div className="flex justify-end space-x-3">
      <Button
        variant="ghost"
        onClick={onClose}
        disabled={loading}
      >
        {cancelText}
      </Button>
      <Button
        variant={confirmVariants[type]}
        onClick={onConfirm}
        loading={loading}
      >
        {confirmText}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={footer}
      closeOnOverlay={!loading}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {icons[type]}
        </div>
        <div className="flex-1">
          <p className="text-gray-300">{message}</p>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
