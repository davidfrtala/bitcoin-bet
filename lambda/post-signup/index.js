import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

const dynamoDBClient = new DynamoDBClient({ region: process.env.AWS_REGION });

export const handler = async (event) => {
  const TableName = process.env.PLAYER_TABLE_NAME;

  const userId = event.request.userAttributes.sub;
  const email = event.request.userAttributes.email;

  const params = {
    TableName,
    Item: {
      userId,
      email,
      score: 0,
    },
  };

  try {
    await dynamoDBClient.send(new PutCommand(params));
    console.log(`User ${userId} added to table ${TableName}`);
  } catch (error) {
    console.error(`Error adding user ${userId} to table ${TableName}:`, error);
    throw new Error(`Error adding user to table: ${error.message}`);
  }

  return event;
};
