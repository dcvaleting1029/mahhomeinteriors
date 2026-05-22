import React from "react";
import AnnouncementBar from "./AnnouncementBar";
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "../CartDrawer";

export default function Layout({ children, hideAnnouncement = false }) {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            {!hideAnnouncement && <AnnouncementBar />}
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
        </div>
    );
}
