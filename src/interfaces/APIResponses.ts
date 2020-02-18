import { Row as GSCRow } from "../types/GscTypes";

export type APIRow = {
    label: string,
    data: number[]
}

export interface ApiResponse{

}

export interface AdobeReportResponse extends ApiResponse{
    dimension: string[],
    rows: APIRow[],
    totalElements: number,
    dimensionType: string,
}

export interface GSCReportResponse extends ApiResponse{
    rows: GSCRow[],
    responseAggregationType?: string
}

type UsabillaEntry = {
    date: string,
    comment: string,
    nps: string,
    rating: string,
    language: string,
    country: string,
    url: string,
}

export interface UsabillaReportResponse extends ApiResponse{
    results: UsabillaEntry[]
}

export interface ErrorResponse{
    error: string
}