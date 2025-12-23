import React from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Collapse,
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

function CategoryList({ categories, openCategoryId, handleToggle }) {
    return (
        <Box sx={{ pr: 2 }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>Categories</Typography>
            <List component="nav">
                {categories.map((category) => {
                    const isExpanded = openCategoryId === category.ProductCategoryID;

                    return (
                        <React.Fragment key={category.ProductCategoryID}>
                            <ListItem disablePadding sx={{ mr: 2 }}>
                                <ListItemButton
                                    onClick={() => handleToggle(category.ProductCategoryID)}
                                    sx={{
                                        color: '#2c3e50',
                                        '&:hover': { color: '#f37021', backgroundColor: 'transparent' }
                                    }}
                                >
                                    <ListItemText primary={
                                        <Typography variant="body1" fontWeight={500}>
                                            {category.Name}
                                        </Typography>
                                    } />
                                    {category.subcategories && category.subcategories.length > 0 &&
                                        (isExpanded ? <ExpandLess /> : <ExpandMore />)
                                    }
                                </ListItemButton>
                            </ListItem>
                            {category.subcategories && category.subcategories.length > 0 && (
                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding sx={{ pl: 2, borderLeft: '2px solid #ddd', ml: 1.5 }}>
                                        {category.subcategories.map((subcat) => (
                                            <ListItemButton key={subcat.id} sx={{ py: 0.5 }}>
                                                <ListItemText primary={
                                                    <Typography variant="body2" color="text.secondary">
                                                        {subcat.name}
                                                    </Typography>
                                                } />
                                            </ListItemButton>
                                        ))}
                                    </List>
                                </Collapse>
                            )}
                        </React.Fragment>
                    );
                })}
            </List>
        </Box>
    );
}

export default CategoryList;
