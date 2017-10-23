import express from 'express';
import graphQLHTTP from 'express-graphql';
import { schema } from './schema';

const GRAPHQL_PORT = '8090';

const graphQLServer = express();
graphQLServer.use('/graphql', graphQLHTTP({ schema, pretty: true }));
graphQLServer.listen(GRAPHQL_PORT, () => console.log(
    `GraphQL Server is now running on http://localhost:${GRAPHQL_PORT}`
));
