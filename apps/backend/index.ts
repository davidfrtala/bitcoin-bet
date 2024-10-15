#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BitcoinBetStack } from './stacks/bitcoin-bet-stack';

const app = new cdk.App();
new BitcoinBetStack(app, 'BitcoinBetStack', {
  /* enable your own region, if you don't have a region set */
  // env: { region: 'eu-central-1' }
});
