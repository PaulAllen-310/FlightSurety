import DOM from "./dom";
import Contract from "./contract";
import "./flightsurety.css";

(async () => {
    let result = null;

    let contract = new Contract("localhost", () => {
        DOM.elid("submit-airline").addEventListener("click", () => {
            let airline = DOM.elid("airline").value;
            let funds = DOM.elid("funds").value;

            contract.registerAndFundAirline(airline, funds, (error, result) => {
                //display("Airlines", "Trigger Airline", [{ label: "Register Airline", error: error, value: result.airline }]);
            });
        });

        // User-submitted transaction
        DOM.elid("submit-oracle").addEventListener("click", () => {
            let flight = DOM.elid("flight-number").value;
            // Write transaction
            contract.fetchFlightStatus(flight, (error, result) => {
                display("Oracles", "Trigger oracles", [{ label: "Fetch Flight Status", error: error, value: result.flight + " " + result.timestamp }]);
            });
        });
    });
})();

function display(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper");
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
