// SPDX-License-Identifier: MIT
pragma solidity ^0.4.25;

interface IFlightSuretyData {
    function registerAirline(address _airline) external returns (address);

    function getNumberOfAirlines() external view returns (uint256);

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

    function buy() external payable;

    function creditInsurees() external;

    function pay() external;

    function isOperational() external view returns (bool);

    function authorizeCaller(address _contractAddress) external;

    function deauthorizeCaller(address _contractAddress) external;
}
