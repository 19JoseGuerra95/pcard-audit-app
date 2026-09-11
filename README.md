# P-Card Audit Assistant

P-Card Audit Assistant is a web application developed for the AI in Accounting assignment.

It combines a SQLite P-card transaction database with an AI-assisted natural-language query interface and a prohibited-purchase dashboard.

## Main Features

- Ask questions about P-card transactions in natural language
- Convert natural-language questions into SQLite SELECT queries
- Execute generated SQL against the local `pcards.db` database
- Display aggregate answers such as counts and total amounts
- Display multi-row transaction results in a readable format
- Search prohibited purchases by transaction description
- Search transactions by vendor
- Filter dashboard searches by year

## Project Structure

- `index.html` — website structure
- `style.css` — website appearance
- `app.js` — frontend behavior
- `server.js` — backend, API routes, OpenAI integration, and SQLite queries
> Note: `pcards.db` is required to run the application locally but is not stored in the GitHub repository because of its large file size.
- `.env.example` — environment variable template
- `.gitignore` — prevents secrets and local files from being committed
- `package.json` — Node.js dependencies and start script

## Security

The OpenAI API key is stored only in the local `.env` file.

The `.env` file is excluded from Git using `.gitignore`, so the API key is not exposed in the frontend or committed to GitHub.

## Local Setup

1. Install dependencies:

   `npm install`

2. Copy `.env.example` to `.env`

3. Add your OpenAI API key to `.env`:

   `OPENAI_API_KEY=your_api_key_here`

4. Start the application:

   `npm start`

5. Open:

   `http://localhost:3000`

## Example Questions

- `How many 2014 transactions mention alcohol?`
- `What is the total amount of 2014 transactions mentioning alcohol?`
- `Show me the 5 largest 2014 transactions mentioning alcohol.`

## Technologies

- Node.js
- Express
- SQLite
- OpenAI API
- HTML
- CSS
- JavaScript

