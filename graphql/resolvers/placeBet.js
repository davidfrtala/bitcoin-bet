import { util } from "@aws-appsync/utils";

export const request = (ctx) => {
  const { input } = ctx.args;
  const identity = ctx.identity;

  const bet = {
    currentGuess: input.guess,
    startPrice: null,
    endPrice: null,
    lastBetTimestamp: util.time.nowEpochSeconds(),
    userId: identity.sub,
  };

  return {
    operation: "PutItem",
    key: util.dynamodb.toMapValues({
      id: util.autoId(),
    }),
    attributeValues: util.dynamodb.toMapValues(bet),
  };
};

export const response = () => "Bet placed successfully";
