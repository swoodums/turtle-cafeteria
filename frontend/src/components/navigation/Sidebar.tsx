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
    Typography,
    Divider } from '@mui/material'
import {
    usePathname,
    useRouter } from 'next/navigation';

const DRAWER_WIDTH = 240;

const NAVIGATION_ITEMS = [
    {
        title: 'Recipes ✨',
        path: '/recipes',
    },
    {
        title: 'Create Recipe 🍽️',
        path: '/recipes/new',
    }
];

export default function SidebarNav() {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                position: 'fixed',
                height: '100%',
                '& .MuiDrawer-paper': {
                    width: DRAWER_WIDTH,
                    boxSizing: 'border-box',
                    borderRight: '2px solid rgba(0, 0, 0, 0.12)',
                    backgroundColor: 'background.paper',
                    position: 'fixed',
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
                                onClick={() => router.push(item.path)}
                            >
                                <ListItemText primary={item.title} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Drawer>
    );
}