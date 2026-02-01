const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// Directory to store the pastes
const pastesDir = path.join(__dirname, "pastes");

// Ensure the pastes directory exists
if (!fs.existsSync(pastesDir)) {
  fs.mkdirSync(pastesDir);
}

// Function to generate a short random alphanumeric string
function generateShortId(length = 6) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Minimal Bin</title>
    </head>
    <body>
      <form action="/paste" method="POST">
        <textarea name="content"></textarea><br>
        <button type="submit">Paste</button>
      </form>
      <style>
        body {
          background-color: #121212;
          color: #e0e0e0;
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          flex-direction: column;
        }
        
        form {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        textarea {
          width: 30vw;
          height: 50vh;
          background-color: #333;
          color: #e0e0e0;
          border: 1px solid #444;
          padding: 10px;
          font-size: 14px;
          resize: none; /* Prevent resizing */
        }
        
        button {
          margin-top: 10px;
          padding: 10px 20px;
          background-color: #444;
          color: #e0e0e0;
          border: none;
          cursor: pointer;
        }
        
        button:hover {
          background-color: #555;
        }
        
        pre {
          background-color: #333;
          padding: 10px;
          border: 1px solid #444;
          color: #e0e0e0;
        }
        
        @media (max-width: 768px) {
          textarea {
            width: 90vw;
          }
          
          button {
            padding: 12px 24px;
            font-size: 16px;
          }
        }
  
      </style>
    </body>
    </html>
  `);
});

app.post("/paste", (req, res) => {
  let id = generateShortId(); // Generate a short ID

  // Ensure the ID is unique by checking for existing files
  while (fs.existsSync(path.join(pastesDir, `${id}.txt`))) {
    id = generateShortId();
  }

  const content = req.body.content;
  const filePath = path.join(pastesDir, `${id}.txt`);
  fs.writeFileSync(filePath, content);

  res.redirect(`/paste/${id}`);
});

app.get("/paste/:id", (req, res) => {
  const id = req.params.id;
  const filePath = path.join(pastesDir, `${id}.txt`);

  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf-8");
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Paste ${id}</title>
      </head>
      <body>
        <pre>${content}</pre>
        <style>
        body {
          background-color: #121212;
          color: #e0e0e0;
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          flex-direction: column;
        }
        
        form {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        textarea {
          width: 300px;
          height: 150px;
          background-color: #333;
          color: #e0e0e0;
          border: 1px solid #444;
          padding: 10px;
          font-size: 14px;
          resize: none; /* Prevent resizing */
        }
        
        button {
          margin-top: 10px;
          padding: 10px 20px;
          background-color: #444;
          color: #e0e0e0;
          border: none;
          cursor: pointer;
        }
        
        button:hover {
          background-color: #555;
        }
        
        pre {
          background-color: #333;
          padding: 10px;
          border: 1px solid #444;
          color: #e0e0e0;
          max-width: 50vw; /* Limit the width */
          max-height: 80vh; /* Limit the height */
          overflow-y: auto; /* Enable vertical scrolling */
          overflow-x: hidden; /* Prevent horizontal scrolling */
          white-space: pre-wrap; /* Wrap lines */
          word-wrap: break-word; /* Break long words */
        }
        
        @media (max-width: 768px) {
          pre {
            max-width: 90vw;
          }
        }
  
      </style>
      </body>
      </html>
    `);
  } else {
    res.status(404).send("Paste not found");
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
