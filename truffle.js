//var HDWalletProvider = require("truffle-hdwallet-provider");
//var mnemonic = "cricket problem endorse popular skill catalog magic slam disagree security use dad";

module.exports = {
    networks: {
        development: {
            host: "127.0.0.1", // Localhost (default: none)
            port: 8545, // Standard Ethereum port (default: none)
            network_id: "*", // Any network (default: none)
            gas: 6721975,
        },
    },
    compilers: {
        solc: {
            version: "^0.5.15",
        },
    },
};
