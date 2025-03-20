document.addEventListener("DOMContentLoaded", () => {
    const songList = document.getElementById("song-list");
    const lyricsContainer = document.getElementById("lyrics-container");
    const formattedLyrics = document.getElementById("formatted-lyrics");

    const addVerseBtn = document.getElementById("add-verse");
    const addChorusBtn = document.getElementById("add-chorus");
    const saveLyricsBtn = document.getElementById("save-lyrics");
    const copyLyricsBtn = document.getElementById("copy-lyrics");

    let currentSongId = null;
    let songs = JSON.parse(localStorage.getItem("songs")) || [];

    function loadSongs() {
        songList.innerHTML = "";
        songs.forEach(song => {
            const li = document.createElement("li");
            li.textContent = song.title;
            li.onclick = () => loadLyrics(song.id);
            songList.appendChild(li);
        });
    }

    function loadLyrics(songId) {
        currentSongId = songId;
        const song = songs.find(s => s.id === songId);
        document.getElementById("song-title").textContent = song.title.toUpperCase();
        document.getElementById("song-authors").innerHTML = `<i>${song.authors}</i>`;
        lyricsContainer.innerHTML = "";

        song.lyrics.forEach((line, index) => {
            const div = document.createElement("div");
            div.className = "draggable";
            div.textContent = line.type.toUpperCase() + ": " + line.text;
            div.draggable = true;
            div.dataset.index = index;

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
    }

    function saveLyrics(song) {
        localStorage.setItem("songs", JSON.stringify(songs));
        updateFormattedLyrics(song);
    }

    function updateFormattedLyrics(song) {
        formattedLyrics.textContent = `${song.title.toUpperCase()}\n\n${song.authors}\n\n`;
        song.lyrics.forEach(line => {
            formattedLyrics.textContent += (line.type === "Chorus" ? `**${line.text}**\n\n` : `${line.text}\n\n`);
        });
    }

    addVerseBtn.onclick = () => {
        if (!currentSongId) return;
        const song = songs.find(s => s.id === currentSongId);
        song.lyrics.push({ type: "Verse", text: "New Verse" });
        saveLyrics(song);
        loadLyrics(currentSongId);
    };

    addChorusBtn.onclick = () => {
        if (!currentSongId) return;
        const song = songs.find(s => s.id === currentSongId);
        song.lyrics.push({ type: "Chorus", text: "New Chorus" });
        saveLyrics(song);
        loadLyrics(currentSongId);
    };

    copyLyricsBtn.onclick = () => {
        navigator.clipboard.writeText(formattedLyrics.textContent);
        alert("Lyrics copied to clipboard!");
    };

    loadSongs();
});
