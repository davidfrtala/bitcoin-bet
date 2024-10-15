export const request = (ctx) => {
  const identity = ctx.identity;
  return {
    operation: "GetItem",
    key: util.dynamodb.toMapValues({ userId: identity.sub }),
  };
};

export const response = (ctx) => {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }

  return ctx.result;
};
