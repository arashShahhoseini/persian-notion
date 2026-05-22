let notes = JSON.parse(localStorage.getItem("allNotes")) || [];
let folders = JSON.parse(localStorage.getItem("allFolders")) || [];
let currentNoteId = null;
let darkMode = false;
let sortBy = "time";

const themeToggleBtn = document.getElementById("theme-toggle");
const body = document.body;
const newNoteBtn = document.getElementById("newNote");
const newFolderBtn = document.getElementById("newFolder");
const noteTitleInput = document.getElementById("note-title");
const noteContentTextarea = document.getElementById("note-content");
const noteListDiv = document.getElementById("notes-list");
const folderListDiv = document.getElementById("folders-list");
const pinnedListDiv = document.getElementById("pinned-list");
const searchInput = document.getElementById("search");
const sortMenu = document.getElementById("sortMenu");

function sortNotes() {
    if (sortBy === 'time') {
        notes = notes.sort((a, b) => b.updatedAt - a.updatedAt);
    } else if (sortBy === 'title') {
        notes = notes.sort((a, b) => a.title.localeCompare(b.title));
    }
}

sortMenu.addEventListener("change", (event) => {
    sortBy = event.target.value;
    renderFolders();
    renderNotes();
})

themeToggleBtn.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    if(!darkMode) {
        darkMode = true;
        themeToggleBtn.innerHTML = "☀️";
    } else {
        darkMode = false;
        themeToggleBtn.innerHTML = "🌙";
    }    
});

searchInput.addEventListener("input", () => {
    renderFolders();
    renderNotes();
});

function selectNote(note) {
    currentNoteId = note.id;
    noteContentTextarea.value = note.content;
    noteTitleInput.value = note.title;
}

function deleteNote(note) {
    notes = notes.filter((n) => n.id !== note.id);
    localStorage.setItem("allNotes", JSON.stringify(notes));
    if (currentNoteId === note.id) {
        currentNoteId = null;
        noteTitleInput.value = "";
        noteContentTextarea.value = "";
    }
    renderNotes();
}

function transferNote(note) {
    let query = prompt();
    
    const selectedFolder = folders.find(n => n.title === query);
    if (selectedFolder) {
        currentNoteId = note.id;
        const activeNote = notes.find(n => n.id === currentNoteId);
        activeNote.folderId = selectedFolder.id;
        activeNote.isPinned = false;
        
        localStorage.setItem("allNotes", JSON.stringify(notes))
        renderNotes();
        renderFolders();
    } else {
        alert("پوشه مورد نظر یافت نشد")
    }
}

function deleteFolder(folder) {
    folders = folders.filter((n) => n.id !== folder.id);
    localStorage.setItem("allFolders", JSON.stringify(folders));
    renderFolders();
}

function editFolder(folder) {
    let query = prompt();
    if (query) {
        folder.title = query;
        localStorage.setItem("allFolders", JSON.stringify(folders))
        renderFolders();
    } else {
        alert("لطفا یک نام وارد کنید")
    }
}

function pinNote(note) {
    currentNoteId = note.id;
    const activeNote = notes.find(n => n.id === currentNoteId);
    if (activeNote) {
        activeNote.isPinned = !activeNote.isPinned;
        localStorage.setItem("allNotes", JSON.stringify(notes));
        renderNotes();
    }
}

noteContentTextarea.addEventListener('input', () => {
    if (!currentNoteId) return;

    const activeNote = notes.find(n => n.id === currentNoteId);
    if (activeNote) {
        activeNote.content = noteContentTextarea.value;
        activeNote.updatedAt = Date.now();
        localStorage.setItem("allNotes", JSON.stringify(notes));
        renderNotes();
        renderFolders();
    }
});

noteTitleInput.addEventListener('input', () => {
    if (!currentNoteId) return;

    const activeNote = notes.find(n => n.id === currentNoteId);
    if (activeNote) {
        activeNote.title = noteTitleInput.value;
        activeNote.updatedAt = Date.now();
        localStorage.setItem("allNotes", JSON.stringify(notes));
        renderNotes();
        renderFolders();
    }
});

function renderNotes() {
    const query = searchInput.value.toLowerCase().trim();

    noteListDiv.innerHTML = "";
    pinnedListDiv.innerHTML = "";

    sortNotes()

    notes.forEach((note) => {
        if (query && !note.title.toLowerCase().includes(query)) return;

        const noteDiv = document.createElement('div');
        noteDiv.classList.add('sidebar-note-item');
        const pinIndicator = note.isPinned ? "📌 " : "";
        const pinButtonIcon = note.isPinned ? "📍" : "📌";

        noteDiv.innerHTML = `
            <span class="note-item-title">${pinIndicator}${note.title || "بدون عنوان"}</span>
            <div class="note-item-actions">
                <button class="pin-btn">${pinButtonIcon}</button>
                <button class="transfer-btn">🔄</button>
                <button class="remove-btn">🗑️</button>
            </div>
        `;

        noteDiv.addEventListener("click", () => {
            selectNote(note);
        });

        noteDiv.querySelector(".remove-btn").addEventListener("click", (event) => {
            event.stopPropagation();
            if (confirm(`یادداشت "${note.title || 'بدون عنوان'}" حذف شود؟`)) {
                deleteNote(note);
            }
        });

        noteDiv.querySelector(".pin-btn").addEventListener("click", (event) => {
            event.stopPropagation();
            pinNote(note);
        });

        noteDiv.querySelector(".transfer-btn").addEventListener("click", (event) => {
            event.stopPropagation();
            transferNote(note);
        })

        if (note.isPinned) {
            pinnedListDiv.appendChild(noteDiv);
        } else if (note.folderId === null) {
            noteListDiv.appendChild(noteDiv);
        }
    });
}

function renderFolders() {
    const query = searchInput.value.toLowerCase().trim();
    folderListDiv.innerHTML = "";

    folders.forEach((folder) => {
        const folderDiv = document.createElement("div");
        folderDiv.classList.add("sidebar-folder-wrapper");
        folderDiv.innerHTML = `
        <div class="sidebar-folder-item">
            <span class="folder-title">📁 ${folder.title || "بدون عنوان"}</span>
            <div class="folder-actions">
                <button class="edit-folder-btn">✏️</button>
                <button class="remove-folder-btn">🗑️</button>
            </div>
        </div>
        <div class="folder-notes-list" style="padding-right: 15px;"></div>
        `;

        const folderNotesContainer = folderDiv.querySelector(".folder-notes-list");
        const folderNotes = notes.filter(
            n => n.folderId === folder.id && 
            (!query || n.title.toLowerCase().includes(query))
        );

        folderNotes.forEach(note => {
            const noteDiv = document.createElement('div');
            noteDiv.classList.add('sidebar-note-item');

            noteDiv.innerHTML = `
                <span class="note-item-title">📄 ${note.title || "بدون عنوان"}</span>
                <div class="note-item-actions">
                    <button class="transfer-btn">🔄</button>
                    <button class="remove-btn">🗑️</button>
                </div>
            `;

            noteDiv.addEventListener("click", () => selectNote(note));

            noteDiv.querySelector(".transfer-btn").addEventListener('click', (event) => {
                event.stopPropagation();
                transferNote(note);
            })

            noteDiv.querySelector(".remove-btn").addEventListener('click', (event) => {
                event.stopPropagation();
                if (confirm(`یادداشت "${note.title || 'بدون عنوان'}" حذف شود؟`)) {
                    deleteNote(note);
                    renderFolders();
                }
            });

            folderNotesContainer.appendChild(noteDiv);
        })


        folderDiv.querySelector(".remove-folder-btn").addEventListener('click', (event) => {
            event.stopPropagation();
            if (confirm(`پوشه ${folder.title} حذف شود؟`)) {
                notes.forEach(note => { if (note.folderId === folder.id) note.folderId = null;} )
                localStorage.setItem("allNotes", JSON.stringify(notes));

                deleteFolder(folder);
                renderNotes()
            }
        })

        folderDiv.querySelector(".edit-folder-btn").addEventListener('click', (event) => {
            event.stopPropagation();
            editFolder(folder);
        })

        folderListDiv.appendChild(folderDiv);
    })
};

newFolderBtn.addEventListener("click", () => {
    const newFolder = {
        id : Date.now(),
        title : "بدون عنوان"
    };
    folders.unshift(newFolder);
    localStorage.setItem("allFolders", JSON.stringify(folders));
    renderFolders();
})

newNoteBtn.addEventListener("click", () => {
    const newNote = {
        id: Date.now(),
        title: "بدون عنوان",
        content: "",
        folderId: null,
        isPinned: false,
        updatedAt: new Date().getTime()
    };

    notes.unshift(newNote);
    localStorage.setItem("allNotes", JSON.stringify(notes));
    
    renderNotes();
    selectNote(newNote);
});

renderNotes();
renderFolders();