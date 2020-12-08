// SPDX-License-Identifier: MIT
pragma solidity ^0.5.15;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./IFlightSuretyData.sol";

contract FlightSuretyData is IFlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                     CONTRACT VARIABLES                                   */
    /********************************************************************************************/

    address private contractOwner; // Account used to deploy contract
    bool private operational = true; // Blocks all state changes throughout the contract if false
    mapping(address => uint256) private authorizedContracts;

    /********************************************************************************************/
    /*                                      AIRLINE VARIABLES                                   */
    /********************************************************************************************/

    struct Airline {
        uint256 id;
        address account;
        bool registered;
        bool funded;
    }

    mapping(address => Airline) private airlines;
    uint256 private numberOfAirlines;
    uint256 private numberOfFundedAirlines;

    /********************************************************************************************/
    /*                                       FLIGHT VARIABLES                                   */
    /********************************************************************************************/

    // Flight variables
    struct Flight {
        string code;
        bool isRegistered;
        uint8 statusCode;
        uint256 updatedTimestamp;
        address airline;
    }
    mapping(bytes32 => Flight) private flights;

    /********************************************************************************************/
    /*                                     INSURANCE VARIABLES                                  */
    /********************************************************************************************/

    /*struct Insurance {
        
    }*/

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/

    /**
     * @dev Constructor
     *      The deploying account becomes contractOwner
     */
    constructor(address _firstAirline) public {
        contractOwner = msg.sender;

        // Ensure that the contract owner is authorised to access the contract.
        authorizeCaller(contractOwner);

        // Ensure that the first airline is registered and funded on initialisation.
        registerAirline(_firstAirline);
        updateAirlineToFunded(_firstAirline);
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
     * @dev Modifier that requires the "operational" boolean variable to be "true"
     *      This is used on all state changing functions to pause the contract in
     *      the event there is an issue that needs to be fixed
     */
    modifier requireIsOperational() {
        require(operational, "Contract is currently not operational");
        _; // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
     * @dev Modifier that requires the "ContractOwner" account to be the function caller
     */
    modifier requireContractOwner() {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier requireIsCallerAuthorized() {
        require(
            authorizedContracts[msg.sender] == 1,
            "Caller is not authorised"
        );
        _;
    }

    modifier requireUniqueAirline(address _airline) {
        require(
            airlines[_airline].registered == false,
            "An airline can only be registered once."
        );
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
     * @dev Get operating status of contract
     *
     * @return A bool that is the current operating status
     */

    function isOperational() external view returns (bool) {
        return operational;
    }

    /**
     * @dev Sets contract operations on/off
     *
     * When operational mode is disabled, all write transactions except for this one will fail
     */

    function setOperatingStatus(bool mode) external requireContractOwner {
        operational = mode;
    }

    function authorizeCaller(address _contractAddress)
        public
        requireContractOwner
    {
        authorizedContracts[_contractAddress] = 1;
    }

    function deauthorizeCaller(address _contractAddress)
        external
        requireContractOwner
    {
        // Ensure that the contract owner is always authorised to access the data contract.
        // Be graceful, if the contract owner does try to deauthorise themselves.
        if (contractOwner == _contractAddress) {
            return;
        }

        delete authorizedContracts[_contractAddress];
    }

    /********************************************************************************************/
    /*                                      AIRLINE FUNCTIONS                                   */
    /********************************************************************************************/

    /**
     * @dev Add an airline to the registration queue
     *      Can only be called from FlightSuretyApp contract
     *
     */
    function registerAirline(address _airline)
        public
        requireIsOperational
        requireIsCallerAuthorized
        requireUniqueAirline(_airline)
        returns (address)
    {
        // Add the airline and increment the number of airlines counter to reflect a new airline has been registered.
        numberOfAirlines = numberOfAirlines.add(1);
        airlines[_airline].id = numberOfAirlines;
        airlines[_airline].account = _airline;

        // Uniqueness modifier relies on this property being explicity set.
        airlines[_airline].registered = true;

        return _airline;
    }

    function getNumberOfAirlines()
        external
        view
        requireIsOperational
        requireIsCallerAuthorized
        returns (uint256)
    {
        return numberOfAirlines;
    }

    function getAirline(address _airline)
        external
        view
        requireIsOperational
        requireIsCallerAuthorized
        returns (
            uint256 id,
            address account,
            bool registered,
            bool funded
        )
    {
        id = airlines[_airline].id;
        account = airlines[_airline].account;
        registered = airlines[_airline].registered;
        funded = airlines[_airline].funded;

        return (id, account, registered, funded);
    }

    function updateAirlineToFunded(address _airline)
        public
        requireIsOperational
        requireIsCallerAuthorized
    {
        // If the airline hasn't previously provided funding then increment the funded tally.
        if (airlines[_airline].funded == false) {
            numberOfFundedAirlines = numberOfFundedAirlines.add(1);
        }

        airlines[_airline].funded = true;
    }

    function getNumberOfFundedAirlines()
        external
        view
        requireIsOperational
        requireIsCallerAuthorized
        returns (uint256)
    {
        return numberOfFundedAirlines;
    }

    /********************************************************************************************/
    /*                                       FLIGHT FUNCTIONS                                   */
    /********************************************************************************************/

    function getFlightKey(
        address airline,
        string memory flight,
        uint256 timestamp
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /********************************************************************************************/
    /*                                     INSURANCE FUNCTIONS                                  */
    /********************************************************************************************/

    /**
     * @dev Buy insurance for a flight
     *
     */
    function buy()
        external
        payable
        requireIsOperational
        requireIsCallerAuthorized
    {}

    /**
     *  @dev Credits payouts to insurees
     */
    function creditInsurees()
        external
        requireIsOperational
        requireIsCallerAuthorized
    {}

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
     */
    function pay() external requireIsOperational requireIsCallerAuthorized {}

    /**
     * @dev Initial funding for the insurance. Unless there are too many delayed flights
     *      resulting in insurance payouts, the contract should be self-sustaining
     *
     */
    function fund() public payable requireIsOperational {}

    /********************************************************************************************/
    /*                                      FALLBACK FUNCTIONS                                  */
    /********************************************************************************************/

    /**
     * @dev Fallback function for funding smart contract.
     *
     */
    function() external payable {
        fund();
    }
}
