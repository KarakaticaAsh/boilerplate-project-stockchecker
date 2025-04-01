'use strict';

const fetch = require('node-fetch');
const mongoose = require('mongoose');
const crypto = require('crypto');

module.exports = function (app) {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const likeSchema = new mongoose.Schema({
    stock: String,
    ip: String, // Store the anonymized IP
  });

  const Like = mongoose.model('Like', likeSchema);

  const getStockData = async (stockSymbol) => {
    const url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stockSymbol}/quote`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching stock data:', error);
      return null; // Or throw an error, handle as needed
    }
  };

  app.route('/api/stock-prices').get(async (req, res) => {
    const stock = req.query.stock;
    const like = req.query.like === 'true'; // Ensure boolean
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;  // Get real client IP

    if (!stock) {
      return res.status(400).send('Missing stock parameter');
    }

    try {
      if (Array.isArray(stock)) {
        if (stock.length !== 2) {
          return res.status(400).send('Invalid number of stocks to compare');
        }

        const stockData1 = await getStockData(stock[0]);
        const stockData2 = await getStockData(stock[1]);

        if (!stockData1 || !stockData1.latestPrice || !stockData2 || !stockData2.latestPrice) {
          return res.status(400).send('Invalid stock symbol(s)');
        }

        const anonymizedIp = crypto.createHash('sha256').update(clientIp).digest('hex');

        let likes1 = 0;
        let likes2 = 0;

        if (like) {
          await Promise.all([
            Like.findOneAndUpdate({ stock: stock[0], ip: anonymizedIp }, {}, { upsert: true }),
            Like.findOneAndUpdate({ stock: stock[1], ip: anonymizedIp }, {}, { upsert: true }),
          ]);
        }

        likes1 = await Like.countDocuments({ stock: stock[0] });
        likes2 = await Like.countDocuments({ stock: stock[1] });

        const formattedData = {
          stockData: [
            { stock: stock[0], price: stockData1.latestPrice, rel_likes: likes1 - likes2 },
            { stock: stock[1], price: stockData2.latestPrice, rel_likes: likes2 - likes1 },
          ],
        };

        return res.json(formattedData);
      } else {
        const stockData = await getStockData(stock);
        if (!stockData || !stockData.latestPrice) {
          return res.status(400).send('Invalid stock symbol');
        }

        const anonymizedIp = crypto.createHash('sha256').update(clientIp).digest('hex');
        let likes = 0;

        if (like) {
          await Like.findOneAndUpdate({ stock: stock, ip: anonymizedIp }, {}, { upsert: true });
        }

        likes = await Like.countDocuments({ stock: stock });

        const formattedData = {
          stockData: {
            stock: stock,
            price: stockData.latestPrice,
            likes: likes,
          },
        };
        return res.json(formattedData);
      }
    } catch (error) {
      console.error('Error processing request:', error);
      return res.status(500).send('Server error');
    }
  });
};
