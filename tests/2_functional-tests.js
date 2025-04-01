const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

describe('Stock Price Checker API', function () {
  this.timeout(10000); // Increase timeout for API calls

  let likedStock; //  To store a liked stock for later tests

  it('Viewing one stock: GET request to /api/stock-prices/', function (done) {
    chai
      .request(server)
      .get('/api/stock-prices')
      .query({ stock: 'GOOG' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body, 'response should be an object');
        assert.property(res.body, 'stockData', 'response should contain stockData');
        assert.isObject(res.body.stockData, 'stockData should be an object');
        assert.property(res.body.stockData, 'stock', 'stockData should contain stock');
        assert.property(res.body.stockData, 'price', 'stockData should contain price');
        assert.property(res.body.stockData, 'likes', 'stockData should contain likes');
        assert.equal(res.body.stockData.stock, 'GOOG', 'stock should be GOOG');
        done();
      });
  });

  it('Viewing one stock and liking it: GET request to /api/stock-prices/', function (done) {
    chai
      .request(server)
      .get('/api/stock-prices')
      .query({ stock: 'AAPL', like: 'true' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body, 'response should be an object');
        assert.property(res.body, 'stockData', 'response should contain stockData');
        assert.isObject(res.body.stockData, 'stockData should be an object');
        assert.property(res.body.stockData, 'stock', 'stockData should contain stock');
        assert.property(res.body.stockData, 'price', 'stockData should contain price');
        assert.property(res.body.stockData, 'likes', 'stockData should contain likes');
        assert.equal(res.body.stockData.stock, 'AAPL', 'stock should be AAPL');
        assert.isNumber(res.body.stockData.likes, 'likes should be a number');
        assert.isAtLeast(res.body.stockData.likes, 1, 'likes should be at least 1');
        likedStock = res.body.stockData.stock; // Store the liked stock
        done();
      });
  });

  it('Viewing the same stock and liking it again: GET request to /api/stock-prices/', function (done) {
    chai
      .request(server)
      .get('/api/stock-prices')
      .query({ stock: likedStock, like: 'true' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body, 'response should be an object');
        assert.property(res.body, 'stockData', 'response should contain stockData');
        assert.isObject(res.body.stockData, 'stockData should be an object');
        assert.property(res.body.stockData, 'stock', 'stockData should contain stock');
        assert.property(res.body.stockData, 'price', 'stockData should contain price');
        assert.property(res.body.stockData, 'likes', 'stockData should contain likes');
        assert.equal(res.body.stockData.stock, likedStock, `stock should be ${likedStock}`);
        assert.isNumber(res.body.stockData.likes, 'likes should be a number');
        assert.isAtLeast(res.body.stockData.likes, 1, 'likes should be at least 1');
        done();
      });
  });

  it('Viewing two stocks: GET request to /api/stock-prices/', function (done) {
    chai
      .request(server)
      .get('/api/stock-prices')
      .query({ stock: ['MSFT', 'GOOG'] })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body, 'response should be an object');
        assert.property(res.body, 'stockData', 'response should contain stockData');
        assert.isArray(res.body.stockData, 'stockData should be an array');
        assert.equal(res.body.stockData.length, 2, 'stockData should contain 2 items');
        assert.property(res.body.stockData[0], 'stock', 'stockData[0] should contain stock');
        assert.property(res.body.stockData[0], 'price', 'stockData[0] should contain price');
        assert.property(res.body.stockData[0], 'rel_likes', 'stockData[0] should contain rel_likes');
        assert.property(res.body.stockData[1], 'stock', 'stockData[1] should contain stock');
        assert.property(res.body.stockData[1], 'price', 'stockData[1] should contain price');
        assert.property(res.body.stockData[1], 'rel_likes', 'stockData[1] should contain rel_likes');
        done();
      });
  });

  it('Viewing two stocks and liking them: GET request to /api/stock-prices/', function (done) {
    chai
      .request(server)
      .get('/api/stock-prices')
      .query({ stock: ['MSFT', 'GOOG'], like: 'true' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body, 'response should be an object');
        assert.property(res.body, 'stockData', 'response should contain stockData');
        assert.isArray(res.body.stockData, 'stockData should be an array');
        assert.equal(res.body.stockData.length, 2, 'stockData should contain 2 items');
        assert.property(res.body.stockData[0], 'stock', 'stockData[0] should contain stock');
        assert.property(res.body.stockData[0], 'price', 'stockData[0] should contain price');
        assert.property(res.body.stockData[0], 'rel_likes', 'stockData[0] should contain rel_likes');
        assert.property(res.body.stockData[1], 'stock', 'stockData[1] should contain stock');
        assert.property(res.body.stockData[1], 'price', 'stockData[1] should contain price');
        assert.property(res.body.stockData[1], 'rel_likes', 'stockData[1] should contain rel_likes');
        assert.isNumber(res.body.stockData[0].rel_likes, 'rel_likes should be a number');
        assert.isNumber(res.body.stockData[1].rel_likes, 'rel_likes should be a number');
        done();
      });
  });
});
