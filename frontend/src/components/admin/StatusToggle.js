import React from 'react';
import { Box, Switch, Typography } from '@mui/material';

const StatusToggle = ({ 
  checked, 
  onChange, 
  label, 
  checkedColor = '#1976D2',
  uncheckedColor = '#FFFFFF',
  checkedLabelColor = checkedColor,
  uncheckedLabelColor = '#666666'
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Switch
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        sx={{
          '& .MuiSwitch-switchBase.Mui-checked': {
            color: checkedColor,
          },
          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
            backgroundColor: checkedColor,
          },
          '& .MuiSwitch-track': {
            backgroundColor: uncheckedColor,
          },
        }}
      />
      {label && (
        <Typography
          sx={{
            color: checked ? checkedLabelColor : uncheckedLabelColor,
            fontWeight: 500,
            fontSize: '0.875rem',
          }}
        >
          {label}
        </Typography>
      )}
    </Box>
  );
};

export default StatusToggle;
