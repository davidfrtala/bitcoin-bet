import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { BitcoinBetStack } from '../../stacks/bitcoin-bet-stack';

describe('BitcoinBetStack Snapshot', () => {
  test('stack matches snapshot', () => {
    const app = new App();
    const stack = new BitcoinBetStack(app, 'TestStack');
    const template = Template.fromStack(stack);

    expect(template.toJSON()).toMatchSnapshot();
  });
});
