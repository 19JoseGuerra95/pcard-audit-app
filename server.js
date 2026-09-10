require('dotenv').config();
const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const db = new sqlite3.Database(path.join(__dirname, 'pcards.db'));

app.use(express.json());
app.use(express.static(__dirname));

app.get('/api/search', (req, res) => {
  const year = Number(req.query.year || 2014);
  const type = req.query.type;
  const keyword = String(req.query.keyword || '').trim();

  if (!['description', 'vendor'].includes(type) || !keyword) {
    return res.status(400).json({ error: 'Invalid search parameters.' });
  }

  const field = type === 'description' ? 'Description' : 'Vendor';
  const sql = `
    SELECT Year, Month, FullName, Description, Amount, Vendor, TransactionDate, PostedDate, MCC
    FROM pcards
    WHERE Year = ? AND ${field} LIKE ?
    ORDER BY TransactionDate ASC, Amount DESC
    LIMIT 500
  `;

  db.all(sql, [year, `%${keyword}%`], (error, rows) => {
    if (error) return res.status(500).json({ error: error.message });
    res.json({ count: rows.length, rows });
  });
});

app.post('/api/ask', async (req, res) => {
  const question = String(req.body.question || '').trim();
  if (!question) return res.status(400).json({ error: 'Question is required.' });

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({
      error: 'OPENAI_API_KEY is not configured on the server yet.'
    });
  }

try {
    const response = await openai.responses.create({
model: 'gpt-5.6-luna',
input: `Convert this question into a SQLite SELECT query.

Table: pcards
Columns:
Year
Month
FullName
Description
Amount
Vendor
TransactionDate
PostedDate
MCC

Rules:
- Return only SQL.
- Use only SELECT.
- Do not use INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, or PRAGMA.
- Use the pcards table only.
- Never use SELECT *. For row-level results, select only Year, Month, FullName, Description, Amount, Vendor, TransactionDate, PostedDate, and MCC.
- Use LIKE with % for text searches when appropriate.
- If the question asks whether transactions "mention" a term without naming a specific field, search only the Description column.
Question: ${question}`  });

const sql = response.output_text
  .replace(/```sql/gi, '')
  .replace(/```/g, '')
  .replace(/\bILIKE\b/gi, 'LIKE')
  .trim();

if (!/^SELECT\b/i.test(sql)) {
  return res.status(400).json({ error: 'Only SELECT queries are allowed.' });
}

db.all(sql, [], (dbError, rows) => {
  if (dbError) {
    return res.status(500).json({ error: dbError.message });
  }

  res.json({
answer: rows.length === 1 && Object.keys(rows[0]).length === 1
  ? String(Object.values(rows[0])[0])
  : JSON.stringify(rows, null, 2)  });
});} catch (error) {
  console.error(error);
  res.status(500).json({ error: 'OpenAI request failed.' });
}});

app.listen(PORT, () => {
  console.log(`P-Card Audit Assistant running at http://localhost:${PORT}`);
});
