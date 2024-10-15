import {
  SecretValue,
  Stack,
  StackProps,
  RemovalPolicy,
  Duration,
} from 'aws-cdk-lib';
import {
  AppsyncFunction,
  AuthorizationType,
  Code,
  Definition,
  FunctionRuntime,
  GraphqlApi,
  Resolver,
  FieldLogLevel,
  UserPoolDefaultAction,
} from 'aws-cdk-lib/aws-appsync';
import {
  AttributeType,
  BillingMode,
  Table,
  ProjectionType,
} from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as kinesis from 'aws-cdk-lib/aws-kinesis';
import { KinesisEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as events from 'aws-cdk-lib/aws-events';
import { join } from 'node:path';

export class BitcoinBetStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create DynamoDB table for Players
    const playerTable = new Table(this, 'PlayerTable', {
      tableName: 'bitcoin-players',
      partitionKey: { name: 'userId', type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PROVISIONED,
      readCapacity: 2,
      writeCapacity: 4,
    });

    // Create DynamoDB table
    const betsTable = new Table(this, 'BetTable', {
      tableName: 'bitcoin-bets',
      partitionKey: { name: 'userId', type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PROVISIONED,
      readCapacity: 2,
      writeCapacity: 4,
    });

    // Create state machine
    const resolveStack = new sfn.StateMachine(this, 'ResolveStateMachine', {
      definitionBody: this.getWorkflowDefinition({ betsTable, playerTable }),
      timeout: Duration.minutes(2),
    });

    playerTable.grantReadWriteData(resolveStack);
    betsTable.grantReadWriteData(resolveStack);

    // Create Lambda function for post-signup
    const postSignupLambda = new lambda.Function(this, 'PostSignupLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(join(__dirname, '../lambda/post-signup')),
      environment: {
        PLAYER_TABLE_NAME: playerTable.tableName,
      },
    });

    // Grant the Lambda function write permissions to the Player table
    playerTable.grantWriteData(postSignupLambda);

    // Create Cognito User Pool
    const userPool = new cognito.UserPool(this, 'BitcoinBetUserPool', {
      selfSignUpEnabled: true,
      autoVerify: { email: true },
      signInAliases: { email: true },
      standardAttributes: {
        email: { required: true, mutable: true },
      },
      passwordPolicy: {
        minLength: 6,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: RemovalPolicy.DESTROY,
      lambdaTriggers: {
        postConfirmation: postSignupLambda,
      },
    });

    // Create Cognito User Pool Client
    new cognito.UserPoolClient(this, 'BitcoinBetUserPoolClient', {
      userPool,
      generateSecret: false,
      authFlows: {
        adminUserPassword: true,
        userPassword: true,
        userSrp: true,
      },
    });

    // Create Kinesis stream for bet placement
    const betStream = new kinesis.Stream(this, 'BetPlacementStream', {
      shardCount: 1,
      retentionPeriod: Duration.hours(24),
    });

    const ingestBetLambda = new lambda.Function(this, 'IngestBetLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(join(__dirname, '../lambda/ingest-bet')),
      environment: {
        BET_STREAM_NAME: betStream.streamName,
      },
    });

    const processBetsLambda = new lambda.Function(this, 'ProcessBetsLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(join(__dirname, '../lambda/process-bets')),
      environment: {
        BETS_TABLE_NAME: betsTable.tableName,
        RESOLVE_STATE_MACHINE_ARN: resolveStack.stateMachineArn,
      },
    });

    // // Add Kinesis stream as an event source for the process-bets function
    processBetsLambda.addEventSource(
      new KinesisEventSource(betStream, {
        startingPosition: lambda.StartingPosition.LATEST,
        reportBatchItemFailures: true,
      })
    );

    processBetsLambda.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        resources: [resolveStack.stateMachineArn],
        actions: ['states:StartExecution'],
      })
    );

    betsTable.grantReadWriteData(processBetsLambda);

    // Grant the Lambda function permissions to put records into the Kinesis stream
    betStream.grantWrite(ingestBetLambda);

    // Add GSI for userId
    betsTable.addGlobalSecondaryIndex({
      indexName: 'UserIdIndex',
      partitionKey: { name: 'userId', type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    const api = new GraphqlApi(this, 'BetsApi', {
      name: 'betsAPI',
      definition: Definition.fromFile(
        join(__dirname, '../graphql/schema.graphql')
      ),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool,
            defaultAction: UserPoolDefaultAction.ALLOW,
          },
        },
        additionalAuthorizationModes: [
          {
            authorizationType: AuthorizationType.IAM,
          },
        ],
      },
      logConfig: {
        fieldLogLevel: FieldLogLevel.ALL,
      },
    });

    // Connect DynamoDB tables to the AppSync API as data sources
    const betsDataSource = api.addDynamoDbDataSource(
      'BetsDataSource',
      betsTable
    );
    const playerDataSource = api.addDynamoDbDataSource(
      'PlayerDataSource',
      playerTable
    );
    const ingestBetDataSource = api.addLambdaDataSource(
      'IngestBetDataSource',
      ingestBetLambda
    );

    const currentBetResolver = new AppsyncFunction(this, 'CurrentBetFunction', {
      name: 'getCurrentBet',
      api,
      dataSource: betsDataSource,
      code: Code.fromAsset(
        join(__dirname, '../graphql/resolvers/getCurrentBet.js')
      ),
      runtime: FunctionRuntime.JS_1_0_0,
    });

    new Resolver(this, 'PipelineResolverCurrentBet', {
      api,
      typeName: 'Query',
      fieldName: 'currentBet',
      runtime: FunctionRuntime.JS_1_0_0,
      code: Code.fromAsset(join(__dirname, '../graphql/resolvers/pipeline.js')),
      pipelineConfig: [currentBetResolver],
    });

    const placeBetResolver = new AppsyncFunction(this, 'PlaceBetFunction', {
      name: 'placeBet',
      api,
      dataSource: ingestBetDataSource,
      code: Code.fromAsset(join(__dirname, '../graphql/resolvers/placeBet.js')),
      runtime: FunctionRuntime.JS_1_0_0,
    });

    new Resolver(this, 'PipelineResolverPlaceBet', {
      api,
      typeName: 'Mutation',
      fieldName: 'placeBet',
      runtime: FunctionRuntime.JS_1_0_0,
      code: Code.fromAsset(join(__dirname, '../graphql/resolvers/pipeline.js')),
      pipelineConfig: [placeBetResolver],
    });

    const getPlayerResolver = new AppsyncFunction(this, 'GetPlayerFunction', {
      name: 'getPlayer',
      api,
      dataSource: playerDataSource,
      code: Code.fromAsset(
        join(__dirname, '../graphql/resolvers/getPlayer.js')
      ),
      runtime: FunctionRuntime.JS_1_0_0,
    });

    new Resolver(this, 'PipelineResolverGetPlayer', {
      api,
      typeName: 'Query',
      fieldName: 'getPlayer',
      runtime: FunctionRuntime.JS_1_0_0,
      code: Code.fromAsset(join(__dirname, '../graphql/resolvers/pipeline.js')),
      pipelineConfig: [getPlayerResolver],
    });
  }

  private getWorkflowDefinition({
    betsTable,
    playerTable,
  }: {
    betsTable: Table;
    playerTable: Table;
  }) {
    const calculateResultLambda = new lambda.Function(
      this,
      'CalculateResultLambda',
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: 'index.handler',
        code: lambda.Code.fromAsset(
          join(__dirname, '../lambda/calculate-result')
        ),
      }
    );

    const connection = new events.Connection(this, 'BtcApiConnection', {
      description: 'Connection to BTC Price API',
      authorization: events.Authorization.basic(
        'username',
        SecretValue.unsafePlainText('password')
      ),
    });

    const waitX = new sfn.Wait(this, `Wait X Seconds`, {
      time: sfn.WaitTime.secondsPath('$.wait'),
    });

    const readPlayerScore = new tasks.DynamoGetItem(this, 'Get player score', {
      table: playerTable,
      key: {
        userId: tasks.DynamoAttributeValue.fromString(
          sfn.JsonPath.stringAt('$.userId')
        ),
      },
      resultSelector: {
        'score.$': '$.Item.score.N',
      },
      resultPath: '$.player',
    });

    const readBet = new tasks.DynamoGetItem(this, 'Get user bet by id', {
      table: betsTable,
      key: {
        userId: tasks.DynamoAttributeValue.fromString(
          sfn.JsonPath.stringAt('$.userId')
        ),
      },
      resultSelector: {
        'item.$': '$.Item',
      },
      resultPath: '$.userBet',
    });

    const btcPriceFetch = (name: string, resultPath: string) =>
      new tasks.HttpInvoke(this, name, {
        connection,
        apiRoot: 'https://api.binance.com',
        apiEndpoint: sfn.TaskInput.fromText('api/v3/ticker/price'),
        queryStringParameters: sfn.TaskInput.fromObject({
          symbol: 'BTCUSDT',
        }),
        method: sfn.TaskInput.fromText('GET'),
        resultPath,
        resultSelector: {
          'value.$': '$.ResponseBody.price',
        },
      });

    const calculateResult = new tasks.LambdaInvoke(this, 'Calculate Result', {
      lambdaFunction: calculateResultLambda,
      inputPath: '$',
      resultPath: '$.calculationResult',
      payloadResponseOnly: true,
    });

    const updateBet = new tasks.DynamoUpdateItem(this, 'Update user bet', {
      table: betsTable,
      key: {
        userId: tasks.DynamoAttributeValue.fromString(
          sfn.JsonPath.stringAt('$.userId')
        ),
      },
      updateExpression:
        'SET startPrice = :startPrice, endPrice = :endPrice, priceDiff = :priceDiff, #res = :result',
      expressionAttributeNames: {
        '#res': 'result',
      },
      expressionAttributeValues: {
        ':startPrice': tasks.DynamoAttributeValue.fromNumber(
          sfn.JsonPath.numberAt('$.btcPriceStart.value')
        ),
        ':endPrice': tasks.DynamoAttributeValue.fromNumber(
          sfn.JsonPath.numberAt('$.btcPriceEnd.value')
        ),
        ':priceDiff': tasks.DynamoAttributeValue.fromNumber(
          sfn.JsonPath.numberAt('$.calculationResult.priceDiff')
        ),
        ':result': tasks.DynamoAttributeValue.fromString(
          sfn.JsonPath.stringAt('$.calculationResult.result')
        ),
      },
      resultPath: sfn.JsonPath.DISCARD,
    });

    const updatePlayerScore = new tasks.DynamoUpdateItem(
      this,
      'Update player score',
      {
        table: playerTable,
        key: {
          userId: tasks.DynamoAttributeValue.fromString(
            sfn.JsonPath.stringAt('$.userId')
          ),
        },
        updateExpression: 'SET score = :score',
        expressionAttributeValues: {
          ':score': tasks.DynamoAttributeValue.fromNumber(
            sfn.JsonPath.numberAt('$.calculationResult.newScore')
          ),
        },
        resultPath: sfn.JsonPath.DISCARD,
      }
    );

    const definition = sfn.Chain.start(
      btcPriceFetch('Fetch BTC Price Start', '$.btcPriceStart')
        .next(waitX)
        .next(btcPriceFetch('Fetch BTC Price End', '$.btcPriceEnd'))
        .next(readBet)
        .next(readPlayerScore)
        .next(calculateResult)
        .next(updateBet)
        .next(updatePlayerScore)
        .next(new sfn.Succeed(this, 'Succeed'))
    );

    return sfn.DefinitionBody.fromChainable(definition);
  }
}
