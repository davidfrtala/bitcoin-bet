const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { SFNClient, StartExecutionCommand } = require('@aws-sdk/client-sfn');
const { Buffer } = require('node:buffer');

const dynamoDBClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const sfnClient = new SFNClient({ region: process.env.AWS_REGION });

const TableName = process.env.BETS_TABLE_NAME;

exports.handler = async ({ Records }) => {
  for (const record of Records) {
    // Parse the Kinesis record data
    const payload = JSON.parse(
      Buffer.from(record.kinesis.data, 'base64').toString('ascii')
    );
    const { userId, guess, timestamp, waitTime } = payload;

    try {
      // Check if there's an existing bet for the user
      const existingBet = await dynamoDBClient.send(
        new GetCommand({
          TableName,
          Key: { userId },
        })
      );

      // If a bet exists, check its timestamp
      if (existingBet.Item) {
        const timeSinceLastBet = timestamp - existingBet.Item.betTimestamp;
        if (timeSinceLastBet < existingBet.Item.waitTime * 1000) {
          console.warn(
            `Bet for user ${userId} filtered out due to ${waitTime}-second rule`
          );
          continue;
        }
      }

      // Store the new bet
      await dynamoDBClient.send(
        new PutCommand({
          TableName,
          Item: {
            userId,
            guess,
            waitTime,
            betTimestamp: timestamp,
          },
        })
      );
    } catch (error) {
      console.error(
        `Error retrieving user profile for userId ${userId}:`,
        error
      );
      throw error;
    }

    // Prepare and start CoinToss Step Function execution
    const startExecutionCommand = new StartExecutionCommand({
      stateMachineArn: process.env.RESOLVE_STATE_MACHINE_ARN,
      input: JSON.stringify({
        userId,
        guess,
        waitTime,
      }),
    });

    try {
      console.info('Executing CoinToss Step Function');
      await sfnClient.send(startExecutionCommand);
    } catch (error) {
      console.error('Error starting state machine execution:' + error);
      throw error;
    }
  }
};
