import { IChart } from "./IChart";
import { DatePeriod } from "../types/DatePeriod";

export interface IProcessor{
    update(datePeriod: DatePeriod): void;
    build(): void;
}