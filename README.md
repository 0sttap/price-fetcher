## Getting Started

### Requirements

The following will need to be installed in order to use this. Please follow the links and instructions.

-   [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)  
    -   You'll know you've done it right if you can run `git --version`
-   [NodeJS](https://nodejs.org/en/download/package-manager)
    -   Check that Node is installed by running: `node --version` and get an output like: `v18.16.1`

### Quickstart

#### 1. Clone this repo

```shell
git clone https://github.com/0sttap/price-fetcher.git
cd price-fetcher
```

#### 2. Install dependencies

Once you've cloned and entered into your repository, you need to install the necessary dependencies. In order to do so, simply run:

```shell
npm install
```

#### 3. Run script

To run script with nodemon use this command:

```shell
npm start
```

For simple run use:

```shell
node index.js
```

#### 4. Request & response example:

 4.1 Get Rates:
 `http://localhost:3000/api/getRates?baseCurrency=BTC&quoteCurrency=USDT`

 `[{"exchangeName":"UniswapV2_ThroughWETH","rate":59899.85359},{"exchangeName":"UniswapV3","rate":60889.744764},{"exchangeName":"Binance","rate":61062.3}, 
  {"exchangeName":"Kucoin","rate":61056.2}]`

 4.2 Estimate:
 `http://localhost:3000/api/estimate?inputAmount=1&inputCurrency=ETH&outputCurrency=USDT`

 `{"exchangeName":"Kucoin","outputAmount":2668.83}`

 *inputAmount convert to decimals automatically

