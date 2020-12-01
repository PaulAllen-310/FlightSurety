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

    it("registerAirline: Only a registered airline can register another airline", async () => {
        let unregisteredAirline = accounts[3];
        let newAirline = accounts[2];

        try {
            await config.flightSuretyApp.registerAirline(newAirline, { from: unregisteredAirline });
            assert.fail("An airline should not be able to register an airline if it is not registered itself.");
        } catch (e) {}

        try {
            const tx = await config.flightSuretyApp.registerAirline(newAirline, { from: config.firstAirline });
            truffleAssert.eventEmitted(tx, "registered");
        } catch (e) {
            assert.fail("A registered airline should be able to register another airline.");
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
