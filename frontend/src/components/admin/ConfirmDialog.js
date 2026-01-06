import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  TextField,
  InputAdornment,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PersonIcon from '@mui/icons-material/Person';

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'error',
  showInput = false,
  inputLabel,
  inputValue,
  onInputChange,
  warningMessage,
  type = 'delete', // 'delete', 'warning', 'info'
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {type === 'delete' && (
            <WarningIcon sx={{ color: 'error.main', fontSize: '1.5rem' }} />
          )}
          {type === 'warning' && (
            <ErrorOutlineIcon sx={{ color: 'warning.main', fontSize: '1.5rem' }} />
          )}
          <Typography variant="h6" fontWeight="bold">
            {title}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          This action requires confirmation.
        </Typography>
      </DialogTitle>
      <DialogContent>
        {message && (
          <Typography variant="body1" sx={{ mb: 2 }}>
            {message}
          </Typography>
        )}
        
        {showInput && inputLabel && (
          <TextField
            fullWidth
            label={inputLabel}
            value={inputValue || ''}
            onChange={(e) => onInputChange && onInputChange(e.target.value)}
            disabled
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon />
                </InputAdornment>
              ),
            }}
          />
        )}
        
        {warningMessage && (
          <Alert 
            severity={type === 'delete' ? 'warning' : 'info'}
            icon={type === 'delete' ? <ErrorOutlineIcon /> : undefined}
            sx={{ mb: 2 }}
          >
            <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>
              {type === 'delete' ? 'System Check' : 'Information'}
            </Typography>
            <Typography variant="body2">
              {warningMessage}
            </Typography>
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderColor: '#ccc', color: '#666' }}>
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={confirmColor}
          sx={{
            backgroundColor: confirmColor === 'error' ? '#D32F2F' : undefined,
            '&:hover': {
              backgroundColor: confirmColor === 'error' ? '#C62828' : undefined,
            },
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
