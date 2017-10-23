import {
    Environment,
    Network,
    Store,
    RecordSource,
} from 'relay-runtime';

const store = new Store(new RecordSource());

const network = Network.create((operation, variables) => {
    return fetch('/graphql', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: operation.text,
            variables,
        }),
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            }

            console.log('response', response);

            return Promise.resolve({
                errors: [
                    { code: response.status, message: response.statusText }
                ]
            });
        })
        .then(json => {
            if (operation.query.operation === 'mutation' && json.errors) {
                return Promise.resolve({ errors: json.errors });
            }

            return Promise.resolve(json);
        })
        .catch((error) => {
            return {
                errors: [
                    { message: `Couldn't send data to server. ${error.message}`}
                ]
            };
        })
        .then((data) => {
            if (data.errors != null) {
                return Promise.reject(data.errors);
            }
            return data;
        })
    ;
});

const environment = new Environment({ network, store });

export default environment;