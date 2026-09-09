import { ReactNode } from "react";
import { USER_ROLES } from "@/lib/constants";

export interface ProgramItem {
    title: string;
    image: string;
    href?: string;
}

export interface PartnerItem {
    name: string;
    logo: string;
    website: string;
}

export interface ModalContent {
    type: 'success' | 'error' | 'loading';
    title: string;
    message: ReactNode;
}

export type UserRole = typeof USER_ROLES[number];