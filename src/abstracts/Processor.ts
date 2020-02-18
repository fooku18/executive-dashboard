import { IProvider } from "../interfaces/IProvider";
import { IProcessor } from "../interfaces/IProcessor";
import { Options } from "../types/DataOptions";
import { ChartDataModel } from "../types/ChartDataModel";
import { IChart } from "../interfaces/IChart";
import { DatePeriod } from "../types/DatePeriod";

export abstract class AbstractProcessor<T, S> implements IProcessor{
    /**
     * Wrapper element in DOM tree that contains all attribute values to request data
     */
    protected wrapperElement: HTMLElement;
    /**
     * Options extracted from the Data Wrapper Element. Options are specified
     * by data-options.{OPTION_NAME} as an Element Attribute.
     */
    protected options: Options = {};
    /**
     * List of specified data providers for the wrapped chart. Each item in this list
     * contains requested data in their respective data structure.
     */
    protected providers: IProvider<S, T>[];

    /**
     * Chart Model that is specified on the wrapper element data attribute.
     * The generated ChartDataModel will be passed to this instance which 
     * in turn builds the chart.
     */
    protected chart: IChart;

    constructor(wrapperElement: HTMLElement, providers: IProvider<S, T>[], chart: IChart){
        this.wrapperElement = wrapperElement;
        this.providers = providers;
        this.chart = chart;

        /**
         * The following will loop through all data attributes and extract all
         * marked as options. All options will be either parsed as an object
         * or saved as string to the options member of this instance 
         */
        Object.keys(this.wrapperElement.dataset)
            .filter(l => l.match(/^options/))
            .forEach(l => {
                const [type, ...rest] = l.split(".");
                let optionElement: object | string;
                try{
                    optionElement = JSON.parse(this.wrapperElement.dataset[l].replace(/'/g, '"'));
                }catch(e){
                    optionElement = this.wrapperElement.dataset[l];
                }
                this.options[rest.join(".")] = optionElement
            })
    }

    /**
     * This method initiates the Provider get methods and collects all data from the
     * defined Providers on the Wrapper Element
     * @param providers Data Providers defined on the Wrapper Element
     */
    public fetchData(providers: IProvider<S, T>[]): Promise<T[]> {
        const fetchProviders = providers.map(l => 
            l.get()
                .then(value => <T>value)
        );
        return Promise.all(fetchProviders);
    }

    /**
     * The purpose of this function is to preprocess data for common extended classed
     * from this abstract class. This will enable the developer to not repeat 
     * basic data preprocessing steps in similar Processor implementations.
     * @param data Data returned from the providers
     */
    abstract preprocess(data: T[]): void;

    /**
     * This method must be implemented by a Processor. The purpose of this method 
     * is to generate a uniform ChartDataModel from the provided data of
     * the Providers. The output of this method can be injected into
     * Chart Models as they must adhere to this format.
     * @param data Data provided by the Providers
     * @returns Data that can be consumed by Chart Models
     */
    abstract formatData(data: T[]): ChartDataModel;

    /**
     * Public build API. This will start the graph building process.
     * Provider.get() -> preprocess()? -> generateGraph()
     */
    public build(): void {
        this.fetchData(this.providers)
            .then(l => {
                this.preprocess(l);
                const data: ChartDataModel = this.formatData(l);
                this.chart.applyOptions(this.options);
                this.chart.generateChart(data, this.wrapperElement);
            })
            .catch(e => {
                throw e
            });
    }

    public update(datePeriod: DatePeriod): void{
        this.providers.map(l => l.changeDate(datePeriod));
        this.build();
    }
}