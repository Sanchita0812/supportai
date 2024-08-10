'use client'

import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useState, useRef, useEffect } from 'react'
import SendIcon from '@mui/icons-material/Send'
import CircularProgress from '@mui/material/CircularProgress'
import { styled } from '@mui/system'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the MED support assistant. How can I help you today?",
    },
  ])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return
    setIsLoading(true)

    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      let assistantContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        assistantContent += text

        // Process the assistant's response
        const content = JSON.parse(assistantContent).content
        renderAssistantResponse(content)
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ])
    } finally {
      setIsLoading(false)
      setMessage('') // Clear the input field after sending the message
    }
  }

  const renderAssistantResponse = (content) => {
    setMessages((messages) => {
      let lastMessage = messages[messages.length - 1]
      let otherMessages = messages.slice(0, messages.length - 1)
      return [
        ...otherMessages,
        { ...lastMessage, content },
      ]
    })
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Custom styled components
  const GradientBox = styled(Box)({
    background: 'linear-gradient(135deg, #3f51b5 30%, #2196f3 90%)',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    padding: '10px 20px',
    color: '#fff',
    textAlign: 'center',
  })

  const MessageBubble = styled(Box)(({ role }) => ({
    background: role === 'assistant' ? '#e3f2fd' : '#c5e1a5',
    color: 'black',
    borderRadius: '20px',
    padding: '12px 20px',
    maxWidth: '75%',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
    fontSize: '16px',
    lineHeight: '1.6',
    wordBreak: 'break-word',
    transition: 'background 0.3s ease',
    ':hover': {
      background: role === 'assistant' ? '#bbdefb' : '#aed581',
    },
  }))

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgcolor="#f3f4f6"
      p={3}
    >
      <Stack
        direction="column"
        width={{ xs: '100%', sm: '500px' }}
        height={{ xs: '100%', sm: '700px' }}
        borderRadius={4}
        boxShadow="0 8px 24px rgba(0, 0, 0, 0.15)"
        bgcolor="white"
        p={3}
        spacing={3}
        position="relative"
      >
        <GradientBox>
          <Typography variant="h5" fontWeight="bold">
            MED Support Assistant
          </Typography>
        </GradientBox>

        <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
          bgcolor="#fafafa"
          p={2}
          borderRadius={4}
          sx={{
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#bbb',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#f1f1f1',
              borderRadius: '4px',
            },
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
              sx={{
                animation: 'fadeIn 0.5s ease',
                '@keyframes fadeIn': {
                  from: { opacity: 0 },
                  to: { opacity: 1 },
                },
              }}
            >
              <MessageBubble role={message.role}>{message.content}</MessageBubble>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>

        <Stack direction="row" spacing={2}>
          <TextField
            label="Type your message..."
            variant="outlined"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            InputProps={{
              style: {
                borderRadius: '30px',
                backgroundColor: '#fff',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#2196f3',
                },
                '&:hover fieldset': {
                  borderColor: '#1976d2',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1976d2',
                },
              },
            }}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={isLoading}
            endIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            sx={{
              borderRadius: '30px',
              bgcolor: 'linear-gradient(135deg, #3f51b5 30%, #2196f3 90%)',
              color: '#fff',
              padding: '10px 20px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
              ':hover': {
                bgcolor: 'linear-gradient(135deg, #303f9f 30%, #1976d2 90%)',
              },
            }}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
