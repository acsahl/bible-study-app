import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, TextField, Typography, Container, Paper, List, ListItem, ListItemText, IconButton, Grid } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

function Notes() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [markedDates, setMarkedDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bibleReference, setBibleReference] = useState('');
  const [bibleUrl, setBibleUrl] = useState('');
  // Format date as YYYY-MM-DD
  const formatDate = (date) => date.toISOString().split('T')[0];

  useEffect(() => {
    // Format the selected date to 'YYYY-MM-DD' for comparison
    const selectedDateString = formatDate(selectedDate);
    
    axios.get('http://localhost:3000/notes')  // Fetch all notes
      .then(response => {
        console.log("API Response:", response.data);
        
        // Fix the key from note.date → note.data
        const filteredNotes = response.data.filter(note => {
          console.log("Raw note.data:", note.data);
          const noteDate = formatDate(new Date(note.data));  // Correct key usage
          return noteDate === selectedDateString;
        });
  
        setNotes(filteredNotes);
  
        // Extract and format the dates of notes for marking on the calendar
        const noteDates = response.data.map(note => formatDate(new Date(note.data))); // Correct key usage
        setMarkedDates(noteDates);
      })
      .catch(error => console.error('Error fetching notes:', error));
  }, [selectedDate]);

  const addNote = () => {
    const formattedDate = formatDate(selectedDate);
    const newNote = { title, text, date: formattedDate };

    axios.post('http://localhost:3000/notes', newNote)
      .then(response => {
        setNotes([...notes, response.data]);
        setTitle('');
        setText('');

        // Update marked dates with the new note date
        setMarkedDates(prev => [...new Set([...prev, formattedDate])]);
      })
      .catch(error => console.error('Error adding note:', error));
  };

  const deleteNote = (id) => {
    axios.delete(`http://localhost:3000/notes/${id}`)
      .then(() => {
        setNotes(notes.filter(note => note._id !== id));
      })
      .catch(error => console.error('Error deleting note:', error));
  };

  const openBibleReference = () => {
    if(bibleReference.trim()) {
        const formattedRef = bibleReference.replace("/s+g", "+");
        const url = `https://www.biblegateway.com/passage/?search=${formattedRef}&version=NIV`;
        setBibleUrl(url);
    }
  }
  // Highlight dates with notes in the calendar
  const tileClassName = ({ date }) => {
    const dateString = formatDate(date);
    return markedDates.includes(dateString) ? 'marked' : '';
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: '50px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', flexDirection: 'column', width: '65%' }}>
        <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
          <Typography variant="h4" align="center" gutterBottom>
            Bible Devotional Tracker
          </Typography>
          <TextField
            label="Title"
            variant="outlined"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ marginBottom: '10px' }}
          />
          <TextField
            label="Text"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ marginBottom: '20px' }}
          />
          <Button variant="contained" color="primary" fullWidth onClick={addNote}>
            Add Note
          </Button>
        </Paper>

        <Paper elevation={3} style={{ padding: '20px' }}>
          <Typography variant="h6" gutterBottom>
            Your Notes for {formatDate(selectedDate)}
          </Typography>
          <List>
            {notes.map(note => (
              <ListItem key={note._id} style={{ marginBottom: '10px' }}>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item xs={10}>
                    <ListItemText
                      primary={<Typography variant="h6">{note.title}</Typography>}
                      secondary={<Typography variant="body2">{note.text}</Typography>}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <IconButton onClick={() => deleteNote(note._id)} color="secondary">
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </ListItem>
            ))}
          </List>
        </Paper>
        {bibleUrl && (
            <Paper elevation={3} style={{ marginTop: '15px', height: '400px', overflow: 'hidden' }}>
              <iframe
                src={bibleUrl}
                title="Bible Reference"
                width="100%"
                height="100%"
                style={{ border: 'none' }}
              />
            </Paper>
          )}
      </div>
      <div style={{ width: '30%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Calendar Section */}
        <Paper elevation={3} style={{ padding: '20px' }}>
          <Typography variant="h6" gutterBottom align="center">Calendar</Typography>
          <Calendar value={selectedDate} onChange={setSelectedDate} />
        </Paper>

        
        <Paper elevation={3} style={{ padding: '20px' }}>
          <Typography variant="h6" gutterBottom align="center">Search up the passage!</Typography>
          <TextField
            label="Enter Reference (e.g., John 3:16)"
            variant="outlined"
            fullWidth
            value={bibleReference}
            onChange={(e) => setBibleReference(e.target.value)}
            style={{ marginBottom: '10px' }}
          />
          <Button variant="contained" color="primary" fullWidth onClick={openBibleReference}>
            Go to Bible Verse
          </Button>
          

        </Paper>
      </div>
      
    </Container>
  );
}

export default Notes;
