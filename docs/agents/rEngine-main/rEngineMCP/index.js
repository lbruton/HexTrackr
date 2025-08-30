import express from 'express';
const app = express();
const port = 8082;

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/', (req, res) => {
  res.send('MCP Server is running!');
});

app.listen(port, () => {
  console.log(`MCP Server listening at http://localhost:${port}`);
});
