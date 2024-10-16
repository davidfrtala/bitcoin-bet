export function CurrentBTCPrice() {
  return (
    <div className="text-center">
      <p className="text-xl font-bold text-gray-400">Current BTC Price</p>
      <p className="text-4xl font-bold text-orange-400">
        ${(61726.21).toLocaleString()}
      </p>
    </div>
  );
}
