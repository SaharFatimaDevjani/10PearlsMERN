// Backend/tests/notes.features.test.js
const { app, mongoose } = require('../index');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const chai = require('chai');
const expect = chai.expect;

let mongoServer;
let token;

describe('Notes features: search | export | import | sanitize', function () {
  this.timeout(30000);

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Sahar',
        lastName: 'Devjani',
        username: 'saharf',
        email: 'saharf@example.com',
        password: 'secret12'
      })
      .expect(201);

    const login = await request(app)
      .post('/api/auth/login')
      .send({ username: 'saharf', password: 'secret12' })
      .expect(200);

    token = login.body.token;
  });

  after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  it('supports search by title or content', async () => {
    // seed a few notes
    await request(app).post('/api/notes').set('Authorization', token).send({ title: 'React Tips', content: 'hooks and state' }).expect(201);
    await request(app).post('/api/notes').set('Authorization', token).send({ title: 'Node Tricks', content: 'middleware and jwt' }).expect(201);
    await request(app).post('/api/notes').set('Authorization', token).send({ title: 'Mongo Ideas', content: 'indexes and regex' }).expect(201);

    // search by title
    const s1 = await request(app).get('/api/notes?q=react').set('Authorization', token).expect(200);
    expect(s1.body).to.be.an('array').with.length(1);
    expect(s1.body[0].title).to.match(/react/i);

    // search by content
    const s2 = await request(app).get('/api/notes?q=jwt').set('Authorization', token).expect(200);
    expect(s2.body).to.be.an('array').with.length(1);
    expect(s2.body[0].title).to.match(/node/i);
  });

  it('exports notes as JSON', async () => {
    const res = await request(app)
      .get('/api/notes/export/json')
      .set('Authorization', token)
      .expect(200);

    expect(res.headers['content-type']).to.match(/application\/json/);
    const arr = Array.isArray(res.body) ? res.body : JSON.parse(res.text);
    expect(arr).to.be.an('array');
    expect(arr[0]).to.have.keys(['title', 'content']);
  });

  it('imports notes in bulk', async () => {
    const toImport = [
      { title: 'Bulk 1', content: 'A' },
      { title: 'Bulk 2', content: 'B' }
    ];

    const res = await request(app)
      .post('/api/notes/import')
      .set('Authorization', token)
      .send({ notes: toImport })
      .expect(200);

    expect(res.body).to.have.property('message', 'Imported');
    expect(res.body).to.have.property('count', 2);

    const list = await request(app).get('/api/notes').set('Authorization', token).expect(200);
    // Should be >= previous seeded + 2; we just ensure at least 2 new ones exist by titles
    const titles = list.body.map(n => n.title);
    expect(titles).to.include('Bulk 1');
    expect(titles).to.include('Bulk 2');
  });

  it('sanitizes HTML content (removes <script>, keeps safe tags)', async () => {
    const dirty = `<script>alert('xss')</script><p>ok</p>`;
    const created = await request(app)
      .post('/api/notes')
      .set('Authorization', token)
      .send({ title: 'Unsafe', content: dirty })
      .expect(201);

    expect(created.body.content).to.not.include('<script>');
    expect(created.body.content).to.include('<p>ok</p>');
  });
});
