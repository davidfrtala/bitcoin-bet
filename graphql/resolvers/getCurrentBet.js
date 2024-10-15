export const request = () => ({
  operation: "Scan",
  filter: {
    expression:
      "attribute_type(endPrice, NULL) OR attribute_not_exists(endPrice) OR endPrice = NULL",
  },
  limit: 1,
});

export const response = (ctx) => ctx.result.items[0];
