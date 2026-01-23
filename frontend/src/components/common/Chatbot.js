import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  TextField,
  Paper,
  Typography,
  Button,
  Avatar,
  CircularProgress,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import chatbotIcon from '../../assets/icon-chatbot.png';
import { chatWithBot, getActiveFAQs } from '../../api/chatbotApi';
import { useNavigate } from 'react-router-dom';

const Chatbot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Focus input when popup opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, messages]);

  // Load FAQs when component mounts or when chatbot opens
  useEffect(() => {
    const loadFAQs = async () => {
      try {
        const response = await getActiveFAQs(10);
        if (response.data?.success && response.data?.data) {
          const questions = response.data.data.map(faq => faq.question);
          setSuggestedQuestions(questions);
        }
      } catch (error) {
        console.error('Failed to load FAQs:', error);
        // Fallback to default questions if API fails
        setSuggestedQuestions([
          "What if I return the bike late?",
          "Rental Terms?",
          "How is the rental deposit?"
        ]);
      }
    };
    
    loadFAQs();
  }, []);

  const handleSendMessage = async (messageText = null) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend || loading) return;

    // Add user message
    const userMessage = { type: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      // Prepare history for context
      const history = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      // Call chatbot API
      const response = await chatWithBot(textToSend, history);
      const botMessage = {
        type: 'bot',
        text: response.data.response || 'Sorry, I could not process your request.',
        actionType: response.data.action_type || 'irrelevant',
        data: response.data.data || null
      };
      setMessages(prev => [...prev, botMessage]);
      
      // If order was successful, trigger cart update event
      if (response.data.action_type === 'order_result') {
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }
    } catch (error) {
      let errorText = 'Sorry, there was an error processing your message. Please try again.';
      
      // Handle authentication error
      if (error?.response?.status === 401) {
        errorText = 'Vui lòng đăng nhập để sử dụng chatbot.';
        // Optionally redirect to login after showing message
        setTimeout(() => {
          navigate('/login', { state: { from: window.location.pathname } });
          setIsOpen(false);
        }, 2000);
      } else if (error?.response?.data?.detail) {
        errorText = error.response.data.detail;
      }
      
      const errorMessage = {
        type: 'bot',
        text: errorText,
        actionType: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedQuestion = (question) => {
    handleSendMessage(question);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chatbot Icon Button */}
      <Box
        sx={{
          position: 'fixed',
          right: { xs: '20px', md: '30px' },
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1000,
          cursor: 'pointer',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-50%) scale(1.1)',
          },
        }}
        onClick={() => setIsOpen(true)}
      >
        <Box
          component="img"
          src={chatbotIcon}
          alt="Chatbot"
          sx={{
            width: { xs: '60px', md: '80px' },
            height: { xs: '60px', md: '80px' },
            filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
          }}
        />
      </Box>

      {/* Chat Popup */}
      {isOpen && (
        <Box
          sx={{
            position: 'fixed',
            bottom: { xs: '20px', md: '30px' },
            right: { xs: '20px', md: '30px' },
            width: { xs: 'calc(100vw - 40px)', sm: '400px', md: '450px' },
            maxWidth: '450px',
            height: { xs: 'calc(100vh - 40px)', sm: '600px' },
            maxHeight: '600px',
            zIndex: 1001,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                backgroundColor: '#ff8c00',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <Avatar
                src={chatbotIcon}
                alt="BikeGo Assistant"
                sx={{
                  width: 48,
                  height: 48,
                  border: '2px solid white',
                }}
              />
              <Box sx={{ flexGrow: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    color: '#333',
                    fontSize: '18px',
                    lineHeight: 1.2,
                  }}
                >
                  BikeGo Assistant
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#666',
                    fontSize: '13px',
                  }}
                >
                  Typically replies instantly
                </Typography>
              </Box>
              <IconButton
                onClick={() => setIsOpen(false)}
                sx={{
                  color: '#333',
                  padding: '4px',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Messages Area */}
            <Box
              sx={{
                flexGrow: 1,
                backgroundColor: '#f5f5f5',
                overflowY: 'auto',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {messages.length === 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#999',
                      textAlign: 'center',
                      fontSize: '15px',
                    }}
                  >
                    Start a conversation with BikeGo Assistant
                  </Typography>
                </Box>
              ) : (
                messages.map((message, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: message.type === 'user' ? 'flex-end' : 'flex-start',
                      gap: '8px',
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: '75%',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        backgroundColor: message.type === 'user' ? '#ff8c00' : '#ffffff',
                        color: message.type === 'user' ? '#fff' : '#333',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: '16px',
                          lineHeight: 1.6,
                          wordWrap: 'break-word',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {message.text}
                      </Typography>
                    </Box>
                    
                    {/* Product List - Show when actionType is product_list */}
                    {message.type === 'bot' && message.actionType === 'product_list' && message.data && Array.isArray(message.data) && message.data.length > 0 && (
                      <Box sx={{ maxWidth: '85%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {message.data.map((product, idx) => (
                          <Card
                            key={idx}
                            sx={{
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                              },
                            }}
                            onClick={() => {
                              const productId = product.ProductID || product.productid || product.product_id;
                              if (productId) {
                                navigate(`/products/${productId}`);
                                setIsOpen(false);
                              }
                            }}
                          >
                            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                    {product.Name || product.name}
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                                    {product.Color && (
                                      <Chip label={product.Color} size="small" sx={{ height: '20px', fontSize: '11px' }} />
                                    )}
                                    {product.Size && (
                                      <Chip label={`Size: ${product.Size}`} size="small" sx={{ height: '20px', fontSize: '11px' }} />
                                    )}
                                  </Box>
                                  <Typography variant="body2" sx={{ mt: 0.5, color: '#ff8c00', fontWeight: 'bold' }}>
                                    ${product.ListPrice ? parseFloat(product.ListPrice).toFixed(2) : 'N/A'}
                                    {product.RentPrice && ` / Rent: $${parseFloat(product.RentPrice).toFixed(2)}`}
                                  </Typography>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                      </Box>
                    )}
                    
                    {/* Order Result - Show button to go to cart */}
                    {message.type === 'bot' && message.actionType === 'order_result' && (
                      <Button
                        variant="contained"
                        startIcon={<ShoppingCartIcon />}
                        onClick={() => {
                          navigate('/cart');
                          setIsOpen(false);
                        }}
                        sx={{
                          backgroundColor: '#ff8c00',
                          color: '#fff',
                          textTransform: 'none',
                          fontSize: '14px',
                          padding: '8px 16px',
                          '&:hover': {
                            backgroundColor: '#e67e00',
                          },
                        }}
                      >
                        Xem giỏ hàng
                      </Button>
                    )}
                  </Box>
                ))
              )}
              {loading && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                  }}
                >
                  <Box
                    sx={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <CircularProgress size={16} />
                  </Box>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Suggested Questions - Luôn hiển thị để người dùng có thể hỏi tiếp */}
            {suggestedQuestions.length > 0 && (
              <Box
                sx={{
                  padding: '12px 20px',
                  backgroundColor: '#f5f5f5',
                  display: 'flex',
                  flexDirection: 'row',
                  gap: '8px',
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  borderTop: messages.length > 0 ? '1px solid #e0e0e0' : 'none',
                  '&::-webkit-scrollbar': {
                    height: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: '#f0f0f0',
                    borderRadius: '3px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#ccc',
                    borderRadius: '3px',
                    '&:hover': {
                      backgroundColor: '#999',
                    },
                  },
                }}
              >
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outlined"
                    onClick={() => handleSuggestedQuestion(question)}
                    sx={{
                      textTransform: 'none',
                      borderColor: '#1976d2',
                      color: '#1976d2',
                      fontSize: '15px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      fontWeight: 500,
                      '&:hover': {
                        borderColor: '#1565c0',
                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                      },
                    }}
                  >
                    {question}
                  </Button>
                ))}
              </Box>
            )}

            {/* Input Area */}
            <Box
              sx={{
                padding: '16px 20px',
                backgroundColor: '#ffffff',
                borderTop: '1px solid #e0e0e0',
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
              }}
            >
              <TextField
                inputRef={inputRef}
                fullWidth
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '24px',
                    backgroundColor: '#f5f5f5',
                    fontSize: '16px',
                    '& fieldset': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover fieldset': {
                      borderColor: '#bdbdbd',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff8c00',
                    },
                  },
                  '& .MuiInputBase-input': {
                    fontSize: '16px',
                    padding: '10px 14px',
                  },
                }}
              />
              <IconButton
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || loading}
                sx={{
                  backgroundColor: '#ff8c00',
                  color: '#fff',
                  padding: '10px',
                  '&:hover': {
                    backgroundColor: '#e67e00',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: '#ccc',
                    color: '#fff',
                  },
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Paper>
        </Box>
      )}
    </>
  );
};

export default Chatbot;
