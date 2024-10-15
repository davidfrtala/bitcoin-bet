import { Stack, StackProps, RemovalPolicy } from "aws-cdk-lib";
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
} from "aws-cdk-lib/aws-appsync";
import {
  AttributeType,
  BillingMode,
  Table,
  ProjectionType,
} from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as lambda from "aws-cdk-lib/aws-lambda";
import path = require("path");

export class BitcoinBetStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create DynamoDB table for Players
    const playerTable = new Table(this, "PlayerTable", {
      tableName: "bitcoin-players",
      partitionKey: { name: "userId", type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    // Create Lambda function for post-signup
    const postSignupLambda = new lambda.Function(this, "PostSignupLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../lambda/post-signup")
      ),
      environment: {
        PLAYER_TABLE_NAME: playerTable.tableName,
      },
    });

    // Grant the Lambda function write permissions to the Player table
    playerTable.grantWriteData(postSignupLambda);

    // Create Cognito User Pool
    const userPool = new cognito.UserPool(this, "BitcoinBetUserPool", {
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
    const userPoolClient = new cognito.UserPoolClient(
      this,
      "BitcoinBetUserPoolClient",
      {
        userPool,
        generateSecret: false,
        authFlows: {
          adminUserPassword: true,
          userPassword: true,
          userSrp: true,
        },
      }
    );

    // Create DynamoDB table
    const betsTable = new Table(this, "BetTable", {
      partitionKey: { name: "id", type: AttributeType.STRING },
      sortKey: { name: "lastBetTimestamp", type: AttributeType.NUMBER },
      tableName: "bitcoin-bets",
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PROVISIONED,
      readCapacity: 2,
      writeCapacity: 4,
    });

    // Add GSI for userId
    betsTable.addGlobalSecondaryIndex({
      indexName: "UserIdIndex",
      partitionKey: { name: "userId", type: AttributeType.STRING },
      sortKey: { name: "lastBetTimestamp", type: AttributeType.NUMBER },
      projectionType: ProjectionType.ALL,
    });

    // Pass both tables to createGraphqlApi method
    this.createGraphqlApi(betsTable, playerTable, userPool);
  }

  private createGraphqlApi(
    betsTable: Table,
    playerTable: Table,
    userPool: cognito.UserPool
  ): void {
    const api = new GraphqlApi(this, "BetsApi", {
      name: "betsAPI",
      definition: Definition.fromFile(
        path.join(__dirname, "../graphql/schema.graphql")
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
      "BetsDataSource",
      betsTable
    );
    const playerDataSource = api.addDynamoDbDataSource(
      "PlayerDataSource",
      playerTable
    );

    // Create and configure resolvers
    this.createResolvers(api, betsDataSource, playerDataSource);
  }

  private createResolvers(
    api: GraphqlApi,
    betsDataSource: any,
    playerDataSource: any
  ): void {
    const currentBetResolver = new AppsyncFunction(this, "CurrentBetFunction", {
      name: "getCurrentBet",
      api,
      dataSource: betsDataSource,
      code: Code.fromAsset(
        path.join(__dirname, "../graphql/resolvers/getCurrentBet.js")
      ),
      runtime: FunctionRuntime.JS_1_0_0,
    });

    const listBetsResolver = new AppsyncFunction(this, "ListBetsFunction", {
      name: "listBets",
      api,
      dataSource: betsDataSource,
      code: Code.fromAsset(
        path.join(__dirname, "../graphql/resolvers/listBets.js")
      ),
      runtime: FunctionRuntime.JS_1_0_0,
    });

    new Resolver(this, "PipelineResolverCurrentBet", {
      api,
      typeName: "Query",
      fieldName: "currentBet",
      runtime: FunctionRuntime.JS_1_0_0,
      code: Code.fromAsset(
        path.join(__dirname, "../graphql/resolvers/pipeline.js")
      ),
      pipelineConfig: [currentBetResolver],
    });

    new Resolver(this, "PipelineResolverListBets", {
      api,
      typeName: "Query",
      fieldName: "listBets",
      runtime: FunctionRuntime.JS_1_0_0,
      code: Code.fromAsset(
        path.join(__dirname, "../graphql/resolvers/pipeline.js")
      ),
      pipelineConfig: [listBetsResolver],
    });

    const placeBetResolver = new AppsyncFunction(this, "PlaceBetFunction", {
      name: "placeBet",
      api,
      dataSource: betsDataSource,
      code: Code.fromAsset(
        path.join(__dirname, "../graphql/resolvers/placeBet.js")
      ),
      runtime: FunctionRuntime.JS_1_0_0,
    });

    new Resolver(this, "PipelineResolverPlaceBet", {
      api,
      typeName: "Mutation",
      fieldName: "placeBet",
      runtime: FunctionRuntime.JS_1_0_0,
      code: Code.fromAsset(
        path.join(__dirname, "../graphql/resolvers/pipeline.js")
      ),
      pipelineConfig: [placeBetResolver],
    });

    const getPlayerResolver = new AppsyncFunction(this, "GetPlayerFunction", {
      name: "getPlayer",
      api,
      dataSource: playerDataSource,
      code: Code.fromAsset(
        path.join(__dirname, "../graphql/resolvers/getPlayer.js")
      ),
      runtime: FunctionRuntime.JS_1_0_0,
    });

    new Resolver(this, "PipelineResolverGetPlayer", {
      api,
      typeName: "Query",
      fieldName: "getPlayer",
      runtime: FunctionRuntime.JS_1_0_0,
      code: Code.fromAsset(
        path.join(__dirname, "../graphql/resolvers/pipeline.js")
      ),
      pipelineConfig: [getPlayerResolver],
    });
  }
}
