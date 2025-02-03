/* frontend/src/components/navigation/Layout.tsx */

'use client';

import React, { useState } from 'react';
import {
    Box,
    Toolbar } from '@mui/material';
import AppBar from './AppBar';
import SidebarNav from './Sidebar';

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleDrawerOpen = () => {
        setIsDrawerOpen(true);
    };

    const handleDrawerClose = () => {
        setIsDrawerOpen(false);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            {/* App Bar */}
            <AppBar onMenuClick={handleDrawerOpen} />

            {/* Navigation Drawer */}
            <SidebarNav
                open={isDrawerOpen}
                onClose={handleDrawerClose}
            />

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3
                }}
            >
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
}