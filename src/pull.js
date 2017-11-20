import AWS from 'aws-sdk';
import fetch from 'node-fetch';

const apiKey = '4BTXXNOJRXYRNEOD';
const API_URL = 'https://www.alphavantage.co/query';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

function handleError(callback) {
  console.error('Validation Failed');
  callback(null, {
    statusCode: 400,
    headers: { 'Content-Type': 'text/plain' },
    body: "Couldn't fetch the stock list",
  });
}

const params = {
  TableName: process.env.DYNAMODB_TABLE,
};

function fetchStockData(stockSymbol, functionType) {
  const type = functionType || 'TIME_SERIES_DAILY';

  return fetch(`${API_URL}?function=${type}&symbol=${stockSymbol}&apikey=${apiKey}`)
    .then((response) => {
      if (response.ok) {
        return response;
      }
      return Promise.reject(new Error('fail to fetch stock info.'));
    })
    .then(response => {
      return response.json();
    });
}

export function pull(event, context, callback) {
  const message = JSON.parse(event.Records[0].Sns.Message);
  const stockName = message.name;
  const stockSymbol = message.symbol;
  const timestamp = new Date().getTime();

  fetchStockData(stockSymbol)
    .then((resp) => {
      const closed_value = {};

      for (let key in resp['Time Series (Daily)']) {
        closed_value[key] = resp['Time Series (Daily)'][key]['4. close'];
      }

      const params = {
        TableName: process.env.DYNAMODB_TABLE,
        Item: {
          name: stockName,
          symbol: stockSymbol,
          closed_value: closed_value,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      };

      dynamoDb.put(params, (error) => {
        if (error) {
          handleError(callback);
          return;
        }

        const response = {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
          },
          body: JSON.stringify(params.Item),
        };
        callback(null, response);
      });
    });
}
