import React from 'react';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Typography,
    IconButton
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import MenuIcon from '@mui/icons-material/Menu'; // Icon 3 gạch

function CategoryDrawer({ open, onClose }) {

    // Danh sách danh mục giả lập theo ảnh mẫu của bạn
    const categories = [
        "Mountain Bikes",
        "Road Bikes",
        "Touring Bikes",
        "Gloves",
        "Bib-shorts",
        "Socks",
        "Caps",
        "Bike Racks",
        "Bike Stands",
        "Locks",
        "Helmets"
    ];

    const drawerContent = (
        <Box
            sx={{ width: 280, height: '100%', backgroundColor: '#f3e9dd' }} // Màu nền be giống ảnh
            role="presentation"
            onClick={onClose} // Đóng khi click vào item
            onKeyDown={onClose}
        >
            {/* Phần Header của Drawer (tùy chọn) */}
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton onClick={onClose}>
                    <MenuIcon sx={{ color: '#1976d2', fontSize: 30 }} />
                </IconButton>
            </Box>

            <List>
                {categories.map((text, index) => (
                    <ListItem key={text} disablePadding>
                        <ListItemButton sx={{ py: 1.5 }}>
                            <ListItemText
                                primary={text}
                                primaryTypographyProps={{
                                    fontSize: '1.1rem',
                                    color: '#2c5a9c', // Màu xanh chữ
                                    fontWeight: 500
                                }}
                            />
                            {/* Mũi tên > bên phải */}
                            <NavigateNextIcon sx={{ color: '#333' }} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <Drawer
            anchor="left"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { backgroundColor: '#f3e9dd' } // Đảm bảo toàn bộ drawer màu be
            }}
        >
            {drawerContent}
        </Drawer>
    );
}

export default CategoryDrawer;