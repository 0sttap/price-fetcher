const axios = require('axios');

const estimateBinance = async (inputAmount, inputCurrency, outputCurrency) => {
    const url1 = `https://api.binance.com/api/v3/ticker/price?symbol=${inputCurrency}${outputCurrency}`;
    const url2 = `https://api.binance.com/api/v3/ticker/price?symbol=${outputCurrency}${inputCurrency}`;

    try {
        const response1 = await axios.get(url1);
        return {exchangeName: "Binance", outputAmount: inputAmount * response1.data.price};
    } catch (error) {
        try {
            const response2 = await axios.get(url2);
            return {exchangeName: "Binance", outputAmount: inputAmount * (1 / response2.data.price)};
        } catch (error) {
            throw new Error('Unable to fetch price from Binance');
        }
    }
};

const estimateKucoin = async (inputAmount, inputCurrency, outputCurrency) => {
    const url1 = `https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=${inputCurrency}-${outputCurrency}`;
    const url2 = `https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=${outputCurrency}-${inputCurrency}`;

    try {
        const response1 = await axios.get(url1);
        return {exchangeName: "Kucoin", outputAmount: inputAmount * response1.data.data.price};
    } catch (error) {
        try {
            const response2 = await axios.get(url2);
            return {exchangeName: "Kucoin", outputAmount: inputAmount * (1 / response2.data.data.price)};
        } catch (error) {
            throw new Error('Unable to fetch price from Kucoin');
        }
    }
};

module.exports = { estimateBinance, estimateKucoin };