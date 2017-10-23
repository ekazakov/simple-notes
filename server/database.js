export class Note {
}

export class User {
}

const VIEWER_ID = 'evgeniy';

const viewer = new User();
viewer.id = VIEWER_ID;
viewer.name = 'Evgeniy Kazakov';

const usersById = {
    [VIEWER_ID]: viewer,
};

const notesById = {};
const noteIdsByUser = {
    [VIEWER_ID]: [],
};
let nextNoteId = 0;

export const addNote = (text = '', timeStamp = Date.now()) => {
    if (text.trim() === '') {
        throw new Error('Note text must not be empty');
    }

    const note = new Note();
    note.id = `${nextNoteId++}`;
    note.text = text;
    note.timeStamp = (timeStamp);
    notesById[note.id] = note;
    noteIdsByUser[VIEWER_ID].push(note.id);
    return note.id;
};

export function findNote(id) {
    return notesById[id];
}

export const allNotes = () =>
    noteIdsByUser[VIEWER_ID].map(id => notesById[id]);

export const updateNote = (id, text = '', timeStamp) => {
    if (text.trim() === '') {
        throw new Error('Note text must not be empty');
    }

    const note = findNote(id);
    note.text = text;
    note.timeStamp = String(timeStamp);
};

export const findUser = (id) => {
    return usersById[id];
};

export const getViewer = () => {
    return findUser(VIEWER_ID);
};

export const deleteNote = (id) => {
    const index = noteIdsByUser[VIEWER_ID].indexOf(id);
    if (index !== -1) {
        noteIdsByUser[VIEWER_ID].splice(index, 1);
    }
    delete notesById[id];
};

addNote(`
    GraphQL is a query language for APIs and a runtime 
    for fulfilling those queries with your existing data. 
    GraphQL provides a complete and understandable description 
    of the data in your API, gives clients the power to ask for 
    exactly what they need and nothing more, makes it easier to evolve APIs over time, 
    and enables powerful developer tools.
`);
addNote(`
    GraphQL queries access not just the properties of 
    one resource but also smoothly follow references between 
    them. While typical REST APIs require loading from multiple 
    URLs, GraphQL APIs get all the data your app needs in a 
    single request. Apps using GraphQL can be quick even on 
    slow mobile network connections.
`);
addNote(`
    GraphQL makes it easy to build powerful tools like GraphiQL 
    by leveraging your API’s type system.
`);