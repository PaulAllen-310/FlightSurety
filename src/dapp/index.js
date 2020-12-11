import DOM from "./dom";
import Contract from "./contract";
import "./flightsurety.css";

(async () => {
    let result = null;

    let contract = new Contract("localhost", () => {
        // Allow the passenger to buy insurance for a flight.
        DOM.elid("submit-buy").addEventListener("click", () => {
            let flight = DOM.elid("flight-number").value;

            // Write transaction
            contract.buyInsurance(flight, (error, result) => {
                display("display-wrapper", "Insurance", "Buy", [{ label: "Insurance Bought", error: error, value: flight }]);
            });
        });

        // Submit a request to the oracles to simulate credit being issued to the passenger.
        DOM.elid("submit-oracle").addEventListener("click", () => {
            let flight = DOM.elid("flight-number").value;
            // Write transaction
            contract.fetchFlightStatus(flight, (error, result) => {
                display("display-wrapper", "Oracles", "Trigger oracles", [{ label: "Fetch Flight Status", error: error, value: result.flight + " " + result.timestamp }]);
            });
        });

        // Submit a request to withdraw the passengers funds.
        DOM.elid("submit-withdrawl").addEventListener("click", () => {
            // Write transaction
            contract.withdraw((error, result) => {
                display("display-wrapper", "Withdraw", "Withdraw", [{ label: "Withdrawn", error: error, value: result.passenger }]);
            });
        });
    });
})();

function display(div, title, description, results) {
    let displayDiv = DOM.elid(div);
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({ className: "row" }));
        row.appendChild(DOM.div({ className: "col-sm-4 field" }, result.label));
        row.appendChild(DOM.div({ className: "col-sm-8 field-value" }, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    });
    displayDiv.append(section);
}
