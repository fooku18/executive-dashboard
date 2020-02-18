export type ChartModelRow = {
    /**
     * Label for the current chart model row. This is a row in a common
     * 2d data table.
     */
    label: string,
    /**
     * Data for the current data table row. The lenght must match 
     * with the columns array.
     */
    data: (string|number)[]
}

export type ChartDataModel = {
    /**
     * columns / metrics for the chart. This can be used for
     * the labeling the charts.
     */
    columns: string[],
    rows: ChartModelRow[],
    type?: string,
}