import React from 'react';
import { Chip, Box } from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

const statusConfig = {
  // Order Statuses
  pending: { color: '#4CAF50', bgColor: '#E8F5E9', label: 'Pending' },
  confirmed: { color: '#2196F3', bgColor: '#E3F2FD', label: 'Confirmed' },
  preparing: { color: '#4CAF50', bgColor: '#E8F5E9', label: 'Preparing' },
  shipped: { color: '#9C27B0', bgColor: '#F3E5F5', label: 'Shipped' },
  delivered: { color: '#795548', bgColor: '#EFEBE9', label: 'Delivered' },
  cancelled: { color: '#E91E63', bgColor: '#FCE4EC', label: 'Cancelled' },
  cancel_requested: { color: '#FFF9C4', bgColor: '#FFFDE7', label: 'Cancel Requested' },
  returned: { color: '#000000', bgColor: '#FAFAFA', label: 'Returned' },
  return_requested: { color: '#000000', bgColor: '#FAFAFA', label: 'Return Requested' },
  
  // Rental Statuses
  renting: { color: '#FF9800', bgColor: '#FFF3E0', label: 'Renting' },
  overdue: { color: '#F44336', bgColor: '#FFEBEE', label: 'Overdue' },
  returning: { color: '#000000', bgColor: '#FAFAFA', label: 'Returning' },
  inspecting: { color: '#795548', bgColor: '#EFEBE9', label: 'Inspecting' },
  completed: { color: '#4CAF50', bgColor: '#E8F5E9', label: 'Completed' },
  
  // Product Statuses
  in_stock: { color: '#4CAF50', bgColor: '#E8F5E9', label: 'In Stock' },
  low_stock: { color: '#FF9800', bgColor: '#FFF3E0', label: 'Low Stock' },
  out_of_stock: { color: '#D32F2F', bgColor: '#FFEBEE', label: 'Out Of Stock' },
  rented_out: { color: '#1976D2', bgColor: '#E3F2FD', label: 'Rented Out' },
  
  // Customer/Staff Statuses
  active: { color: '#4CAF50', bgColor: '#E8F5E9', label: 'Active' },
  inactive: { color: '#9E9E9E', bgColor: '#F5F5F5', label: 'Inactive' },
  banned: { color: '#F44336', bgColor: '#FFEBEE', label: 'Banned' },
  
  // Promotion Statuses
  draft: { color: '#9E9E9E', bgColor: '#F5F5F5', label: 'Draft' },
  scheduled: { color: '#2196F3', bgColor: '#E3F2FD', label: 'Scheduled' },
  paused: { color: '#FF9800', bgColor: '#FFF3E0', label: 'Paused' },
  expired: { color: '#9E9E9E', bgColor: '#F5F5F5', label: 'Expired' },
  limit_reached: { color: '#795548', bgColor: '#EFEBE9', label: 'Limit Reached' },
  
  // FAQ Status
  'active': { color: '#4CAF50', bgColor: '#E8F5E9', label: 'Active' },
  'inactive': { color: '#9E9E9E', bgColor: '#F5F5F5', label: 'Inactive' },
};

const StatusBadge = ({ status, customLabel }) => {
  // Map numeric status values to string equivalents
  // Customer/Staff status: 1 = active, 0 = banned/inactive
  let statusString = '';
  if (status === 1 || status === '1') {
    statusString = 'active';
  } else if (status === 0 || status === '0') {
    statusString = 'banned';
  } else if (status != null) {
    statusString = String(status);
  }
  
  // Normalize status to lowercase with underscores
  const normalizedStatus = statusString.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
  const config = statusConfig[normalizedStatus] || { 
    color: '#9E9E9E', 
    bgColor: '#F5F5F5', 
    label: statusString || 'Unknown' 
  };
  
  return (
    <Chip
      icon={
        <FiberManualRecordIcon 
          sx={{ 
            fontSize: '0.75rem',
            color: config.color
          }} 
        />
      }
      label={customLabel || config.label}
      sx={{
        backgroundColor: config.bgColor,
        color: config.color,
        fontWeight: 500,
        fontSize: '0.875rem',
        '& .MuiChip-icon': {
          color: config.color,
        },
      }}
      size="small"
    />
  );
};

export default StatusBadge;
