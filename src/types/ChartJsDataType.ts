export type Dataset = {
    label: string,
    data: (string|number)[],
    backgroundColor?: string[],
    borderColor?: string[],
    borderWith?: number,
    options?: object,
}

export type Data = {
    labels: string[],
    datasets: Dataset[],
}

export type ChartJsData = {
    type: string,
    data: Data,
}