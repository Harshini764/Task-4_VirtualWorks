const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const historyList = document.getElementById('historyList');
const statusMessage = document.getElementById('statusMessage');
const newQuoteBtn = document.getElementById('newQuoteBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

async function fetchQuote() {
  try {
    const response = await fetch('/api/quote');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch quote');
    }

    quoteText.textContent = `"${data.quote.text}"`;
    quoteAuthor.textContent = `— ${data.quote.author}`;
    statusMessage.textContent = data.message || '';
    loadHistory();
  } catch (err) {
    quoteText.textContent = 'Sorry, could not load a quote.';
    quoteAuthor.textContent = '';
    statusMessage.textContent = 'Unable to reach the quote API right now. Please try again later.';
    console.error(err);
  }
}

async function loadHistory() {
  try {
    const response = await fetch('/api/history');
    const data = await response.json();

    if (!Array.isArray(data)) {
      historyList.textContent = 'Unable to load history.';
      return;
    }

    if (data.length === 0) {
      historyList.textContent = 'No history yet.';
      return;
    }

    historyList.innerHTML = data
      .map(
        (item) => `
          <article class="history-item">
            <p class="history-text">"${item.text}"</p>
            <p class="history-author">— ${item.author}</p>
            <span class="history-date">${new Date(item.created_at).toLocaleString()}</span>
          </article>
        `
      )
      .join('');
  } catch (err) {
    historyList.textContent = 'Unable to load history.';
    console.error(err);
  }
}

async function clearHistory() {
  if (!confirm('Clear all saved quote history?')) {
    return;
  }

  try {
    const response = await fetch('/api/history/clear', { method: 'POST' });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to clear history');
    }

    quoteText.textContent = 'Quote history cleared. Press the button for a new quote.';
    quoteAuthor.textContent = '';
    loadHistory();
  } catch (err) {
    console.error(err);
  }
}

newQuoteBtn.addEventListener('click', fetchQuote);
clearHistoryBtn.addEventListener('click', clearHistory);

loadHistory();
