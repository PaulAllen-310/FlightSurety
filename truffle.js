//var HDWalletProvider = require("truffle-hdwallet-provider");
//var mnemonic = "cricket problem endorse popular skill catalog magic slam disagree security use dad";

module.exports = {
    networks: {
        development: {
            host: "127.0.0.1", // Localhost (default: none)
            port: 7545, // Standard Ethereum port (default: none)
            network_id: "*", // Any network (default: none)
        },
    },
    compilers: {
        solc: {
            version: "^0.5.15",
        },
    },
};
