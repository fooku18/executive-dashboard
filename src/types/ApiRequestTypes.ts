type Metrics = {
    metrics: Metric[],
}

type Metric = {
    columnId: string,
    id: string
}

export type AdobeApiRequest = {
    rsid: string,
    globalFilters?: {[k: string]: string}[],
    metricContainer: Metrics,
    dimension: string,
}

export type AdobeApiLimitRequest = {
    payload: AdobeApiRequest,
    limit: number
}

export type GscApiRequest = {
    property_uri: string,
    payload: {[k: string]: string},
    fields?: string[]
}

export type UsabillaApiRequest = {
    date_start: string,
    date_end: string,
    language?: string,
    country?: string,
    limit?: number,
}