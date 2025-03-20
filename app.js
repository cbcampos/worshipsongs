const BACKEND_URL = "https://worshipsongs.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
    const songList = document.getElementById("song-list");
    const lyricsContainer = document.getElementById("lyrics-container");
    const formattedLyrics = document.getElementById("formatted-lyrics");

    const addSongBtn = document.getElementById("add-song");
    const addVerseBtn = document.getElementById("add-verse");
    const addChorusBtn = document.getElementById("add-chorus");
    const saveLyricsBtn = document.getElementById("save-lyrics");
    const copyLyricsBtn = document.getElementById("copy-lyrics");

    let currentSongId = null;
    let songs = [];

    /** Fetch songs from the backend */
    async function loadSongs() {
        try {
            const response = await fetch(`${BACKEND_URL}/songs`);
            songs = await response.json();
            renderSongList();
        } catch (error) {
            console.error("Error loading songs:", error);
        }
    }

    /** Render the list of songs */
    function renderSongList() {
        songList.innerHTML = "";
        songs.forEach(song => {
            const li = document.createElement("li");
            li.textContent = song.title;
            li.onclick = () => loadLyrics(song.id);
            songList.appendChild(li);
        });
    }

    /** Load lyrics for the selected song */
    async function loadLyrics(songId) {
        try {
            currentSongId = songId;
            const response = await fetch(`${BACKEND_URL}/songs/${songId}`);
            const song = await response.json();
            document.getElementById("song-title").textContent = song.title.toUpperCase();
            document.getElementById("song-authors").innerHTML = `<i>${song.authors}</i>`;
            lyricsContainer.innerHTML = "";

            song.lyrics.forEach((line, index) => {
                const div = document.createElement("div");
                div.className = "draggable";
                div.textContent = line.type.toUpperCase() + ": " + line.text;
                div.draggable = true;
                div.dataset.index = index;

                // Drag-and-drop functionality
                div.ondragstart = (e) => e.dataTransfer.setData("text/plain", index);
                div.ondragover = (e) => e.preventDefault();
                div.ondrop = (e) => {
                    e.preventDefault();
                    const fromIndex = e.dataTransfer.getData("text/plain");
                    [song.lyrics[fromIndex], song.lyrics[index]] = [song.lyrics[index], song.lyrics[fromIndex]];
                    saveLyrics(song);
                    loadLyrics(songId);
                };

                lyricsContainer.appendChild(div);
            });

            updateFormattedLyrics(song);
        } catch (error) {
            console.error("Error loading lyrics:", error);
        }
    }

    /** Save song lyrics to the backend */
    async function saveLyrics(song) {
        try {
            await fetch(`${BACKEND_URL}/songs/${song.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(song),
            });
            loadSongs(); // Reload song list to reflect changes
        } catch (error) {
            console.error("Error saving lyrics:", error);
        }
    }

    /** Update formatted lyrics in the third column */
    function updateFormattedLyrics(song) {
        formattedLyrics.textContent = `${song.title.toUpperCase()}\n\n${song.authors}\n\n`;
        song.lyrics.forEach(line => {
            formattedLyrics.textContent += (line.type === "Chorus" ? `**${line.text}**\n\n` : `${line.text}\n\n`);
        });
    }

    /** Add a new song to the database */
    addSongBtn.onclick = async () => {
        const title = prompt("Enter song title:");
        const authors = prompt("Enter song author(s):");
        if (!title || !authors) return;

        try {
            const response = await fetch(`${BACKEND_URL}/songs`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, authors, lyrics: [] }),
            });
            const newSong = await response.json();
            songs.push(newSong);
            loadSongs();
        } catch (error) {
            console.error("Error adding song:", error);
        }
    };

    /** Add a new verse to the current song */
    addVerseBtn.onclick = async () => {
        if (!currentSongId) return;
        const song = songs.find(s => s.id === currentSongId);
        song.lyrics.push({ type: "Verse", text: "New Verse" });
        await saveLyrics(song);
        loadLyrics(currentSongId);
    };

    /** Add a new chorus to the current song */
    addChorusBtn.onclick = async () => {
        if (!currentSongId) return;
        const song = songs.find(s => s.id === currentSongId);
        song.lyrics.push({ type: "Chorus", text: "New Chorus" });
        await saveLyrics(song);
        loadLyrics(currentSongId);
    };

    /** Copy formatted lyrics to clipboard */
    copyLyricsBtn.onclick = () => {
        navigator.clipboard.writeText(formattedLyrics.textContent);
        alert("Lyrics copied to clipboard!");
    };

    /** Search bar functionality */
    document.getElementById("search-bar").oninput = function () {
        const searchTerm = this.value.toLowerCase();
        songList.innerHTML = "";
        songs
            .filter(song => song.title.toLowerCase().includes(searchTerm))
            .forEach(song => {
                const li = document.createElement("li");
                li.textContent = song.title;
                li.onclick = () => loadLyrics(song.id);
                songList.appendChild(li);
            });
    };

    // Load the initial song list
    loadSongs();
});
