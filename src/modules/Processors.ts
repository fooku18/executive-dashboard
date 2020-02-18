import { AbstractProcessor } from "../abstracts/Processor";
import { AdobeReportResponse, GSCReportResponse, UsabillaReportResponse } from "../interfaces/APIResponses";
import { Row as GSCRow } from "../types/GscTypes";
import { AdobeApiRequest, AdobeApiLimitRequest, GscApiRequest, UsabillaApiRequest } from "../types/ApiRequestTypes";
import { APIRow } from "../interfaces/APIResponses";
import { ChartDataModel, ChartModelRow } from "../types/ChartDataModel";
import { UsabillaProvider } from "./Provider";

export namespace Processors {

    export class AdobeSingle extends AbstractProcessor<AdobeReportResponse, AdobeApiRequest> {
        /**
         * Metric names defined on the Adobe Report API request payload.
         */
        protected metrics: string[];
        /**
         * Length of available columns defined on the response from
         * Adobe Analytics Report API.
         */
        protected datasetLength: number;
        /**
         * Label names of the Adobe Analytics Report API response.
         */
        protected labels: string[];
        /**
         * All available rows of the Adobe Analytics Report API response.
         */
        protected rows: APIRow[];
        /**
         * The Dimension type will decide which method to use to color datasets
         */
        protected dimensionType: string;
        
        preprocess(data: AdobeReportResponse[]) {
            this.metrics = data[0].dimension;
            this.rows = data[0].rows;
            this.datasetLength = this.rows[0].data.length;
            this.dimensionType = data[0].dimensionType;
        }

        formatData(data: AdobeReportResponse[]): ChartDataModel {
            const chartDataModel: ChartDataModel = {
                columns: this.metrics,
                rows: this.rows.map(l => {
                    return {
                        label: l.label,
                        data: l.data
                    }
                }),
                type: data[0].dimensionType
            }
            return chartDataModel;
        }
    }

    export class GscSingle extends AbstractProcessor<GSCReportResponse, GscApiRequest>{
        /**
         * Property uri extracted from the request in the wrapper element.
         */
        protected property_uri: string;
        
        /**
         * Specified fields on the request data attribute provided on the
         * wrapper element. This member can be used to only use these specified
         * fields for the chart creation as the generic response will always
         * respond with all fields: 'clicks', 'impressions', 'ctr', 'position'
         */
        protected fields: string[] = [
            "clicks",
            "ctr",
            "position",
            "impressions"
        ];
        
        protected checkfields(row: GSCRow): string[]{
            return Object.keys(row).filter(l => ~this.fields.indexOf(l));
        }

        preprocess(data: GSCReportResponse[]): void {
            const request = <GscApiRequest>this.providers[0].payload;
            this.property_uri = request.property_uri;
            /**
             * If the fields key is specified in the request provided in the data attribute
             * field, then only these fields will be hand over to the graph.
             */
            if(request.fields)
                this.fields = request.fields;
        }

        formatData(data: GSCReportResponse[]): ChartDataModel {
            let rows = data[0].rows;
            /**
             *  retrieve the number of different metrics. if no keys are specified in the
             *  GSCReportResponse then the result is on property level and all data is aggregated 
             *  on that property
             */ 
            const fields: string[] = this.checkfields(rows[0]);
            const chartLabels: string[] = rows[0].keys ? rows.map(l => l.keys.join(" | ")) : Array(this.property_uri);
            
            /**
             * Sort the output in regards to the first selected field in the request data attribute field.
             * As the GSC API will always return all field values, this guarantees that the data is not
             * sorted in regards to the clicks as it would be otherwise.
             */
            if(rows[0].keys){
                const key: string = this.fields[0];
                rows.sort((a, b) => {
                    return a[key] == b[key] ? 0 : a[key] < b[key] ? 1 : -1;
                })
            }

            /**
             * Row values are generated here. The purpose of this step is to extract only the fields 
             * from each row data object, if the field was specified on the request.
             */
            let chartModelRows: ChartModelRow[] = [];
            for(let i = 0, j = rows.length; i < j; i++){
                const data: number[] = [];
                fields.forEach(l => {
                    data.push(rows[i][l]);
                })
                chartModelRows.push({
                    label: rows[i].keys.join(" | "),
                    data: data
                })
            }

            const chartDataModel: ChartDataModel = {
                columns: fields,
                rows: chartModelRows
            }

            return chartDataModel;
        }
    }

    export class UsabillaSingle extends AbstractProcessor<UsabillaReportResponse, UsabillaApiRequest>{
        private columns: string[] = [];
        private rows: ChartModelRow[] = [];
        
        preprocess(data: UsabillaReportResponse[]): void {
            if(data[0].results.length){
                this.columns = ["date", "comment", "nps", "rating"];
                this.rows = data[0].results.map(l => {
                    return {
                        label: "entry",
                        data: [
                            l.date,
                            l.comment,
                            l.nps,
                            l.rating,
                            l.country,
                            l.language,
                            l.url
                        ]
                    }
                });
            }
        }

        formatData(data: UsabillaReportResponse[]): ChartDataModel{
            return {
                columns: this.columns,
                rows: this.rows
            }
        }
    }

}