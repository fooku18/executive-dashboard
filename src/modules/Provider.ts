import { AbstractProvider } from "../abstracts/Provider";
import { AdobeApiRequest, AdobeApiLimitRequest, GscApiRequest, UsabillaApiRequest } from "../types/ApiRequestTypes";
import { AdobeReportResponse, GSCReportResponse, UsabillaReportResponse } from "../interfaces/APIResponses";
import { DatePeriod } from "../types/DatePeriod";

export class AdobeProvider extends AbstractProvider<AdobeApiRequest|AdobeApiLimitRequest, AdobeReportResponse>{
    private prependZeros(num: number){
        if(num < 10)
            return `0${num}`
        return num.toString();
    }

    changeDate(datePeriod: DatePeriod): void {
        ((<AdobeApiRequest>this.payload).globalFilters||(<AdobeApiLimitRequest>this.payload).payload.globalFilters).forEach(l => {
            if(l.type == "dateRange"){
                let start = datePeriod.startDate;
                let startString = `${this.prependZeros(datePeriod.startDate.getFullYear())}-${this.prependZeros(datePeriod.startDate.getMonth()+1)}-${this.prependZeros(datePeriod.startDate.getDate())}`;
                startString = `${startString}T00:00:00.000`;
                let end = datePeriod.endDate.toISOString();
                let endString = `${this.prependZeros(datePeriod.endDate.getFullYear())}-${this.prependZeros(datePeriod.endDate.getMonth()+1)}-${this.prependZeros(datePeriod.endDate.getDate())}`;
                endString = `${endString}T23:59:59.999`;
                l.dateRange = `${startString}/${endString}`;
            }
        })
    }
}

export class GscProvider extends AbstractProvider<GscApiRequest, GSCReportResponse>{
    private prependZeros(num: number){
        if(num < 10)
            return `0${num}`
        return num.toString();
    }

    changeDate(datePeriod: DatePeriod): void {
        this.payload.payload.startDate = `${this.prependZeros(datePeriod.startDate.getFullYear())}-${this.prependZeros(datePeriod.startDate.getMonth()+1)}-${this.prependZeros(datePeriod.startDate.getDate())}`;
        this.payload.payload.endDate = `${this.prependZeros(datePeriod.endDate.getFullYear())}-${this.prependZeros(datePeriod.endDate.getMonth()+1)}-${this.prependZeros(datePeriod.endDate.getDate())}`;
    }
}

export class UsabillaProvider extends AbstractProvider<UsabillaApiRequest, UsabillaReportResponse>{
    private prependZeros(num: number){
        if(num < 10)
            return `0${num}`
        return num.toString();
    }

    changeDate(datePeriod: DatePeriod): void {
        this.payload.date_start = `${this.prependZeros(datePeriod.startDate.getFullYear())}-${this.prependZeros(datePeriod.startDate.getMonth()+1)}-${this.prependZeros(datePeriod.startDate.getDate())}`;
        this.payload.date_end = `${this.prependZeros(datePeriod.endDate.getFullYear())}-${this.prependZeros(datePeriod.endDate.getMonth()+1)}-${this.prependZeros(datePeriod.endDate.getDate())}`;
    }
}