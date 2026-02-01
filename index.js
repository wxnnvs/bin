const express = require("express");
const fs = require("fs");
const path = require("path");
const escapeHtml = require("escape-html");

const app = express();
const port = process.env.PORT || 3000;

// Directory to store the pastes
const pastesDir = path.join(__dirname, "pastes");
const staticDir = path.join(__dirname, "static");

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
  res.sendFile(path.join(staticDir, "index.html"));
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
    const templatePath = path.join(staticDir, "paste.html");
    let html = fs.readFileSync(templatePath, "utf-8");
    
    // Replace template variables
    html = html.replace("{{id}}", escapeHtml(id));
    html = html.replace("{{content}}", escapeHtml(content));
    
    res.send(html);
  } else {
    res.status(404).send("Paste not found");
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
