/* Sample backend api to proxy coinmarketcap from coinmarketcap, work in progress*/

const axios = require('axios')
const {send} = require('micro')
const totalPaid = 1140;
const wallet = JSON.parse(`{"holding":[{"quantity":"0.3136","symbol":"ETH"},{"quantity":"128","symbol":"XRP"},{"quantity":"556","symbol":"ADA"},{"quantity":"0.276","symbol":"XMR"},{"quantity":"0.9569","symbol":"LTC"},{"quantity":"3023","symbol":"DGB"},{"quantity":"10943","symbol":"DOGE"},{"quantity":"231","symbol":"GNT"}]}`).holding;

let diff = 'not loaded yet, refresh';
let updatedAt = '';

const  getPrices = () =>
  axios
    .get('https://api.coinmarketcap.com/v1/ticker/?convert=EUR', {
      timeout: 1000 * 60 * 2
    })
    .then(({data}) => getDiff(data))
    .catch(err => console.log(err))

const getDiff = (data) => {
  let prices = data || [];
  let portfolio = []
  wallet.forEach(coin => {
    let match = prices.filter && prices.filter(price => price.symbol === coin.symbol)[0]

    if (!match) return

    portfolio.push({
      symbol: match.symbol,
      quantity: coin.quantity,
      subtotal:
      parseFloat(coin.quantity, 10) * parseFloat(match.price_eur),
    })
  })
  const reducer = (accumulator, currentValue) =>
    parseFloat(accumulator, 10) + parseFloat(currentValue.subtotal, 10)

  let portfolioValue = Math.floor(portfolio.reduce(reducer, 0))

  let now = new Date()
  updatedAt = now.toString()
  return (portfolioValue - totalPaid);
}

const updateDiff = async () => {
  diff = await getPrices();
}

updateDiff()
setInterval(updateDiff, 1000 * 60)

module.exports =  (req, res) => {
    send(res, 200, { diff, updatedAt })
}
