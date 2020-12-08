var Test = require("../config/testConfig.js");
var BigNumber = require("bignumber.js");
var truffleAssert = require("truffle-assertions");

contract("Flight Surety App Tests", async (accounts) => {
    var config;
    before("setup contract", async () => {
        config = await Test.Config(accounts);

        // Authorise the app contract to make calls on the data contract.
        await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
    });

    /****************************************************************************************/
    /* Fund Airline                                                                        */
    /****************************************************************************************/

    it("fundAirline: Ensure that an airline pays sufficient funds", async () => {
        let registeredAirline = config.firstAirline;

        // Ensure that funding is rejected if the funds are not sufficient.
        try {
            const tx = await config.flightSuretyApp.fundAirline({ from: registeredAirline, value: web3.utils.toWei("9", "ether") });
            assert.fail("An airline should not be able to pay insufficient funds.");
        } catch (e) {}
    });

    it("fundAirline: Ensure that an airline is registered before paying funds", async () => {
        let unregisteredAirline = accounts[7];

        // Ensure that funding is rejected if the funds are not sufficient.
        try {
            const tx = await config.flightSuretyApp.fundAirline({ from: unregisteredAirline, value: web3.utils.toWei("10", "ether") });
            assert.fail("An airline that is not registered should not be able to pay funds.");
        } catch (e) {}
    });

    it("fundAirline: Ensure that a registered airline within sufficient funds has its funded status updated", async () => {
        let registeredAirline = config.firstAirline;

        // Ensure that funding is rejected if the funds are not sufficient.
        try {
            const tx = await config.flightSuretyApp.fundAirline({ from: registeredAirline, value: web3.utils.toWei("10", "ether") });
            truffleAssert.eventEmitted(tx, "AirlineFunded");

            let airline = await config.flightSuretyData.getAirline(registeredAirline);
            assert.equal(airline.funded, true, "The expected airline funded status did not match.");
        } catch (e) {
            console.log(e);
            assert.fail("An airline that is registered within sufficient funds should have its status updated to funded.");
        }
    });

    /****************************************************************************************/
    /* Register Airline                                                                     */
    /****************************************************************************************/

    it("registerAirline: Ensure an unregistered airline cannot register another airline", async () => {
        let unregisteredAirline = accounts[3];

        try {
            await config.flightSuretyApp.registerAirline(accounts[2], { from: unregisteredAirline });
            assert.fail("An airline should not be able to register an airline if it is not registered itself.");
        } catch (e) {
            let noOfAirlines = await config.flightSuretyData.getNumberOfAirlines();
            assert.equal(noOfAirlines, 1, "The airline should not have been registered by an unregistered airline.");
        }
    });

    it("registerAirline: A registered airline can register another founding airline", async () => {
        let registeredAirline = config.firstAirline;

        // Ensure that the first four airlines can be registered without consensus, as long as an already
        // registered airline is making the request.
        for (let step = 2; step <= 4; step++) {
            let newAirline = accounts[step];

            try {
                const tx = await config.flightSuretyApp.registerAirline(newAirline, { from: registeredAirline });
                truffleAssert.eventEmitted(tx, "AirlineRegistered");

                await config.flightSuretyApp.fundAirline({ from: newAirline, value: web3.utils.toWei("10", "ether") });

                let noOfAirlines = await config.flightSuretyData.getNumberOfAirlines();
                assert.equal(noOfAirlines, step, "The airline should have been registered by the registered airline.");
            } catch (e) {
                assert.fail("A registered airline should be able to register another airline.");
            }
        }
    });

    it("registerAirline: Ensure an airline can only be registered once", async () => {
        let registeredAirline = config.firstAirline;

        // Ensure that an airline cannot be registered more than once.
        try {
            const tx = await config.flightSuretyApp.registerAirline(accounts[2], { from: registeredAirline });
            assert.fail("An airline cannot be registered twice.");
        } catch (e) {
            let noOfAirlines = await config.flightSuretyData.getNumberOfAirlines();
            assert.equal(noOfAirlines, 4, "The airline should not have been registered again.");
        }
    });

    it("registerAirline: Ensure multi-party consensus is used for registering an airline once more than 4 airlines are registered", async () => {
        let newAirline = accounts[5];
        let registeredAirline1 = accounts[2];
        let registeredAirline2 = accounts[3];

        // The first registered airline should have its vote counted to register the new airline, but there should not yet be a consensus.
        try {
            const tx = await config.flightSuretyApp.registerAirline(newAirline, { from: registeredAirline1 });

            let noOfAirlines = await config.flightSuretyData.getNumberOfAirlines();
            assert.equal(noOfAirlines, 4, "The airline should not have been registered as there should not yet be a consensus.");
        } catch (e) {
            assert.fail("A registered airline should be able to vote to register another airline.");
        }

        // The second registered airline should have its vote counted to register the new airline, and there should now be a consensus.
        try {
            const tx = await config.flightSuretyApp.registerAirline(newAirline, { from: registeredAirline2 });

            let noOfAirlines = await config.flightSuretyData.getNumberOfAirlines();
            assert.equal(noOfAirlines, 5, "The airline should have been registered as there should now be a consensus.");
        } catch (e) {
            assert.fail("A registered airline should be able to vote to register another airline.");
        }
    });

    /****************************************************************************************/
    /*  Register Flight                                                                     */
    /****************************************************************************************/

    it("registerFlight: Ensure an unregistered airline cannot register a flight", async () => {
        let unregisteredAirline = accounts[7];

        try {
            await config.flightSuretyApp.registerFlight(accounts[2], "XXX2", Date.now(), { from: unregisteredAirline });
            assert.fail("An airline should not be able to register a flight if it is not registered.");
        } catch (e) {
            let noOfFlights = await config.flightSuretyData.getNumberOfFlights();
            assert.equal(noOfFlights, 0, "The flight should not have been registered by an unregistered airline.");
        }
    });

    it("registerFlight: A registered airline can register a new flight", async () => {
        let registeredAirline = config.firstAirline;

        try {
            const tx = await config.flightSuretyApp.registerFlight(accounts[2], "XXX2", Date.now(), { from: registeredAirline });
            truffleAssert.eventEmitted(tx, "FlightRegistered");

            let noOfFlights = await config.flightSuretyData.getNumberOfFlights();
            assert.equal(noOfFlights, 1, "The flight should have been registered.");
        } catch (e) {
            assert.fail("A registered airline should be able to register a flight.");
        }
    });
});
