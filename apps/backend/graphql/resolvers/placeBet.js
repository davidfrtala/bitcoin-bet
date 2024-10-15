export const request = (ctx) => {
  const { input } = ctx.args;
  const identity = ctx.identity;

  return {
    operation: 'Invoke',
    invocationType: 'Event',
    payload: {
      input,
      identity,
    },
  };
};

export const response = () => 'Bet placed successfully';
