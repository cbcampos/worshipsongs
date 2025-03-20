const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let songs = [];

app.get("/songs", (req, res) => {
    res.json(songs);
});

app.post("/songs", (req, res) => {
    const song = { id: Date.now(), ...req.body };
    songs.push(song);
    res.status(201).json(song);
});

app.put("/songs/:id", (req, res) => {
    const song = songs.find(s => s.id == req.params.id);
    if (song) {
        Object.assign(song, req.body);
        res.json(song);
    } else {
        res.status(404).json({ message: "Song not found" });
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));
