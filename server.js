const express = require("express");
const path = require("path");
const fs = require("fs");
const util = require("util");
const uniqid = require("uniqid");
const app = express();

const fsReadFileAsync = util.promisify(fs.readFile);
const fsWriteFileAsync = util.promisify(fs.writeFile);

const PORT = process.env.PORT || 8080;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "assets")));

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, "notes.html"));
});


app.get("/api/notes", (req, res) => {
    fs.readFile(path.join(__dirname, "db.json"), "utf-8", (error, data) => {
        if(error) {
            console.log(error);
        }
        //sending as an object
        res.json(JSON.parse(data));
    })
});

app.post("/api/notes", async (req, res) => {
    const note = req.body;
    note.id = uniqid();
    try {
        const newNote = await fsReadFileAsync(path.join(__dirname, "db.json"), "utf-8");
        const parsedNote = JSON.parse(newNote);
        parsedNote.push(note);
        //stringify array to be save back in the json file
        await fsWriteFileAsync(path.join(__dirname, "db.json"), JSON.stringify(parsedNote));
        res.json(parsedNote); 
    } catch (error) {
        console.log(error);
    }
});

app.delete('/api/notes/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const readNotes = await fsReadFileAsync(path.join(__dirname, "db.json"), "utf-8");
        const parsedRead = JSON.parse(readNotes);
        const newNotes = parsedRead.filter(val => val.id !== id);
        //write json data back to file
        await fsWriteFileAsync(path.join(__dirname, "db.json"), JSON.stringify(newNotes));
        res.json(newNotes);  
    } catch (error) {
        console.log(error);
    }
})

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
})

app.listen(PORT, () => {
    console.log("Server listening on port%s", PORT);
})