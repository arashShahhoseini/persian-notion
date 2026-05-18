let notes = JSON.parse(localStorage.getItem("allNotes")) || [];

const themeToggleBtn = document.getElementById("theme-toggle");
const body = document.body;
const newNoteBtn = document.getElementById("newNote")
const noteContent = document.getElementById("note-content");
const noteListDiv = document.getElementById("notes-list");

themeToggleBtn.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
})

function selectNote(note) {
    let noteHeader = document.getElementById("note-title");
    noteHeader.value = note.title;
    let noteContent = document.getElementById("note-content");
    noteContent = note.content;

    note.addEventListener('input', () => {
        localStorage.setItem(note.id, noteContent.value)
    })
}

function renderNotes() {
    
    noteListDiv.innerHTML = "";

    notes.forEach((note) => {
        const noteBtn = document.createElement('button');
        noteBtn.classList.add('sidebar-note-item')
        noteBtn.innerHTML = `${note.title}
                            <div>
                                <button>remove</button>
                                <button>pin</button>
                                <button>transfer</button>
                            <div/>
                            `;

        noteBtn.addEventListener("click", () => {
            selectNote(note);
        });

        noteListDiv.appendChild(noteBtn);
    });
}

newNoteBtn.addEventListener("click", () => {
    const newNote = {
        id: Date.now(),
        title: "بدون عنوان",
        content: "",
        folderId : null,
        isPinned : false,
        updatedAt: new Date().getTime()
    }

    notes.unshift(newNote);
    localStorage.setItem("allNotes", JSON.stringify(notes));
    
    renderNotes()
})

renderNotes()