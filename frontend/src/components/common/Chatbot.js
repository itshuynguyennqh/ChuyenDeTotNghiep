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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import chatbotIcon from '../../assets/icon-chatbot.png';
import { chatWithBot } from '../../api/chatbotApi';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const suggestedQuestions = [
    "What if I return the bike late?",
    "Rental Terms?",
    "How is the rental deposit?"
  ];

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
        text: response.data.response || 'Sorry, I could not process your request.'
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        type: 'bot',
        text: 'Sorry, there was an error processing your message. Please try again.'
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
                    fontSize: '16px',
                    lineHeight: 1.2,
                  }}
                >
                  BikeGo Assistant
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#666',
                    fontSize: '12px',
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
                      justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
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
                          fontSize: '14px',
                          lineHeight: 1.5,
                          wordWrap: 'break-word',
                        }}
                      >
                        {message.text}
                      </Typography>
                    </Box>
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

            {/* Suggested Questions */}
            {messages.length === 0 && (
              <Box
                sx={{
                  padding: '12px 20px',
                  backgroundColor: '#f5f5f5',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
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
                      fontSize: '13px',
                      padding: '8px 12px',
                      borderRadius: '8px',
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
