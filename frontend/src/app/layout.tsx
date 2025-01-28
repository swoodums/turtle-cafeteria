/* frontend/src/app/layout.tsx */

import { Providers } from './providers';
import { Box } from '@mui/material'
import SidebarNav from '@/components/navigation/Sidebar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Box sx={{
            display: 'flex',
            minHeight: '100vh',
            position: 'relative' 
          }}>
            <SidebarNav />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: 3,
                pt: 8,
                minHeight: '100vh',
                marginLeft: '0px',
                width: '100%',
              }}
            >
              {children}
            </Box>
          </Box>
        </Providers>
      </body>
    </html>
  )
}