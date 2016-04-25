const assert = require('assert');
const request = require('request');
const app = require('../server');

describe('Server', () => {

  before((done) => {
    this.port = 9876;

    this.server = app.listen(this.port, (err, result) => {
      if (err) { return done(err); }
      done();
    });

    this.request = request.defaults({
      baseUrl: 'http://localhost:9876/'
    });
  });

  after(() => {
    this.server.close();
  });

  it('should exist', () => {
    assert(app);
  });

  describe('GET /', () => {
    it('should return a 200', (done) => {
      this.request.get('/', (error, response) => {
        if (error) { done(error); }
        assert.equal(response.statusCode, 200);
        done();
      });
    });

    xit('should have a body with the name of the application', (done) => {
      var title = app.locals.title;
      this.request.get('/', (error, response) => {
        if (error) { done(error); }
        console.log('hello');
        assert(response.body.includes('Crowdsource'),
               `"${response.body}" does not include "${title}".`);
        done();
      });
    });
  });

  xdescribe('POST /polls', () => {

    beforeEach(() => {
      app.locals.polls = {};
    });

    it('should not return 404', (done) => {
      this.request.post('/polls', (error, response) => {
        if (error) { done(error); }
        assert.notEqual(response.statusCode, 404);
        done();
      });
    });

    it('should receive and store data', (done) => {
      var payload = { poll: fixtures.validPoll };

      this.request.post('/polls', { form: payload }, (error, response) => {
        if (error) { done(error); }

        var pollCount = Object.keys(app.locals.polls).length;

        assert.equal(pollCount, 1, `Expected 1 polls, found ${pollCount}`);

        done();
      });
    });

    it('should redirect the user to their new poll', (done) => {
      var payload = { poll: fixtures.validPoll };

      this.request.post('/polls', { form: payload }, (error, response) => {
        if (error) { done(error); }
        var newPollId = Object.keys(app.locals.polls)[0];
        assert.equal(response.headers.location, '/polls/' + newPollId);
        done();
      });
    });
  });

  xdescribe('GET /polls/:id', () => {

    beforeEach(() => {
      app.locals.polls['9dba9d524c60e1e6c2f2'] = fixtures.validPoll;
    });

    it('should not return 404', (done) => {
      this.request.get('/polls/9dba9d524c60e1e6c2f2', (error, response) => {
        if (error) { done(error); }
        assert.notEqual(response.statusCode, 404);
        done();
      });
    });

    it('should return a page that has the title of the poll', (done) => {
      var poll = app.locals.polls['9dba9d524c60e1e6c2f2'];

      this.request.get('/polls/9dba9d524c60e1e6c2f2', (error, response) => {
        if (error) { done(error); }
        assert(response.body.includes(poll.name),
               `"${response.body}" does not include "${poll.name}".`);
        done();
      });
    });

    it('should return a page that has the toppings of the poll', (done) => {
      var poll = app.locals.polls['9dba9d524c60e1e6c2f2'];
      var toppings = poll.toppings;

      this.request.get('/polls/9dba9d524c60e1e6c2f2', (error, response) => {
        if (error) { done(error); }
        for(var i=0; i< toppings.length; i++){
          assert(response.body.includes(toppings[i]),
                 `"${response.body}" does not include "${toppings[i]}".`);
        }
        done();
      });
    });

  });

});
