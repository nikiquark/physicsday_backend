import { ReactNode } from "react";
import { USER_ROLES } from "@/lib/constants";

export interface ModalContent {
    type: 'success' | 'error' | 'loading';
    title: string;
    message: ReactNode;
}

export type UserRole = typeof USER_ROLES[number];