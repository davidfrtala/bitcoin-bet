const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { GetItem, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { SFNClient, StartExecutionCommand } = require("@aws-sdk/client-sfn");
const { Logger } = require("@aws-lambda-powertools/logger");
const { Buffer } = require("node:buffer");

const dynamoDBClient = new DynamoDBClient({ region: process.env.AWS_REGION });

const logger = new Logger({
  logLevel: "INFO",
  serviceName: "process-bets-stream-handler",
});

const sfnClient = new SFNClient({ region: env.AWS_REGION });

exports.handler = async (event) => {
  for (const record of event.Records) {
    // Parse the Kinesis record data
    const payload = JSON.parse(
      Buffer.from(record.kinesis.data, "base64").toString("ascii")
    );
    const { userId, currentGuess, timestamp } = payload;

    // Retrieve user profile from DynamoDB
    const params = {
      TableName: process.env.BETS_TABLE_NAME,
      Key: {
        userId: userId,
      },
    };

    try {
      const { Item } = await dynamoDBClient.send(new GetItem(params));
      const userProfile = Item;

      if (!userProfile) {
        logger.warn(`User profile not found for userId: ${userId}`);
        return;
      }
    } catch (error) {
      logger.error(
        `Error retrieving user profile for userId ${userId}:`,
        error
      );
      throw error;
    }

    const lastBetTimestamp =
      userProfile.data.getUserProfile?.lastBetTimestamp || 0;

    // Check if user has placed a bet in the last 30 seconds
    if (timestamp - lastBetTimestamp < 30000) {
      logger.warn(
        `Bet for user ${userProfileId} filtered out due to 30-second rule`
      );
      continue;
    }
    // Update user's bet information in DynamoDB
    const updateParams = {
      TableName: process.env.BETS_TABLE_NAME,
      Key: { userId: userId },
      UpdateExpression:
        "SET currentGuess = :guess, lastBetTimestamp = :timestamp",
      ExpressionAttributeValues: {
        ":guess": currentGuess,
        ":timestamp": timestamp,
      },
    };

    try {
      await dynamoDBClient.send(new UpdateCommand(updateParams));
      logger.info(`Updated bet information for user ${userId}`);
    } catch (error) {
      logger.error(`Error updating bet information for user ${userId}:`, error);
      throw error;
    }

    try {
      // // Prepare and start CoinToss Step Function execution
      // const startExecutionCommand = new StartExecutionCommand({
      //   stateMachineArn: process.env.COIN_TOSS_STATE_MACHINE_ARN,
      //   input: JSON.stringify({ userProfileId, currentGuess, wait }),
      // });
      // logger.info("Executing CoinToss Step Function");
      // await sfnClient.send(startExecutionCommand);
    } catch (error) {
      logger.error("Error starting state machine execution:" + error);
      throw error;
    }
  }
};
