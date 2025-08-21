import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  preventFlicker = false,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={!preventFlicker ? onClose : undefined}
          />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative z-[1001] bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">{title}</h3>
              <button
                onClick={onClose}
                disabled={preventFlicker}
                className="text-gray-400 hover:text-white disabled:opacity-50"
              >
                ×
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
