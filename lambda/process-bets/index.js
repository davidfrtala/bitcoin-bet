const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");
const { SFNClient, StartExecutionCommand } = require("@aws-sdk/client-sfn");
const { Buffer } = require("node:buffer");

const dynamoDBClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoDBClient);
const sfnClient = new SFNClient({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
  for (const record of event.Records) {
    // Parse the Kinesis record data
    const payload = JSON.parse(
      Buffer.from(record.kinesis.data, "base64").toString("ascii")
    );
    const { userId, currentGuess, timestamp } = payload;

    // Retrieve user bets from DynamoDB
    const params = {
      TableName: process.env.BETS_TABLE_NAME,
      Key: {
        userId,
      },
    };

    try {
      const { Item } = await docClient.send(new GetCommand(params));
      const userProfile = Item;

      if (!userProfile) {
        console.warn(`User profile not found for userId: ${userId}`);
        return;
      }
    } catch (error) {
      console.error(
        `Error retrieving user profile for userId ${userId}:`,
        error
      );
      throw error;
    }

    const lastBetTimestamp =
      userProfile.data.getUserProfile?.lastBetTimestamp || 0;

    // Check if user has placed a bet in the last 30 seconds
    if (timestamp - lastBetTimestamp < 30000) {
      console.warn(
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
      await docClient.send(new UpdateCommand(updateParams));
      console.info(`Updated bet information for user ${userId}`);
    } catch (error) {
      console.error(
        `Error updating bet information for user ${userId}:`,
        error
      );
      throw error;
    }

    // Prepare and start CoinToss Step Function execution
    const startExecutionCommand = new StartExecutionCommand({
      stateMachineArn: process.env.RESOLVE_STATE_MACHINE_ARN,
      input: JSON.stringify({ userId, currentGuess, wait }),
    });

    try {
      console.info("Executing CoinToss Step Function");
      await sfnClient.send(startExecutionCommand);
    } catch (error) {
      console.error("Error starting state machine execution:" + error);
      throw error;
    }
  }
};
