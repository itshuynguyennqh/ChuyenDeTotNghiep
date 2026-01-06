import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Typography, Box, IconButton, Avatar, Rating,
    TextField, Chip, Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import ReplyIcon from '@mui/icons-material/Reply';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const ProductReviewsModal = ({ open, onClose, product }) => {
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');

    // Mock reviews data - replace with actual API call
    const reviews = product?.Reviews || [
        {
            id: 1,
            username: 'mrbean',
            avatar: 'https://i.pravatar.cc/150?img=1',
            rating: 5,
            date: 'Mar 7, 2022',
            text: "Yo this bike's a beast fr. Been hittin' trails every weekend and it rides SMOOTH af. Light frame, sick design, brakes on point. 100% recommend if ur into off-road stuff.",
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200'
        },
        {
            id: 2,
            username: 'hulkbigboi',
            avatar: 'https://i.pravatar.cc/150?img=2',
            rating: 5,
            date: 'Jul 19, 2022',
            text: "Been commuting w/ this bad boy for 2 months now — no probs at all. Smooth gears, great balance, handles bumps like a champ. 10/10 would cop again",
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200'
        }
    ];

    const overallRating = product?.Rating || 4.8;
    const reviewCount = product?.ReviewCount || reviews.length || 128;
    const filterOptions = ['All Review', 'Unanswered', 'Highest Rated'];

    const handleReply = (reviewId) => {
        if (replyingTo === reviewId) {
            // Submit reply
            console.log('Submitting reply:', replyText);
            setReplyingTo(null);
            setReplyText('');
        } else {
            setReplyingTo(reviewId);
        }
    };

    const handleCancelReply = () => {
        setReplyingTo(null);
        setReplyText('');
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h6" fontWeight="bold">
                        Review for {product?.Name || product?.name || 'Product'}
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                {/* Overall Rating */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StarIcon sx={{ fontSize: 48, color: '#ffc107' }} />
                        <Typography variant="h4" fontWeight="bold">
                            {overallRating}
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        Based on {reviewCount} reviews
                    </Typography>
                </Box>

                {/* Filter Buttons */}
                <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                    {filterOptions.map((filter) => (
                        <Chip
                            key={filter}
                            label={filter}
                            clickable
                            sx={{
                                backgroundColor: filter === 'All Review' ? '#1976d2' : 'transparent',
                                color: filter === 'All Review' ? 'white' : '#666',
                                border: filter !== 'All Review' ? '1px solid #e0e0e0' : 'none',
                                '&:hover': {
                                    backgroundColor: filter === 'All Review' ? '#1976d2' : '#f5f5f5'
                                }
                            }}
                        />
                    ))}
                </Box>

                {/* Reviews List */}
                <Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    {reviews.map((review) => (
                        <Box key={review.id} sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                                <Avatar src={review.avatar} alt={review.username} />
                                <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                        <Typography variant="body1" fontWeight="medium">
                                            {review.username}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {review.date}
                                        </Typography>
                                    </Box>
                                    <Rating value={review.rating} readOnly size="small" />
                                </Box>
                            </Box>
                            <Typography variant="body2" sx={{ mb: 1, ml: 7 }}>
                                {review.text}
                            </Typography>
                            {review.image && (
                                <Box sx={{ ml: 7, mb: 1 }}>
                                    <Box
                                        component="img"
                                        src={review.image}
                                        alt="Review"
                                        sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 1 }}
                                    />
                                </Box>
                            )}
                            
                            {/* Reply Section */}
                            {replyingTo === review.id ? (
                                <Box sx={{ ml: 7, mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <ReplyIcon fontSize="small" />
                                        <Typography variant="body2" fontWeight="medium">
                                            Reply
                                        </Typography>
                                    </Box>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={2}
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Write your reply..."
                                        sx={{ mb: 1 }}
                                    />
                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                        <Button
                                            size="small"
                                            onClick={handleCancelReply}
                                            sx={{ color: '#666' }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            onClick={() => handleReply(review.id)}
                                            disabled={!replyText.trim()}
                                            sx={{ backgroundColor: '#1976d2' }}
                                        >
                                            Submit
                                        </Button>
                                    </Box>
                                </Box>
                            ) : (
                                <Button
                                    size="small"
                                    startIcon={<ReplyIcon />}
                                    onClick={() => handleReply(review.id)}
                                    sx={{ ml: 7, color: '#1976d2', textTransform: 'none' }}
                                >
                                    Reply
                                </Button>
                            )}
                            <Divider sx={{ mt: 2 }} />
                        </Box>
                    ))}
                </Box>

                {/* Scroll Indicator */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <ArrowDownwardIcon sx={{ color: '#ccc' }} />
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} variant="outlined">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProductReviewsModal;
