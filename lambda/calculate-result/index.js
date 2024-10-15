exports.handler = async (event) => {
  const { player, userBet, btcPriceStart, btcPriceEnd } = event;
  const { currentGuess } = userBet.item;

  const startPrice = parseFloat(btcPriceStart.value);
  const endPrice = parseFloat(btcPriceEnd.value);
  const priceDiff =
    Math.round((endPrice - startPrice + Number.EPSILON) * 100) / 100;

  let result;
  if (
    (currentGuess === "UP" && priceDiff > 0) ||
    (currentGuess === "DOWN" && priceDiff < 0)
  ) {
    result = "WIN";
  } else {
    result = "LOSS";
  }

  const newScore = result === "WIN" ? player.score++ : player.score--;

  return {
    result,
    priceDiff,
    newScore,
  };
};
