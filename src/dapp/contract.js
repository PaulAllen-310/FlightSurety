import FlightSuretyApp from "../../build/contracts/FlightSuretyApp.json";
import Config from "./config.json";
import Web3 from "web3";

const timestamp = Math.floor(Date.now() / 1000);

export default class Contract {
    constructor(network, callback) {
        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this._initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
        this.flights = [];

        // Test airline and passenger.
        this.testAirline;
        this.testPassenger;
    }

    //
    // Utility functions
    //

    _initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {
            this.owner = accts[0];

            let counter = 1;
            while (this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);
            }

            while (this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }

            this.testAirline = this.airlines[0];
            this.testPassenger = this.passengers[0];

            // Setup the boilerplate for the dapp
            this._registerAndFundAirline(this.testAirline);
            this._registerFlights(this.testAirline);

            callback();
        });
    }

    // Register and fund the airline, swallowing an error as it could have already been setup.
    async _registerAndFundAirline(_airline) {
        try {
            await this.flightSuretyApp.methods.registerAirline(_airline).send({ from: this.owner, gas: 6721975 }, (error, result) => {});
        } catch (e) {}

        try {
            let amount = this.web3.utils.toWei("10", "ether");
            await this.flightSuretyApp.methods.fundAirline().send({ from: _airline, value: amount, gas: 6721975 }, (error, result) => {});
        } catch (e) {}
    }

    // Register the flight, swallowing an error as it could have already been setup.
    async _registerFlights(_airline) {
        this.flights.push("QF01");
        this.flights.push("QF02");
        this.flights.push("QF03");
        this.flights.push("QF04");
        this.flights.push("QF05");
        this.flights.push("QF06");
        this.flights.push("QF07");
        this.flights.push("QF08");
        this.flights.push("QF09");
        this.flights.push("QF10");

        for (let i = 0; i < this.flights.length; i++) {
            try {
                await this.flightSuretyApp.methods.registerFlight(_airline, this.flights[i], timestamp).send({ from: _airline, gas: 6721975 }, (error, result) => {});
            } catch (e) {}
        }
    }

    //
    // Public functions
    //

    isOperational(callback) {
        let self = this;
        self.flightSuretyApp.methods.isOperational().call({ from: self.owner }, callback);
    }

    buyInsurance(flight, callback) {
        let self = this;
        let payload = {
            airline: self.testAirline,
            flight: flight,
            timestamp: timestamp,
            passenger: self.testPassenger,
            amount: self.web3.utils.toWei("1", "ether"),
        };

        self.flightSuretyApp.methods.buy(payload.airline, payload.flight, payload.timestamp).send({ from: payload.passenger, value: payload.amount, gas: 6721975 }, (error, result) => {
            callback(error, payload);
        });
    }

    withdraw(callback) {
        let self = this;
        let payload = {
            passenger: self.testPassenger,
        };

        self.flightSuretyApp.methods.withdraw().send({ from: payload.passenger, gas: 6721975 }, (error, result) => {
            callback(error, payload);
        });
    }

    getCredit(callback) {
        let self = this;
        let payload = {
            passenger: self.testPassenger,
        };

        self.flightSuretyApp.methods.getCredit().call({ from: payload.passenger }, (error, result) => {
            callback(error, result);
        });
    }

    fetchFlightStatus(flight, callback) {
        let self = this;
        let payload = {
            airline: self.testAirline,
            flight: flight,
            timestamp: timestamp,
        };

        self.flightSuretyApp.methods.fetchFlightStatus(payload.airline, payload.flight, payload.timestamp).send({ from: self.owner }, (error, result) => {
            callback(error, payload);
        });
    }
}
