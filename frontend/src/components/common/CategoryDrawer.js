import React, { useState, useEffect } from 'react';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    IconButton,
    CircularProgress,
    Typography
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import MenuIcon from '@mui/icons-material/Menu';
import { getStoreCategories } from '../../api/storeApi';

const primaryTypographyProps = {
    fontSize: '1.1rem',
    color: '#2c5a9c',
    fontWeight: 500
};

function CategoryDrawer({ open, onClose, onCategorySelect }) {

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!open) return;
        setLoading(true);
        setError(null);
        getStoreCategories()
            .then((res) => {
                const raw = res?.data?.data ?? res?.data;
                const list = Array.isArray(raw) ? raw : [];
                setCategories(list);
            })
            .catch((err) => {
                setError(err?.message || 'Không tải được danh mục');
                setCategories([]);
            })
            .finally(() => setLoading(false));
    }, [open]);

    const handleCategoryClick = (category) => {
        if (typeof onCategorySelect === 'function') {
            onCategorySelect(category);
        }
        if (typeof onClose === 'function') {
            onClose();
        }
    };

    const drawerContent = (
        <Box
            sx={{ width: 280, height: '100%', backgroundColor: '#f3e9dd' }}
            role="presentation"
            onClick={onClose}
            onKeyDown={onClose}
        >
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton onClick={onClose}>
                    <MenuIcon sx={{ color: '#1976d2', fontSize: 30 }} />
                </IconButton>
            </Box>

            <List>
                <ListItem disablePadding>
                    <ListItemButton
                        sx={{ py: 1.5 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCategoryClick(null);
                        }}
                    >
                        <ListItemText primary="Tất cả danh mục" primaryTypographyProps={primaryTypographyProps} />
                        <NavigateNextIcon sx={{ color: '#333' }} />
                    </ListItemButton>
                </ListItem>
                {loading ? (
                    <ListItem sx={{ justifyContent: 'center', py: 3 }}>
                        <CircularProgress size={28} />
                    </ListItem>
                ) : error ? (
                    <ListItem>
                        <Typography variant="body2" color="error">{error}</Typography>
                    </ListItem>
                ) : (
                    categories.map((cat) => (
                        <ListItem key={cat.id} disablePadding>
                            <ListItemButton
                                sx={{ py: 1.5 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCategoryClick({ id: cat.id, name: cat.name });
                                }}
                            >
                                <ListItemText primary={cat.name} primaryTypographyProps={primaryTypographyProps} />
                                <NavigateNextIcon sx={{ color: '#333' }} />
                            </ListItemButton>
                        </ListItem>
                    ))
                )}
            </List>
        </Box>
    );

    return (
        <Drawer
            anchor="left"
            open={open}
            onClose={onClose}
            PaperProps={{ sx: { backgroundColor: '#f3e9dd' } }}
        >
            {drawerContent}
        </Drawer>
    );
}

export default CategoryDrawer;
