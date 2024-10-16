import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { BitcoinBetStack } from '../../stacks/bitcoin-bet-stack';

describe('BitcoinBetStack Integration', () => {
  let app: App;
  let stack: BitcoinBetStack;
  let template: Template;

  beforeEach(() => {
    app = new App();
    stack = new BitcoinBetStack(app, 'TestStack');
    template = Template.fromStack(stack);
  });

  xtest('Lambda functions have correct permissions', () => {
    // Check if the ProcessBetsLambda has permission to start the Step Function
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: [
          {
            Action: 'states:StartExecution',
            Effect: 'Allow',
            Resource: {
              Ref: expect.stringMatching(/ResolveStateMachine.+/),
            },
          },
        ],
      },
    });

    // Check if the IngestBetLambda has permission to write to the Kinesis stream
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: [
          {
            Action: ['kinesis:PutRecord', 'kinesis:PutRecords'],
            Effect: 'Allow',
            Resource: {
              'Fn::GetAtt': [
                expect.stringMatching(/BetPlacementStream.+/),
                'Arn',
              ],
            },
          },
        ],
      },
    });
  });

  test('AppSync API is connected to the correct data sources', () => {
    template.hasResourceProperties('AWS::AppSync::DataSource', {
      Type: 'AMAZON_DYNAMODB',
      Name: 'BetsDataSource',
    });

    template.hasResourceProperties('AWS::AppSync::DataSource', {
      Type: 'AMAZON_DYNAMODB',
      Name: 'PlayerDataSource',
    });

    template.hasResourceProperties('AWS::AppSync::DataSource', {
      Type: 'AWS_LAMBDA',
      Name: 'IngestBetDataSource',
    });
  });
});
