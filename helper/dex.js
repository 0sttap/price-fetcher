const { Contract } = require("ethers");

const UNISWAP_V2_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
const UNISWAP_V2_ROUTER_ABI = ['function getAmountsOut(uint256 amountIn, address[] path) view returns (uint256[] amounts)']
const UNISWAP_V3_QUOTER = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6"
const UNISWAP_V3_QUOTER_ABI = ['function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) view returns (uint256 amountOut)']
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"

const estimateUniswapV2 = async (inputAmount, inputCurrency, outputCurrency, provider) => {
    const router = new Contract(UNISWAP_V2_ROUTER, UNISWAP_V2_ROUTER_ABI, provider);

    const path = [inputCurrency.address, outputCurrency.address];
    inputAmount = BigInt(inputAmount * 10 ** inputCurrency.decimals);

    /**
     * If the input or output currency is not ETH, we need to add WETH to the path
     * because on Uniswap V2 more liquidity is provided for WETH pairs
     */
    let amountOutWithWETH;
    if (inputCurrency.address !== WETH && outputCurrency.address !== WETH) {
        const pathWithWETH = [inputCurrency.address, WETH, outputCurrency.address];

        const amountsWithWETH = await router.getAmountsOut(inputAmount, pathWithWETH);

        amountOutWithWETH = Number(amountsWithWETH[2]) / 10 ** outputCurrency.decimals;
    }

    const amounts = await router.getAmountsOut(inputAmount, path);
    const amountOut = Number(amounts[1]) / 10 ** outputCurrency.decimals;

    if (!amountOutWithWETH) return {exchangeName: "UniswapV2", outputAmount: amountOut};

    const result = amountOut > amountOutWithWETH
      ? {exchangeName: "UniswapV2", outputAmount: amountOut}
      : {exchangeName: "UniswapV2_ThroughWETH", outputAmount: amountOutWithWETH};

    return result;
}

const estimateUniswapV3 = async (inputAmount, inputCurrency, outputCurrency, provider) => {
    const quoter = new Contract(UNISWAP_V3_QUOTER, UNISWAP_V3_QUOTER_ABI, provider);

    inputAmount = BigInt(inputAmount * 10 ** inputCurrency.decimals);

    const fees = [100, 500, 3000, 10000]

    const zeroForOne = inputCurrency.address < outputCurrency.address;
    const sqrtPriceLimitX96 = (zeroForOne ? 4295128749n : 1461446703485210103287273052203988822378723970341n);

    const result = {exchangeName: "UniswapV3"};
    let bestAmountOut = { outputAmount: 0, fee: 0 };

    for await (const fee of fees) {
        try {
          const amountOut = await quoter.quoteExactInputSingle.staticCall(
            inputCurrency.address,
            outputCurrency.address,
            fee,
            inputAmount,
            sqrtPriceLimitX96
          );
        
          if (amountOut > bestAmountOut.outputAmount) {
            bestAmountOut = { outputAmount: amountOut, fee };
          }
        } catch {}
      }

    bestAmountOut.outputAmount = Number(bestAmountOut.outputAmount) / 10 ** outputCurrency.decimals;

    Object.assign(result, bestAmountOut);

    return result;
}

module.exports = { estimateUniswapV2, estimateUniswapV3 };
