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
                truffleAssert.eventEmitted(tx, "registered");

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

    /*it("(airline) cannot register an Airline using registerAirline() if it is not funded", async () => {
        // ARRANGE
        let newAirline = accounts[2];

        // ACT
        try {
            await config.flightSuretyApp.registerAirline(newAirline, { from: config.firstAirline });
        } catch (e) {}
        let result = await config.flightSuretyData.isAirline.call(newAirline);

        // ASSERT
        assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");
    });*/
});
