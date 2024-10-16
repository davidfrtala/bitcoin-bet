const { KinesisClient, PutRecordCommand } = require('@aws-sdk/client-kinesis');

let kinesisClient = new KinesisClient({ region: process.env.AWS_REGION });

const DEFAULT_WAIT_TIME_SECONDS = 60;

exports.handler = async (event) => {
  const { identity, input } = event;

  const bet = {
    userId: identity.sub,
    timestamp: Date.now(),
    waitTime: input.waitTime || DEFAULT_WAIT_TIME_SECONDS,
    ...input,
  };

  // Create a command to put the bet data into the Kinesis stream
  const command = new PutRecordCommand({
    Data: Buffer.from(JSON.stringify(bet)),
    PartitionKey: identity.sub,
    StreamName: process.env.BET_STREAM_NAME,
  });

  try {
    await kinesisClient.send(command);
    return 'Bet placed successfully';
  } catch (error) {
    throw new Error('Failed to place bet');
  }
};
