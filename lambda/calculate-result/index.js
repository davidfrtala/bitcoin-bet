exports.handler = async (event) => {
  const { player, userBet, btcPriceStart, btcPriceEnd } = event;
  const { currentGuess } = userBet.item;

  const startPrice = parseFloat(btcPriceStart.value);
  const endPrice = parseFloat(btcPriceEnd.value);
  const score = parseInt(player.score);
  const priceDiff = (endPrice - startPrice).toFixed(2);

  let result;
  if (
    (currentGuess === "UP" && priceDiff > 0) ||
    (currentGuess === "DOWN" && priceDiff < 0)
  ) {
    result = "WIN";
  } else {
    result = "LOSS";
  }

  const scoreChange = score + (result === "WIN" ? 1 : -1);

  return {
    result,
    priceDiff,
    newScore: scoreChange.toString(),
  };
};
