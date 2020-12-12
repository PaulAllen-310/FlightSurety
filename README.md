# FlightSurety

## Project Details

Truffle v5.1.49 (core: 5.1.49)
Solidity v0.5.16 (solc-js)
Node v14.9.0
Web3.js v1.2.1

## Run Instructions

npm install
ganache-cli -a 40
truffle migrate --reset
truffle test
npm run server
npm run dapp

## Using the DAPP

http://localhost:8000

1. Select a flight.
2. Buy insurance.
3. Simulate a flight delay - Continue until you see a status greater than 10 in the oracle server terminal.
4. Check the credit balance for the passenger, to ensure the flight delay caused credit to be allocated to the passenger.
5. Withdraw the funds.
6. Check the credit balance for the passenger, to ensure the credit balance has been zeroed out.

The transaction audit log will show the result of the transactions being made.
