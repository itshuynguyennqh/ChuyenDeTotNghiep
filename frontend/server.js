const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Use default middlewares (logger, static, cors, etc.)
server.use(middlewares);

// Add a URL prefix by mounting the router under a specific path
server.use('/api', router); // All json-server routes will now start with /api

server.listen(8000, () => {
    console.log('JSON Server is running on http://localhost:8000/api');
});