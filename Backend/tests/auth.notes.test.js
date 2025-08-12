// Backend/tests/auth.notes.test.js
const { app, mongoose } = require('../index');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const chai = require('chai');
const expect = chai.expect;

let mongoServer;
let token;
let createdId;

describe('Auth + Notes API (in-memory Mongo)', function () {
  this.timeout(30000); // first run can download binaries

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  it('registers a user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Sahar',
        lastName: 'Devjani',
        username: 'sahar',
        email: 'sahar@example.com',
        password: 'Pass@1234'
      })
      .expect(201); // register returns 201

    expect(res.body).to.have.property('token');
    expect(res.body).to.have.property('username', 'sahar');
  });

  it('logs in the user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'sahar', password: 'Pass@1234' })
      .expect(200);

    expect(res.body).to.have.property('token');
    token = res.body.token;
    expect(token).to.be.a('string').that.is.not.empty;
  });

  it('fetches empty notes initially', async () => {
    const res = await request(app)
      .get('/api/notes')
      .set('Authorization', token) // your middleware accepts raw token or "Bearer <token>"
      .expect(200);

    expect(res.body).to.be.an('array').that.has.length(0);
  });

  it('creates a note', async () => {
    const res = await request(app)
      .post('/api/notes')
      .set('Authorization', token)
      .send({ title: 'First', content: 'Hello world' })
      .expect(201); // <-- important: your API returns 201 Created

    expect(res.body).to.have.property('_id');
    expect(res.body).to.have.property('title', 'First');
    createdId = res.body._id;
    expect(createdId).to.be.a('string').that.is.not.empty;
  });

  it('lists notes (now 1)', async () => {
    const res = await request(app)
      .get('/api/notes')
      .set('Authorization', token)
      .expect(200);

    expect(res.body).to.be.an('array').that.has.length(1);
    expect(res.body[0]).to.include({ title: 'First' });
  });

  it('updates the note', async () => {
    const res = await request(app)
      .put(`/api/notes/${createdId}`)
      .set('Authorization', token)
      .send({ title: 'Updated', content: 'Edited text' })
      .expect(200);

    expect(res.body).to.have.property('title', 'Updated');
    expect(res.body).to.have.property('_id', createdId);
  });

  it('deletes the note', async () => {
    await request(app)
      .delete(`/api/notes/${createdId}`)
      .set('Authorization', token)
      .expect(200);

    const res = await request(app)
      .get('/api/notes')
      .set('Authorization', token)
      .expect(200);

    expect(res.body).to.be.an('array').that.has.length(0);
  });
});
