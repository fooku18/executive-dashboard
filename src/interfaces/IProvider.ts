import { Endpoint } from "../enums/Endpoint";
import { DatePeriod } from "../types/DatePeriod";

export interface IProvider<T, S> {
    endpoint: Endpoint,
    payload: T,
    get(): Promise<S>,
    changeDate(datePeriod: DatePeriod): void,
}