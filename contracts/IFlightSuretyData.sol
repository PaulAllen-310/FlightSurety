// SPDX-License-Identifier: MIT
pragma solidity ^0.4.25;

interface IFlightSuretyData {
    function registerAirline(address _account) external returns (address);

    function getNumberOfAirlines() external view returns (uint256);

    function getAirline(address _account)
        external
        view
        returns (
            uint256 id,
            address account,
            bool registered
        );

    function buy() external payable;

    function creditInsurees() external;

    function pay() external;

    function isOperational() external view returns (bool);

    function authorizeCaller(address _contractAddress) external;

    function deauthorizeCaller(address _contractAddress) external;
}
