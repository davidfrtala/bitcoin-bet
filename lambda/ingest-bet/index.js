const { KinesisClient, PutRecordCommand } = require("@aws-sdk/client-kinesis");

const kinesisClient = new KinesisClient({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
  const { identity, input } = event;

  const bet = {
    userId: identity.sub,
    currentGuess: input.guess,
    timestamp: new Date().toISOString(),
  };

  // Create a command to put the bet data into the Kinesis stream
  const command = new PutRecordCommand({
    Data: Buffer.from(JSON.stringify(bet)),
    PartitionKey: identity.sub,
    StreamName: process.env.BET_STREAM_NAME,
  });

  try {
    await kinesisClient.send(command);
    return "Bet placed successfully";
  } catch (error) {
    console.error("Error putting record to Kinesis:", error);
    throw new Error("Failed to place bet");
  }
};
