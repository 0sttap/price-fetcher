const ethers = require("ethers");
const express = require("express");
const { estimateUniswapV2, estimateUniswapV3 } = require("../helper/dex");
const { estimateBinance, estimateKucoin } = require("../helper/cex");

const router = express.Router();
const provider = new ethers.JsonRpcProvider("https://eth.merkle.io");

const tokens = new Map();

tokens.set("ETH", {address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", decimals: 18});
tokens.set("BTC", {address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", decimals: 8});
tokens.set("USDT", {address: "0xdac17f958d2ee523a2206206994597c13d831ec7", decimals: 6});

router.get("/estimate", async (req, res) => {
    const { inputAmount, inputCurrency, outputCurrency } = req.query;

    if (!inputAmount || !inputCurrency || !outputCurrency) {
        return res.status(400).json({ error: "Please provide inputAmount, inputCurrency and outputCurrency query parameters" });
    }

    try {
        const results = await Promise.allSettled([
            estimateUniswapV2(inputAmount, tokens.get(inputCurrency), tokens.get(outputCurrency), provider),
            estimateUniswapV3(inputAmount, tokens.get(inputCurrency), tokens.get(outputCurrency), provider),
            estimateBinance(inputAmount, inputCurrency, outputCurrency),
            estimateKucoin(inputAmount, inputCurrency, outputCurrency)
        ]);

        const successfulResults = results
            .filter(result => result.status === 'fulfilled')
            .map(result => result.value);

        if (successfulResults.length === 0) {
            return res.status(500).json({ error: "All estimations failed" });
        }

        const bestResult = successfulResults.reduce((prev, curr) => (prev.outputAmount > curr.outputAmount ? prev : curr));

        res.json(bestResult);
    } catch (error) {
        console.error("Error estimating prices:", error);
        res.status(500).json({ error: "Error estimating prices" });
    }
});

router.get("/getRates", async (req, res) => {
    const { baseCurrency, quoteCurrency } = req.query;
    
    if (!baseCurrency || !quoteCurrency) {
        return res.status(400).json({ error: "Please provide baseCurrency and quoteCurrency query parameters" });
    }

    try {
        const results = await Promise.allSettled([
            estimateUniswapV2(1, tokens.get(baseCurrency), tokens.get(quoteCurrency), provider),
            estimateUniswapV3(1, tokens.get(baseCurrency), tokens.get(quoteCurrency), provider),
            estimateBinance(1, baseCurrency, quoteCurrency),
            estimateKucoin(1, baseCurrency, quoteCurrency)
        ]);

        res.json(results.map(result => {
            if (result.status === 'fulfilled') {
                return {
                    exchangeName: result.value.exchangeName,
                    rate: result.value.outputAmount
                };
            } else {
                return result;
            }
        }));
    } catch (error) {
        console.error("Error fetching rates:", error);
        res.status(500).json({ error: "Error fetching rates" });
    }
});

module.exports = router;