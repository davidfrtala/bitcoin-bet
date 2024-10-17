import { useLiveBtcPrice } from '../../../hooks/useLiveBtcPrice';

export function CurrentBTCPrice() {
  const { price, error } = useLiveBtcPrice();
  return (
    <div className="text-center">
      <p className="text-xl font-bold text-gray-400">Current BTC Price</p>
      {error ? (
        <p className="text-4xl font-bold text-red-500">{error}</p>
      ) : (
        <p className="text-4xl font-bold text-orange-400">
          {price !== null ? `$${price.toLocaleString()}` : 'Loading...'}
        </p>
      )}
    </div>
  );
}
