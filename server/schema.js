import {
    GraphQLID,
    GraphQLInt,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLString,
} from 'graphql';

import {
    connectionArgs,
    connectionDefinitions,
    connectionFromArray,
    cursorForObjectInConnection,
    fromGlobalId,
    globalIdField,
    mutationWithClientMutationId,
    nodeDefinitions,
} from 'graphql-relay';

import {
    Note,
    User,
    findNote,
    findUser,
    getViewer,
    allNotes,
    addNote,
    deleteNote,
    updateNote,
} from './database';

const { nodeInterface, nodeField } = nodeDefinitions(
    (globalId) => {
        const { type, id } = fromGlobalId(globalId);
        if (type === 'Note') {
            return findNote(id);
        } else if (type === 'User') {
            return findUser(id);
        }
        return null;
    },
    (obj) => {
        if (obj instanceof Note) {
            return GraphQLNote;
        } else if (obj instanceof User) {
            return GraphQLUser;
        }
        return null;
    }
);

const GraphQLNote = new GraphQLObjectType({
    name: 'Note',
    fields: {
        id: globalIdField('Note'),
        text: {
            type: new GraphQLNonNull(GraphQLString),
            resolve: (obj) => obj.text,
        },
        timeStamp: {
            type: new GraphQLNonNull(GraphQLString),
            resolve: (obj) => obj.timeStamp,
        }
    },
    interfaces: [nodeInterface],
});

const {
    connectionType: NotesConnection,
    edgeType: GraphQLNoteEdge,
} = connectionDefinitions({
    name: 'Note',
    nodeType: GraphQLNote,
});

const GraphQLUser = new GraphQLObjectType({
    name: 'User',
    fields: {
        id: globalIdField('User'),
        name: {
            type: GraphQLString,
            resolve: (user) => user.name,
        },
        allNotes: {
            type: NotesConnection,
            args: connectionArgs,
            resolve: (obj, args) =>
                connectionFromArray(allNotes(), args),
        },
        totalCount: {
            type: GraphQLInt,
            resolve: () => allNotes().length,
        },
    },
    interfaces: [nodeInterface],
});

const Query = new GraphQLObjectType({
    name: 'Query',
    fields: {
        viewer: {
            type: GraphQLUser,
            resolve: () => getViewer(),
        },
        node: nodeField,
    },
});

const GraphQLAddNoteMutation = mutationWithClientMutationId({
    name: 'AddNote',
    inputFields: {
        text: { type: new GraphQLNonNull(GraphQLString) },
        timeStamp: { type: new GraphQLNonNull(GraphQLString) },
    },
    outputFields: {
        noteEdge: {
            type: GraphQLNoteEdge,
            resolve: ({ localNoteId }) => {
                const note = findNote(localNoteId);
                return {
                    cursor: cursorForObjectInConnection(allNotes(), note),
                    node: note,
                };
            },
        },
        viewer: {
            type: GraphQLUser,
            resolve: () => getViewer(),
        },
    },
    mutateAndGetPayload: ({ text, timeStamp }) => {
        const localNoteId = addNote(text, timeStamp);
        return { localNoteId };
    },
});

const GraphQLUpdateNoteMutation = mutationWithClientMutationId({
    name: 'UpdateNote',
    inputFields: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        text: { type: new GraphQLNonNull(GraphQLString) },
        timeStamp: { type: new GraphQLNonNull(GraphQLString) },
    },
    outputFields: {
        note: {
            type: GraphQLNote,
            resolve: ({ localNoteId }) => findNote(localNoteId),
        },
        viewer: {
            type: GraphQLUser,
            resolve: () => getViewer(),
        },
    },
    mutateAndGetPayload: ({ id, text, timeStamp }) => {
        const localNoteId = fromGlobalId(id).id;
        updateNote(localNoteId, text, timeStamp);
        return { localNoteId };
    },
});

const GraphQLDeleteNoteMutation = mutationWithClientMutationId({
    name: 'DeleteNote',
    inputFields: {
        id: { type: new GraphQLNonNull(GraphQLID) },
    },
    outputFields: {
        deletedNoteId: {
            type: GraphQLID,
            resolve: ({ id }) => id,
        },
        viewer: {
            type: GraphQLUser,
            resolve: () => getViewer(),
        },
    },
    mutateAndGetPayload: ({ id }) => {
        const localNoteId = fromGlobalId(id).id;
        deleteNote(localNoteId);
        return { id };
    },
});
const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addNote: GraphQLAddNoteMutation,
        deleteNote: GraphQLDeleteNoteMutation,
        updateNote: GraphQLUpdateNoteMutation,
    },
});

export const schema = new GraphQLSchema({
    query: Query,
    mutation: Mutation,
});
