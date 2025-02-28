require('dotenv').config();

const express = require('express');

const mongoose = require('mongoose');

const cors = require('cors');

const app = express();
app.use(cors());


const uri = process.env.MONGO_URI;
mongoose.connect(uri)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('Error connecting to MongoDB:', err));


const noteSchema = new mongoose.Schema({
    title:String,
    text:String,
    data: {type: Date, default: Date.now},
});

const Note = mongoose.model('Note', noteSchema);

app.use(express.json());
app.use(cors());



app.post('/notes', async (req, res) => {
    const { title, text } = req.body;
    if (!title || !text) {
        return res.status(400).send('Title and content are required');
      }
    try {
        const newNote = new Note({
            title: title,
            text: text,
            date: new Date(),
          });

        const savedNote = await newNote.save();
        res.status(201).json(savedNote); 
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).send('Error creating note');
    }
});

app.get('/notes', async (req, res) => {
    try {

      let notes;
      if(date) {
        const startDate = new Date(date);
        startDate.setHours(0,0,0,0);
        const endDate = new Date(date);
        endDate.setHours(23,59,59,999);
        notes = await Note.find({
            date: { $gte: startDate, $lte: endDate}
        });
      } else {
        notes = await Note.find();
      }
      
      res.status(200).json(notes);
    } catch (err) {
      res.status(500).send('Error fetching notes');
    }
  });



app.delete('/notes/:id', async (req,res) => {
    const noteId = req.params.id;
    try {
        const deletedNote = await Note.findByIdAndDelete(noteId);

        if (!deletedNote) {
            return res.status(404).send('Note not found');
        }
        res.status(200).json({ message: 'Note deleted successfully', deletedNote });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).send('Error deleting note');
    }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});