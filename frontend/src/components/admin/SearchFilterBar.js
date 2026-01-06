import React from 'react';
import { Box, TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';

const SearchFilterBar = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [], // Array of { label, value, options, onChange }
  sx = {},
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', ...sx }}>
      {/* Search Input */}
      <TextField
        placeholder={searchPlaceholder}
        value={searchValue || ''}
        onChange={(e) => onSearchChange(e.target.value)}
        size="small"
        sx={{
          flexGrow: 1,
          minWidth: 200,
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'white',
          },
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon sx={{ color: '#999' }} />
            </InputAdornment>
          ),
        }}
      />
      
      {/* Filter Dropdowns */}
      {filters.map((filter, index) => (
        <FormControl key={index} size="small" sx={{ minWidth: 150 }}>
          <InputLabel>{filter.label}</InputLabel>
          <Select
            value={filter.value || ''}
            onChange={(e) => filter.onChange(e.target.value)}
            label={filter.label}
            sx={{ backgroundColor: 'white' }}
          >
            {filter.options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ))}
    </Box>
  );
};

export default SearchFilterBar;
