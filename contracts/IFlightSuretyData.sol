// SPDX-License-Identifier: MIT
pragma solidity ^0.5.15;

interface IFlightSuretyData {
    /********************************************************************************************/
    /*                                      AIRLINE FUNCTIONS                                   */
    /********************************************************************************************/

    function registerAirline(address _airline) external returns (address);

    function getAirline(address _airline)
        external
        view
        returns (
            uint256 id,
            address account,
            bool registered,
            bool funded
        );

    function updateAirlineToFunded(address _airline) external;

    function getNumberOfFundedAirlines() external view returns (uint256);

    /********************************************************************************************/
    /*                                       FLIGHT FUNCTIONS                                   */
    /********************************************************************************************/

    function registerFlight(
        address _airline,
        string calldata _flight,
        uint256 _timestamp
    ) external returns (bytes32);

    function getFlight(
        address _airline,
        string calldata _flight,
        uint256 _timestamp
    )
        external
        view
        returns (
            uint256 id,
            string memory code,
            bool registered,
            uint8 statusCode,
            uint256 timestamp,
            address airline
        );

    /********************************************************************************************/
    /*                                     INSURANCE FUNCTIONS                                  */
    /********************************************************************************************/

    function buy(
        address _airline,
        string calldata _flight,
        uint256 _timestamp,
        address _passenger,
        uint256 _amount
    ) external;

    function creditInsurees() external;

    function pay() external;

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    function isOperational() external view returns (bool);

    function authorizeCaller(address _contractAddress) external;

    function deauthorizeCaller(address _contractAddress) external;
}
