'use client'

import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useState, useRef, useEffect } from 'react'
import SendIcon from '@mui/icons-material/Send'
import CircularProgress from '@mui/material/CircularProgress'
import { styled } from '@mui/system'

// Custom styled components
const GradientBox = styled(Box)({
  background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
  borderRadius: '10px',
  padding: '12px 24px',
  color: '#fff',
  textAlign: 'center',
  marginBottom: '20px',
})

const MessageBubble = styled(Box)(({ role }) => ({
  background: role === 'assistant' ? '#f0f0f0' : '#007aff',
  color: role === 'assistant' ? '#333' : '#fff',
  borderRadius: '18px',
  padding: '14px 20px',
  maxWidth: '70%',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  fontSize: '15px',
  lineHeight: '1.5',
  wordBreak: 'break-word',
  alignSelf: role === 'assistant' ? 'flex-start' : 'flex-end',
  margin: '4px 0',
}))

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

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{
        background: 'linear-gradient(135deg, #e0eafc, #cfdef3)',
      }}
    >
      <Stack
        direction="column"
        width={{ xs: '100%', sm: '450px', md: '600px' }}
        height={{ xs: '100%', sm: '80%' }}
        borderRadius={4}
        boxShadow="0 8px 30px rgba(0, 0, 0, 0.2)"
        bgcolor="#fff"
        p={2}
        spacing={2}
        position="relative"
      >
        <GradientBox>
          <Typography variant="h5" fontWeight="bold" sx={{ fontSize: '1.25rem' }}>
            MED Support Assistant
          </Typography>
        </GradientBox>

        <Stack
          direction="column"
          spacing={1.5}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
          p={2}
          borderRadius={4}
          sx={{
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#888',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#f1f1f1',
              borderRadius: '3px',
            },
          }}
        >
          {messages.map((message, index) => (
            <MessageBubble key={index} role={message.role}>
              {message.content}
            </MessageBubble>
          ))}
          <div ref={messagesEndRef} />
        </Stack>

        <Stack direction="row" spacing={2} sx={{ padding: '0 10px' }}>
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
                borderRadius: '20px',
                backgroundColor: '#fff',
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#ccc',
                },
                '&:hover fieldset': {
                  borderColor: '#007aff',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#007aff',
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
              borderRadius: '50%',
              minWidth: '50px',
              minHeight: '50px',
              bgcolor: '#007aff',
              color: '#fff',
              ':hover': {
                bgcolor: '#005bb5',
              },
            }}
          >
            {isLoading ? '' : <SendIcon />}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
