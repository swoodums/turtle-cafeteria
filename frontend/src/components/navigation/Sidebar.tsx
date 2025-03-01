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
  Divider,
  Collapse,
  useTheme,
  alpha,
  IconButton,
  Avatar,
} from '@mui/material'
import {
  usePathname,
  useRouter 
} from 'next/navigation';
import {
  CalendarMonth as CalendarMonthIcon,
  MenuBook as MenuBookIcon,
  Add as AddIcon,
  ExpandLess,
  ExpandMore,
  ChevronLeft as ChevronLeftIcon,
  RestaurantMenu as RestaurantIcon,
  // Category as CategoryIcon,
  // ShoppingCart as ShoppingCartIcon,
  // LocalOffer as TagIcon,
  Restaurant as DiningIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Define the constant drawer width
const DRAWER_WIDTH = 256;

// Define styled components
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2, 2),
  backgroundImage: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
  color: theme.palette.primary.contrastText,
  // Necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0.5, 1),
  '&.Mui-selected': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.2),
    },
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.light, 0.1),
  },
}));

const CategoryLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  padding: theme.spacing(1.5, 2, 0.5),
}));

// Navigation item interface
interface NavigationItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  children?: NavigationItem[];
}

// Define grouped navigation items
const NAVIGATION_ITEMS: { category: string; items: NavigationItem[] }[] = [
  {
    category: 'Main',
    items: [
      {
        title: 'Recipes',
        path: '/recipes',
        icon: <MenuBookIcon />,
        children: [
          {
            title: 'All Recipes',
            path: '/recipes',
            icon: <MenuBookIcon />,
          },
          {
            title: 'Create Recipe',
            path: '/recipes/new',
            icon: <AddIcon />,
          },
        ],
      },
    ],
  },
  {
    category: 'Planning',
    items: [
      {
        title: 'Weekly Calendar',
        path: '/schedule',
        icon: <CalendarMonthIcon />,
      },
    // Placeholder - we don't have this developed yet, and may not.
    //   {
    //     title: 'Shopping List',
    //     path: '/shopping',
    //     icon: <ShoppingCartIcon />,
    //   },
    ],
  },
  {
    category: 'Management',
    items: [
      {
        title: 'Ingredients',
        path: '/ingredients',
        icon: <DiningIcon />,
      },
      // Placeholder - we don't have this developed yet, and may not.
      // {
      //   title: 'Categories',
      //   path: '/categories',
      //   icon: <CategoryIcon />,
      // },
      // {
      //   title: 'Tags',
      //   path: '/tags',
      //   icon: <TagIcon />,
      // },
    ],
  },
];

// Interface for sidebar props
interface SidebarNavProps {
  open: boolean;
  onClose: () => void;
  variant?: 'permanent' | 'persistent' | 'temporary';
}

export default function SidebarNav({ open, onClose, variant = 'temporary' }: SidebarNavProps) {
  const router = useRouter();
  const pathname = usePathname() || '';
  const theme = useTheme();
  
  // State for tracking expanded menu items
  const [expandedItems, setExpandedItems] = React.useState<Record<string, boolean>>({
    '/recipes': pathname.startsWith('/recipes'),
  });
  
  React.useEffect(() => {
    // Expand parent menus when navigating to child routes
    setExpandedItems(prevExpandedItems => {
      const newExpandedItems = { ...prevExpandedItems };
      NAVIGATION_ITEMS.forEach(group => {
        group.items.forEach(item => {
          if (item.children) {
            const shouldExpand = item.children.some(child => pathname === child.path);
            if (shouldExpand) {
              newExpandedItems[item.path] = true;
            }
          }
        });
      });
      return newExpandedItems;
    });
  }, [pathname]);
  
  // Handle navigation
  const handleNavigation = (path: string) => {
    router.push(path);
    if (variant === 'temporary') {
      onClose();
    }
  };
  
  // Toggle expanded state
  const toggleExpanded = (path: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [path]: !prev[path],
    }));
  };
  
  // Determine if a menu item is selected
  const isSelected = (path: string) => pathname === path;
  
  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <DrawerHeader>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              bgcolor: 'primary.light',
              width: 40,
              height: 40,
              mr: 1.5,
              border: '2px solid',
              borderColor: 'primary.contrastText',
            }}
          >
            <RestaurantIcon />
          </Avatar>
          <Typography variant="h6" fontWeight={600} noWrap>
            Turtle Cafeteria
          </Typography>
        </Box>
        
        {variant === 'temporary' && (
          <IconButton onClick={onClose} sx={{ color: 'primary.contrastText' }}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </DrawerHeader>
      
      <Divider />
      
      <Box sx={{ 
        overflow: 'auto',
        flexGrow: 1,
        py: 1,
      }}>
        {NAVIGATION_ITEMS.map((group) => (
          <Box key={group.category} sx={{ mb: 2 }}>
            <CategoryLabel>{group.category}</CategoryLabel>
            <List disablePadding>
              {group.items.map((item) => (
                <React.Fragment key={item.path}>
                  <ListItem disablePadding>
                    <StyledListItemButton
                      selected={isSelected(item.path) || (item.children && item.children.some(child => isSelected(child.path)))}
                      onClick={() => item.children ? toggleExpanded(item.path) : handleNavigation(item.path)}
                    >
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText 
                        primary={item.title} 
                        primaryTypographyProps={{ 
                          fontWeight: isSelected(item.path) ? 600 : 400,
                          fontSize: '0.95rem',
                        }} 
                      />
                      {item.children && (
                        expandedItems[item.path] ? <ExpandLess /> : <ExpandMore />
                      )}
                    </StyledListItemButton>
                  </ListItem>
                  
                  {/* Child items */}
                  {item.children && (
                    <Collapse in={expandedItems[item.path]} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {item.children.map((child) => (
                          <ListItem key={child.path} disablePadding>
                            <StyledListItemButton
                              selected={isSelected(child.path)}
                              onClick={() => handleNavigation(child.path)}
                              sx={{ pl: 4 }}
                            >
                              <ListItemIcon>{child.icon}</ListItemIcon>
                              <ListItemText 
                                primary={child.title} 
                                primaryTypographyProps={{ 
                                  fontWeight: isSelected(child.path) ? 600 : 400,
                                  fontSize: '0.9rem',
                                }} 
                              />
                            </StyledListItemButton>
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  )}
                </React.Fragment>
              ))}
            </List>
          </Box>
        ))}
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: theme.palette.divider,
          backgroundImage: 
            `linear-gradient(${alpha(theme.palette.background.default, 0.9)}, ${alpha(theme.palette.background.default, 0.9)}), 
            url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23${theme.palette.primary.main.replace('#', '')}' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        },
      }}
    >
      {drawer}
    </Drawer>
  );
}