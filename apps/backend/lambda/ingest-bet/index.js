const { KinesisClient, PutRecordCommand } = require("@aws-sdk/client-kinesis");

const kinesisClient = new KinesisClient({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
  const { identity, input } = event;

  const bet = {
    userId: identity.sub,
    timestamp: Date.now(),
    ...input,
  };

  // Create a command to put the bet data into the Kinesis stream
  const command = new PutRecordCommand({
    Data: Buffer.from(JSON.stringify(bet)),
    PartitionKey: identity.sub,
    StreamName: process.env.BET_STREAM_NAME,
  });

  try {
    console.info("Putting record to Kinesis:", bet);
    await kinesisClient.send(command);
  } catch (error) {
    console.error("Error putting record to Kinesis:", error);
    throw new Error("Failed to place bet");
  }
};
