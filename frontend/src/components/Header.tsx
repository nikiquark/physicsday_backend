"use client";

import { useState } from "react"
import { motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import ContactModal from "./ContactModal"

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [contactModalOpen, setContactModalOpen] = useState(false);

    const handleContactClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setContactModalOpen(true);
        setMenuOpen(false); // Закрываем мобильное меню если оно было открыто
    };

    return (
        <>
            <header className="fixed top-0 left-0 right-0 bg-white shadow z-50">
                <div className="max-w-6xl mx-auto flex justify-between items-center p-4">
                <Link href='/'>
                    <span className="font-bold text-lg">ФизФест</span>
                </Link>
                <div className="lg:hidden">
                    <button onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
                <nav className="hidden lg:flex items-center space-x-4">
                    <Link href="/#about" className="hover:text-blue-600 transition">О фестивале</Link>
                    <Link href="/masters" className="hover:text-blue-600 transition">Мастер-классы</Link>
                    <Link href="/olympiads" className="hover:text-blue-600 transition">Олимпиады</Link>
                    <Link href="/excursions" className="hover:text-blue-600 transition">Экскурсии</Link>
                    <button onClick={handleContactClick} className="hover:text-blue-600 transition">Контакты</button>
                    <Link href="/#register" className="bg-[#344EAD] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[#2a3f92] transition">Регистрация на ФизФест</Link>
                </nav>
                </div>
                {menuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="lg:hidden bg-white shadow-md px-4 pb-4 flex flex-col space-y-3"
                >
                    <Link onClick={() => setMenuOpen(false)} href="/#about" className="hover:text-blue-600 transition py-2">О фестивале</Link>
                    <Link onClick={() => setMenuOpen(false)} href="/masters" className="hover:text-blue-600 transition py-2">Мастер-классы</Link>
                    <Link onClick={() => setMenuOpen(false)} href="/olympiads" className="hover:text-blue-600 transition py-2">Олимпиады</Link>
                    <Link onClick={() => setMenuOpen(false)} href="/excursions" className="hover:text-blue-600 transition py-2">Экскурсии</Link>
                    <button onClick={handleContactClick} className="hover:text-blue-600 transition py-2 text-left">Контакты</button>
                    <Link onClick={() => setMenuOpen(false)} href="/#register" className="bg-[#344EAD] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[#2a3f92] transition text-center">Регистрация на ФизФест</Link>
                </motion.div>
                )}
            </header>

            {/* Contact Modal */}
            <ContactModal 
                isOpen={contactModalOpen} 
                onClose={() => setContactModalOpen(false)} 
            />
        </>
    )
}