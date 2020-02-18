type Data = {
    labels: string[],
    subLabels: string[],
    colors: string[][],
    values: number[][]
}

export type FunnelGraphJsOptions = {
    container: string,
    direction?: string,
    gradientDirection?: string,
    displayPercent?: boolean,
    data: Data,
    width?: number,
    height?: number,
    subLabelValue?: string,
}