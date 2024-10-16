import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { BitcoinBetStack } from '../../../stacks/bitcoin-bet-stack';

describe('BitcoinBetStack', () => {
  let app: App;
  let stack: BitcoinBetStack;
  let template: Template;

  beforeEach(() => {
    app = new App();
    stack = new BitcoinBetStack(app, 'TestStack');
    template = Template.fromStack(stack);
  });

  test('creates two DynamoDB tables', () => {
    template.resourceCountIs('AWS::DynamoDB::Table', 2);
  });

  test('creates a Cognito User Pool', () => {
    template.resourceCountIs('AWS::Cognito::UserPool', 1);
  });

  test('creates a Kinesis stream', () => {
    template.resourceCountIs('AWS::Kinesis::Stream', 1);
  });

  test('creates a Step Function state machine', () => {
    template.resourceCountIs('AWS::StepFunctions::StateMachine', 1);
  });

  test('creates five Lambda functions', () => {
    template.resourceCountIs('AWS::Lambda::Function', 5);
  });

  test('creates an AppSync API', () => {
    template.resourceCountIs('AWS::AppSync::GraphQLApi', 1);
  });
});
