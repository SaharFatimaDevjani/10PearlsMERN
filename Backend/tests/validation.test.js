// Backend/tests/validation.test.js
const { app, mongoose } = require('../index');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const chai = require('chai');
const expect = chai.expect;

let mongoServer;
let token;

describe('Validation errors', function () {
  this.timeout(30000);

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    // Create a valid user to get a token
    await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Sahar',
        lastName: 'Devjani',
        username: 'saharv',
        email: 'saharv@example.com',
        password: 'secret12'
      })
      .expect(201);

    const login = await request(app)
      .post('/api/auth/login')
      .send({ username: 'saharv', password: 'secret12' })
      .expect(200);

    token = login.body.token;
  });

  after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  it('rejects invalid register payload', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'A',       // too short
        lastName: '',         // empty
        username: 'x',        // too short
        email: 'not-an-email',
        password: '1'         // too short
      })
      .expect(400);

    expect(res.body).to.have.property('message', 'Validation failed');
    expect(res.body).to.have.property('details').that.is.an('array');
  });

  it('rejects note creation without a title', async () => {
    const res = await request(app)
      .post('/api/notes')
      .set('Authorization', token)
      .send({ title: '', content: 'ok' })
      .expect(400);

    expect(res.body).to.have.property('message', 'Validation failed');
  });
});
