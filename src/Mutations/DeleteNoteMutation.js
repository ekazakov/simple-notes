import { graphql, commitMutation } from 'react-relay';
import { ConnectionHandler } from 'relay-runtime';
import noop from 'lodash/noop';
import environment from '../Environment';

const mutation = graphql`
    mutation DeleteNoteMutation($input: DeleteNoteInput!) {
        deleteNote(input: $input) {
            deletedNoteId
            viewer {
                totalCount
            },
        }
    }
`;

function commit ({ noteId, viewerId, onError = noop } = {}) {
    const variables = {
        input: {
            id: noteId,
        },
    };

    commitMutation(environment, {
        mutation,
        variables,
        onError: (errors) => {
            console.log(errors);
            onError(errors);
        },

        optimisticUpdater: (proxyStore) => {
            const viewerProxy = proxyStore.get(viewerId);
            const connection = ConnectionHandler.getConnection(viewerProxy, 'NotesCollection_allNotes');
            if (connection) {
                ConnectionHandler.deleteNode(connection, noteId);
            }
        },

        updater: (proxyStore) => {
            const deleteNoteField = proxyStore.getRootField('deleteNote');
            const deletedNoteId = deleteNoteField.getValue('deletedNoteId');
            const viewerProxy = proxyStore.get(viewerId);

            const connection = ConnectionHandler.getConnection(viewerProxy, 'NotesCollection_allNotes');
            ConnectionHandler.deleteNode(connection, deletedNoteId);
        },
    })
}

export default { commit };