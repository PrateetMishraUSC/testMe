const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();


app.use(cors({
    origin: 'http://localhost:4200',  // replace with your app's origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization']
}));


app.get('/fetch-data', async (req, res) => {
    try {
        const search = req.query.search;
        const url = `https://finnhub.io/api/v1/search?q=${search}&token=cn8rl8pr01qocbph3220cn8rl8pr01qocbph322g`;
        const response = await axios.get(url);
        res.send(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error occurred while fetching data');
    }
});

app.get('/api/data/profile', (req, res) => {
    const search = req.query.ticker;
    const url = `https://finnhub.io/api/v1/stock/profile2?symbol=${search}&token=cn8rl8pr01qocbph3220cn8rl8pr01qocbph322g`;
    axios.get(url).then(response => {
        return res.json(response.data);
    }).catch(error => {
    });
  });

app.get('/api/data/stockprice', (req, res) => {
    const search = req.query.ticker;
    const url = `https://finnhub.io/api/v1/quote?symbol=${search}&token=cn8rl8pr01qocbph3220cn8rl8pr01qocbph322g`;
    axios.get(url).then(response => {
        return res.json(response.data);
    }).catch(error => {
    });
  });

app.get('/api/data/rtrends', (req, res) => {
    const search = req.query.ticker;
    const url = `  https://finnhub.io/api/v1/stock/recommendation?symbol=${search}&token=cn8rl8pr01qocbph3220cn8rl8pr01qocbph322g`;
    axios.get(url).then(response => {
        return res.json(response.data);
    }).catch(error => {
    });
  });

app.get('/api/data/sentiments', (req, res) => {
    const search = req.query.ticker;
    const url = `https://finnhub.io/api/v1/stock/insider-sentiment?symbol=${search}&from=2022-01-01&token=cn8rl8pr01qocbph3220cn8rl8pr01qocbph322g`;
    axios.get(url).then(response => {
        return res.json(response.data);
    }).catch(error => {
    });
  });

app.get('/api/data/peers', (req, res) => {
    const search = req.query.ticker;
    const url = `https://finnhub.io/api/v1/stock/peers?symbol=${search}&token=cn8rl8pr01qocbph3220cn8rl8pr01qocbph322g`;
    axios.get(url).then(response => {
        return res.json(response.data);
    }).catch(error => {
    });
  });

app.get('/api/data/earnings', (req, res) => {

    const search = req.query.ticker;
    const url = `https://finnhub.io/api/v1/stock/earnings?symbol=${search}&token=cn8rl8pr01qocbph3220cn8rl8pr01qocbph322g`;
    axios.get(url).then(response => {
        return res.json(response.data);
    }).catch(error => {
    });
  });

  app.get('/api/data/companynews', (req, res) => {
    const date = new Date();
    const toDate = date.toISOString().split('T')[0];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(date.getDate() - 7);
    const fromDate = sevenDaysAgo.toISOString().split('T')[0];

    const search = req.query.ticker;
    const url = `https://finnhub.io/api/v1/company-news?symbol=${search}&from=${fromDate}&to=${toDate}&token=cn8rl8pr01qocbph3220cn8rl8pr01qocbph322g`;
    axios.get(url).then(response => {
        return res.json(response.data);
    }).catch(error => {
    });
  });

app.get('/api/data/highcharts', (req, res) => {
    const date = new Date();
    const toDate = date.toISOString().split('T')[0];

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(date.getMonth() - 6);
    sixMonthsAgo.setDate(date.getDate() - 1);
    const fromDate = sixMonthsAgo.toISOString().split('T')[0];

    const search = req.query.ticker;
    const url = `https://api.polygon.io/v2/aggs/ticker/${search}/range/1/day/${fromDate}/${toDate}?adjusted=true&sort=asc&apiKey=94GYmeFAD3Jf1tWiRNN2PG7BEwDfxPzl`;
    axios.get(url).then(response => {
        return res.json(response.data);
    }).catch(error => {
    });
  });

  



module.exports = app;