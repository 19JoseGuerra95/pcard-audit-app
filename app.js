const tabButtons = document.querySelectorAll('.tab-button');
const tabPanels = document.querySelectorAll('.tab-panel');

tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active'));
    tabPanels.forEach(p => p.classList.remove('active'));
    button.classList.add('active');
    document.getElementById(button.dataset.tab).classList.add('active');
  });
});

const questionForm = document.getElementById('question-form');
const questionInput = document.getElementById('question-input');
const questionResult = document.getElementById('question-result');

questionForm.addEventListener('submit', async event => {
  event.preventDefault();
  const question = questionInput.value.trim();
  if (!question) return;

  questionResult.textContent = 'Sending question to the server...';

  try {
    const response = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
    const data = await response.json();
if (data.error) {
  questionResult.textContent = data.error;
} else {
  try {
    const parsed = JSON.parse(data.answer);

    if (Array.isArray(parsed)) {
      questionResult.textContent = parsed
        .map((row, index) => {
          const lines = Object.entries(row)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');

          return `Result ${index + 1}\n${lines}`;
        })
        .join('\n\n');
    } else {
      questionResult.textContent = data.answer;
    }
  } catch {
    questionResult.textContent = data.answer || 'No response returned.';
  }
}  } catch (error) {
    questionResult.textContent = 'The backend is not running yet.';
  }
});

async function runSearch(type) {
  const year = document.getElementById('year-select').value;
  const inputId = type === 'description' ? 'description-search' : 'vendor-search';
  const keyword = document.getElementById(inputId).value.trim();
  const output = document.getElementById('dashboard-result');

  if (!keyword) return;
  output.textContent = 'Searching...';

  try {
    const params = new URLSearchParams({ year, type, keyword });
    const response = await fetch(`/api/search?${params.toString()}`);
    const data = await response.json();
if (data.error) {
  output.textContent = data.error;
} else if (Array.isArray(data.rows)) {
  output.textContent = data.rows
    .map((row, index) => {
      const lines = Object.entries(row)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');

      return `Result ${index + 1}\n${lines}`;
    })
    .join('\n\n');
} else {
  output.textContent = JSON.stringify(data, null, 2);
}  } catch (error) {
    output.textContent = 'The backend is not running yet.';
  }
}

document.getElementById('description-button').addEventListener('click', () => runSearch('description'));
document.getElementById('vendor-button').addEventListener('click', () => runSearch('vendor'));
