import { ChartDataModel } from "../types/ChartDataModel";
import { Options } from "../types/DataOptions";

export interface IChart{
    /**
     * This methods purpose is to apply Chart Model specific
     * options.
     * @param options Chart Model specific options
     */
    applyOptions(options: Options): void
    /**
     * This methods must generate the specific Chart Model.
     * If no model is created in this method, then no Chart
     * will be displayed.
     * @param data Chart Model Data
     * @param chartElement Chart Element to apply the Model on
     */
    generateChart(data: ChartDataModel, chartElement: HTMLElement): void
}