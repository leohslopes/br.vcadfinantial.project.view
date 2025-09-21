export interface IDocumentAccountInfoAgreggate {
    mounthKey: string,
    fileName: string,
    officialNumber: string,
    among: number,
    accountKey: number
}

export interface IResultSetImportArchive {
    resultFileContent: string,
    countRows: number
}

export interface IDownloadReportLogRequestModel {
    monthKey: string,
    userId: number
}

export interface IGetAllAccountRequestModel {
    accountKey: number,
    userId: string
}
