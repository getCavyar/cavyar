export default defineEventHandler(async () => {
  try {
    const res = await fetch(
      "https://pro-api.coinmarketcap.com/v2/tools/price-conversion?id=5426&amount=1&convert=USD",
      {
        headers: {
          "X-CMC_PRO_API_KEY": "8ba08869-a7c8-492a-99bb-4ace6a5328eb",
        },
      }
    );
    const { data } = await res.json();

    return SuccessResponse.new<number>(
      200,
      "Operation was Successful",
      data.quote.USD.price
    );
  } catch (error) {
    return ErrorResponse.new(500, `An unknown error occurred: ${error}`, null);
  }
});
