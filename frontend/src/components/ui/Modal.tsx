import { motion } from "framer-motion";
import { CheckCircle, X } from "lucide-react";
import { ModalContent } from "@/lib/types";


interface ModalProps extends ModalContent {
    isOpen: boolean;
    onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    type,
    title,
    message
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-500/50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
            >
                {type === 'success' && (
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                )}
                {type === 'error' && (
                <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
                )}
                {type === 'loading' && (
                <motion.div
                    className="w-16 h-16 border-4 border-[#344EAD] border-t-transparent rounded-full mx-auto mb-4"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                )}
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {title}
                </h3>
                <p className="text-gray-600 mb-6">
                {message}
                </p>
                
                {type !== 'loading' && (
                <button
                    onClick={onClose}
                    className="bg-[#344EAD] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#2a3f92] transition w-full"
                >
                    Закрыть
                </button>
                )}
            </motion.div>
        </div>
    )
}