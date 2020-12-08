import FlightSuretyApp from "../../build/contracts/FlightSuretyApp.json";
import Config from "./config.json";
import Web3 from "web3";
import express from "express";

let config = Config["localhost"];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace("http", "ws")));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);

//
// Oracle Registration
//

let accountsAsOracles = []; // Store the accounts being used as oracles.
let oracleToIndexesList = []; // Store the indexes assigned to each oracle.

function assignOracleAccounts() {
    return new Promise((resolve) => {
        web3.eth
            .getAccounts()
            .then((accounts) => {
                // Assign the last 20 accounts to mimic oracles.
                let noOfAccounts = accounts.length;
                accountsAsOracles = accounts.slice(noOfAccounts - 20, noOfAccounts);
            })
            .then(() => {
                resolve(accountsAsOracles);
            });
    });
}

function makeOracleRequests(accounts) {
    for (let count = 0; count < accountsAsOracles.length; count++) {
        let account = accountsAsOracles[count];

        flightSuretyApp.methods
            .registerOracle()
            .send({ from: account, value: web3.utils.toWei("1", "ether"), gas: 5000000, gasPrice: 20000000 })
            .then(() => {
                storeOracleToIndex(account);
            });
    }
}

function storeOracleToIndex(account) {
    flightSuretyApp.methods
        .getMyIndexes()
        .call({ from: account })
        .then((result) => {
            console.log("Storing indexes as: " + result + " for account: " + account);
            oracleToIndexesList.push(result);
        });
}

// Assign 20 accounts to be oracles and then register them with the smart contract.
assignOracleAccounts().then((accounts) => {
    makeOracleRequests(accounts);
});

//
// Oracle Event Listeners
//

flightSuretyApp.events.OracleRequest(function (error, event) {
    console.log("Error: " + error);

    let index = event.returnValues.index;
    let airline = event.returnValues.airline;
    let flight = event.returnValues.flight;
    let timestamp = event.returnValues.timestamp;

    console.log("Processing oracle request for index: " + index + " airline: " + airline + " flight: " + flight + " timestamp: " + timestamp);
    /*for (let count = 0; count < accountsAsOracles.length; count++) {
        let oracle = accountsAsOracles[count];
        let indexes = oracleToIndexesList[count];

        if (indexes[0] == index || indexes[1] == index || indexes[2] == index) {
            if (flight == "QF10") {
                submitOracleResponse(oracle, index, airline, flight, timestamp, 20);
            } else {
                submitOracleResponse(oracle, index, airline, flight, timestamp, 10);
            }
        }
    }*/
});

//
// Oracle APIs
//

const app = express();
app.get("/api", (req, res) => {
    res.send({
        message: "An API for use with your Dapp!",
    });
});

export default app;
