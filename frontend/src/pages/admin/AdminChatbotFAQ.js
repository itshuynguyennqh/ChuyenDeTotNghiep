import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  getAdminFAQs,
  createAdminFAQ,
  updateAdminFAQ,
  deleteAdminFAQ,
} from '../../api/adminApi';
import DataTable from '../../components/admin/DataTable';
import SearchFilterBar from '../../components/admin/SearchFilterBar';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

const AdminChatbotFAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editFAQ, setEditFAQ] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    keywords: '',
    status: 'active',
  });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, faq: null });

  useEffect(() => {
    loadFAQs();
  }, [statusFilter]);

  // Reload FAQs when search value changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadFAQs();
    }, 500); // Debounce 500ms
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  const loadFAQs = async () => {
    try {
      setLoading(true);
      // Build params object - only include status if not 'all'
      const params = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (searchValue) {
        params.search = searchValue;
      }
      
      const response = await getAdminFAQs(params);
      // API returns PagedResponse with structure: {status, code, data: [...], pagination}
      // Extract the actual array from response.data.data
      setFaqs(response.data?.data || []);
    } catch (error) {
      console.error('Failed to load FAQs:', error);
      setFaqs([]); // Set empty array on error to prevent filter errors
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (faq = null) => {
    if (faq) {
      setEditFAQ(faq);
      // Convert keywords array to comma-separated string for form
      const keywordsStr = Array.isArray(faq.keywords) 
        ? faq.keywords.join(', ') 
        : (faq.keywords || '');
      setFormData({
        question: faq.question || '',
        answer: faq.answer || '',
        keywords: keywordsStr,
        status: faq.status || 'active',
      });
    } else {
      setEditFAQ(null);
      setFormData({
        question: '',
        answer: '',
        keywords: '',
        status: 'active',
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditFAQ(null);
    setFormData({
      question: '',
      answer: '',
      keywords: '',
      status: 'active',
    });
  };

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async () => {
    try {
      // Convert keywords string to array for API
      const keywordsArray = formData.keywords
        ? formData.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0)
        : [];
      
      const payload = {
        question: formData.question,
        answer: formData.answer,
        keywords: keywordsArray,
        status: formData.status,
      };

      if (editFAQ) {
        await updateAdminFAQ(editFAQ.id, payload);
      } else {
        await createAdminFAQ(payload);
      }
      loadFAQs();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save FAQ:', error);
      alert('Failed to save FAQ');
    }
  };

  const handleDelete = async () => {
    if (deleteDialog.faq) {
      try {
        await deleteAdminFAQ(deleteDialog.faq.id);
        loadFAQs();
        setDeleteDialog({ open: false, faq: null });
      } catch (error) {
        console.error('Failed to delete FAQ:', error);
        alert('Failed to delete FAQ');
      }
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  const columns = [
    { id: 'question', label: 'QUESTION' },
    {
      id: 'answer',
      label: 'ANSWER (PREVIEW)',
      render: (value) => (
        <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {value}
        </Typography>
      ),
    },
    {
      id: 'keywords',
      label: 'KEYWORDS',
      render: (value) => {
        if (Array.isArray(value)) {
          return value.join(', ');
        }
        return value || '';
      },
    },
    {
      id: 'status',
      label: 'STATUS',
      render: (value) => <StatusBadge status={value} />,
    },
    {
      id: 'actions',
      label: 'ACTIONS',
      align: 'center',
      render: (value, row) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenModal(row);
            }}
            sx={{ color: '#FF9800' }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteDialog({ open: true, faq: row });
            }}
            sx={{ color: '#F44336' }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  // No need for client-side filtering since API handles search and status filter
  const rows = (Array.isArray(faqs) ? faqs : []).map((faq) => ({
    id: faq.id,
    question: faq.question,
    answer: faq.answer,
    keywords: faq.keywords,
    status: faq.status,
    ...faq,
  }));

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, color: '#1A1A2E' }}>
        Chatbot & FAQ Management
      </Typography>

      <Box sx={{ mb: 3 }}>
        <SearchFilterBar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="Search Q&A..."
          filters={[
            {
              label: 'Status',
              value: statusFilter,
              onChange: setStatusFilter,
              options: statusOptions,
            },
          ]}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
          sx={{ backgroundColor: '#FF9800', '&:hover': { backgroundColor: '#F57C00' } }}
        >
          Add new Q&A
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataTable columns={columns} rows={rows} emptyMessage="No FAQs found" />
      )}

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>{editFAQ ? 'Edit Q&A' : 'Add New Q&A'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Question"
            value={formData.question}
            onChange={handleChange('question')}
            sx={{ mb: 2, mt: 2 }}
            required
          />
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Answer"
            value={formData.answer}
            onChange={handleChange('answer')}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label="Keywords"
            value={formData.keywords}
            onChange={handleChange('keywords')}
            helperText="Comma-separated keywords"
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.status === 'active'}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.checked ? 'active' : 'inactive' })
                }
              />
            }
            label="Active"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!formData.question || !formData.answer}
            sx={{ backgroundColor: '#FF9800' }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, faq: null })}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete this Q&A?`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        type="delete"
      />
    </Box>
  );
};

export default AdminChatbotFAQ;
