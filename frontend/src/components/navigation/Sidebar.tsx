/* frontend/src/components/navigation/Sidebar.tsx */

'use client';

import React from 'react';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemText,
    ListItemButton,
    ListItemIcon,
    Typography,
    Divider } from '@mui/material'
import {
    usePathname,
    useRouter } from 'next/navigation';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const DRAWER_WIDTH = 240;

const NAVIGATION_ITEMS = [
    {
        title: 'Recipes',
        path: '/recipes',
        icon: <MenuBookIcon/>
    },
    {
        title: 'Create Recipe',
        path: '/recipes/new',
        icon: <AddCircleIcon/>
    },
    {
        title: 'Weekly Calendar',
        path: '/schedule',
        icon: <CalendarMonthIcon/>
    }
];

interface SidebarNavProps {
    open: boolean;
    onClose: () => void;
}

export default function SidebarNav({ open, onClose }: SidebarNavProps) {
    const router = useRouter();
    const pathname = usePathname();

    // Handle navigation and drawer closing
    const handleNavigation = (path: string) => {
        router.push(path);
        onClose(); // Clsoe drawer after navigation
    };

    return (
        <Drawer
            open={open}
            onClose={onClose}
            sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                position: 'fixed',
                // height: '100%',
                '& .MuiDrawer-paper': {
                    width: DRAWER_WIDTH,
                    boxSizing: 'border-box',
                    // borderRight: '2px solid rgba(0, 0, 0, 0.12)',
                    backgroundColor: 'background.paper',
                    // position: 'fixed',
                },
            }}
        >
            <Box sx={{ overflow: 'auto' }}>
                <Box sx={{
                    px: 2,
                    py: 2,
                    bgcolor: 'primary.light'
                }}>
                    <Typography variant='h5' color="constractText" align='center'>
                        Navigation
                    </Typography>
                </Box>
                <Divider />
                <List>
                    {NAVIGATION_ITEMS.map((item) => (
                        <ListItem key={item.path} disablePadding>
                            <ListItemButton
                                selected={pathname === item.path}
                                onClick={() => handleNavigation(item.path)}
                            >
                                <ListItemIcon>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.title}/>
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Drawer>
    );
}