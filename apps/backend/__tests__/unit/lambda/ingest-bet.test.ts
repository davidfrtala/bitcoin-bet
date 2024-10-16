import { handler } from '../../../lambda/ingest-bet';
import {
  KinesisClient,
  PutRecordCommand,
  PutRecordCommandInput,
} from '@aws-sdk/client-kinesis';
import { mockClient } from 'aws-sdk-client-mock';
import 'aws-sdk-client-mock-jest';

const kinesisMock = mockClient(KinesisClient);

type Guess = 'UP' | 'DOWN';

describe('ingest-bet Lambda', () => {
  beforeEach(() => {
    kinesisMock.reset();
    process.env.BET_STREAM_NAME = 'test-stream';
  });

  test('successfully puts a record to Kinesis', async () => {
    kinesisMock.on(PutRecordCommand).resolves({});

    const event = {
      identity: { sub: 'user123' },
      input: { guess: 'UP' as Guess, waitTime: 30 },
    };

    await handler(event);

    expect(kinesisMock).toHaveReceivedCommandWith(PutRecordCommand, {
      StreamName: 'test-stream',
      PartitionKey: 'user123',
      Data: expect.any(Buffer),
    });

    const sentCommand = kinesisMock.calls()[0].args[0] as PutRecordCommand;
    const input = sentCommand.input as PutRecordCommandInput;
    const parsedData = JSON.parse(
      Buffer.from(input.Data as Uint8Array).toString()
    );
    expect(parsedData).toMatchObject({
      userId: 'user123',
      guess: 'UP',
      waitTime: 30,
    });
  });

  test('throws an error when Kinesis put fails', async () => {
    kinesisMock.on(PutRecordCommand).rejects(new Error('Kinesis error'));

    const event = {
      identity: { sub: 'user123' },
      input: { guess: 'DOWN' as Guess },
    };

    await expect(handler(event)).rejects.toThrow('Failed to place bet');
  });
});
