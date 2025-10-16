// app/login/page.tsx
'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../services/api";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
export default function AboutPage() {
    return (
        <>
            <Header />
            <br />
            <div>
                <h1>Về chúng tôi</h1>
                {/* Nội dung khác */}
            </div>
            <Footer />
        </>
    );
}
