import { expect } from 'chai';
import { like } from 'pactum-matchers';
import MockServer from './index.js';

let I;
let restClient;
const port = 65000;
const api_url = `http://0.0.0.0:${port}`;

describe('MockServer Helper', () => {
    beforeAll(() => {
        I = new MockServer({ port });
    });

    beforeEach(async () => {
        await I.startMockServer();
    });

    afterEach(async () => {
        await I.stopMockServer();
    });

    describe('#startMockServer', () => {
        it('should start the mock server with custom port', async () => {
            global.debugMode = true;
            await I.startMockServer(6789);
            await I.stopMockServer();
            global.debugMode = undefined;
        });
    });

    describe('#addInteractionToMockServer', () => {
        it('should return the correct response', async () => {
            await I.addInteractionToMockServer({
                request: {
                    method: 'GET',
                    path: '/api/hello',
                },
                response: {
                    status: 200,
                    body: {
                        say: 'hello to mock server',
                    },
                },
            });
            const res = await fetch(api_url + '/api/hello');
            expect(await res.json()).to.eql({ say: 'hello to mock server' });
        });

        it('should return 404 when not found route', async () => {
            const res = await fetch(api_url + '/api/notfound');
            expect(res.status).to.eql(404);
        });

        it('should return the strong match on query parameters', async () => {
            await I.addInteractionToMockServer({
                request: {
                    method: 'GET',
                    path: '/api/users',
                    queryParams: {
                        id: 1,
                    },
                },
                response: {
                    status: 200,
                    body: {
                        user: 1,
                    },
                },
            });

            await I.addInteractionToMockServer({
                request: {
                    method: 'GET',
                    path: '/api/users',
                    queryParams: {
                        id: 2,
                    },
                },
                response: {
                    status: 200,
                    body: {
                        user: 2,
                    },
                },
            });

            let res = await fetch(api_url + '/api/users?id=1');
            expect(await res.json()).to.eql({ user: 1 });

            res = await fetch(api_url + '/api/users?id=2');
            expect(await res.json()).to.eql({ user: 2 });
        });
    });
});
