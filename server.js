const path = require('path');
const express = require('express');
const axios = require('axios');
const db = require('./db');

const fallbackQuotes = [
  { text: 'Be yourself; everyone else is already taken.', author: 'Oscar Wilde' },
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'Life is what happens when you’re busy making other plans.', author: 'John Lennon' },
  { text: 'Do not watch the clock. Do what it does. Keep going.', author: 'Sam Levenson' },
  { text: 'The best way out is always through.', author: 'Robert Frost' }
];

function getFallbackQuote() {
  return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
}

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/quote', async (req, res) => {
  try {
    const response = await axios.get('https://api.quotable.io/random');
    const quote = {
      text: response.data.content,
      author: response.data.author || 'Unknown'
    };

    const saved = await db.saveQuote(quote.text, quote.author);
    res.json({ quote, id: saved.lastID, source: 'api' });
  } catch (error) {
    console.error('Quote fetch error:', error.message || error);
    const quote = getFallbackQuote();
    const saved = await db.saveQuote(quote.text, quote.author);
    res.json({
      quote,
      id: saved.lastID,
      source: 'fallback',
      message: 'Using local quote fallback because the external quote API failed.'
    });
  }
});

app.get('/api/history', async (req, res) => {
  try {
    const history = await db.getHistory();
    res.json(history);
  } catch (error) {
    console.error('History fetch error:', error.message || error);
    res.status(500).json({ error: 'Unable to load quote history.' });
  }
});

app.post('/api/history/clear', async (req, res) => {
  try {
    await db.clearHistory();
    res.json({ success: true });
  } catch (error) {
    console.error('History clear error:', error.message || error);
    res.status(500).json({ error: 'Unable to clear history.' });
  }
});

app.listen(port, () => {
  console.log(`Quote Generator running at http://localhost:${port}`);
});
