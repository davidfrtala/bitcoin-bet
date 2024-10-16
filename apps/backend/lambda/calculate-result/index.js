exports.handler = async (event) => {
  const { player, userBet, btcPriceStart, btcPriceEnd } = event;
  const { S: guess } = userBet.item.guess;

  const startPrice = parseFloat(btcPriceStart.value);
  const endPrice = parseFloat(btcPriceEnd.value);
  const score = parseInt(player.score);
  const priceDiff = endPrice - startPrice;

  let result;
  if (
    (guess === 'UP' && priceDiff > 0) ||
    (guess === 'DOWN' && priceDiff < 0)
  ) {
    result = 'WIN';
  } else {
    result = 'LOSS';
  }

  const scoreChange = score + (result === 'WIN' ? 1 : -1);

  return {
    result,
    priceDiff: priceDiff.toFixed(2),
    newScore: scoreChange.toString(),
  };
};
