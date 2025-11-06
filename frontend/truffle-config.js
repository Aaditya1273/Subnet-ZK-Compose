require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
    networks: {
      development: {
        host: "127.0.0.1", 
        port: 7545, 
        network_id: "5777", 
      },
      sepolia: {
        provider: () => new HDWalletProvider(
          process.env.PRIVATE_KEY,
          process.env.RPC_URL || "https://rpc.sepolia.org"
        ),
        network_id: 11155111,
        confirmations: 2,
        timeoutBlocks: 200,
        skipDryRun: true,
        gas: 6000000,
        gasPrice: 20000000000, // 20 gwei
      }
    },
    compilers: {
      solc: {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    },
    plugins: ["truffle-plugin-verify"]
  };
  