import { ModalContent } from "@/lib/types";
import { ReactNode, useState } from "react";



export const useModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState<ModalContent>({
        type: 'success',
        title: '',
        message: ''
    });

    const showModal = (type : 'success' | 'error' | 'loading', title: string, message: ReactNode) => {
        setContent({ type, title, message });
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
    };

    return [isOpen, content, showModal, closeModal] as const;
}