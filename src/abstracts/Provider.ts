import { IProvider } from "../interfaces/IProvider";
import { Endpoint } from "../enums/Endpoint";
import { DatePeriod } from "../types/DatePeriod";

export abstract class AbstractProvider<T, S> implements IProvider<T, S>{
    endpoint: Endpoint;
    payload: T;

    constructor(endpoint: Endpoint, payload: T){
        this.endpoint = endpoint;
        this.payload = payload;
    }

    /**
     * This methods purpose is to change the date on the instances payload
     * request. This will then request the data for a different date period.
     * If not provided, the date period will stay the same for all requests.
     */
    abstract changeDate(datePeriod: DatePeriod): void;
    /**
     * This method must be implemented by Providers. The initial payload
     * request can only be specified on the constructor. A special date
     * manipulation method will take care of date changes and updates.
     */
    public get(): Promise<S> {
        return fetch(`${process.env.GRAPH_FETCH_API_ENDPOINT}/${this.endpoint.toString()}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(this.payload)
            })
            .then<S>(
                (value) => value.json() as Promise<S>,
            )
    }
}
