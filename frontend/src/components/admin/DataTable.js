import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  Box,
  Typography,
} from '@mui/material';

const DataTable = ({
  columns,
  rows,
  page = 1,
  totalPages = 1,
  onPageChange,
  onRowClick,
  loading = false,
  emptyMessage = 'No data available',
}) => {
  return (
    <Box>
      <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  sx={{
                    fontWeight: 600,
                    color: '#333',
                    fontSize: '0.875rem',
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                  <Typography>Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">{emptyMessage}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, rowIndex) => (
                <TableRow
                  key={row.id || rowIndex}
                  hover
                  onClick={() => onRowClick && onRowClick(row)}
                  sx={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    '&:last-child td, &:last-child th': { border: 0 },
                  }}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align || 'left'}
                      sx={{ fontSize: '0.875rem' }}
                    >
                      {column.render
                        ? column.render(row[column.id], row)
                        : row[column.id]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => onPageChange(value)}
            color="primary"
            sx={{
              '& .MuiPaginationItem-root.Mui-selected': {
                backgroundColor: '#FE7E15',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#FE7E15',
                },
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default DataTable;
