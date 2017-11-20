import AWS from 'aws-sdk';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

function handleError(callback) {
  console.error('Validation Failed');
  callback(null, {
    statusCode: 400,
    headers: { 'Content-Type': 'text/plain' },
    body: "Couldn't get the stock info.",
  });
}

export function get(event, context, callback) {
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      symbol: event.pathParameters.symbol,
    },
  };

  dynamoDb.get(params, (error, result) => {
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
      body: JSON.stringify(result.Item),
    };
    callback(null, response);
  });
}
