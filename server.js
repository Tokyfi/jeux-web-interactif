// créer un mini serveur web avec Node.js

// const http = require ('http');
// const server = http.createServer((req, res) => {
//     res.end("Bienvenue sur mon serveur Node.js !");
// });
// server.listen(3000, () => {
//     console.log("Serveur démarré sur http://localhost:3000");
// });


const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(cors());
// Dossier des fichiers du jeu
app.use(express.static(path.join(__dirname)));

// route principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});