import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { IApiResponse } from "../../models/users";
import { IDownloadReportLogRequestModel } from "../../models/accounts";

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private httpclient: HttpClient) {

  }

  public url: string = 'http://localhost:5190/api/v1/ReportLog';

  download(command: IDownloadReportLogRequestModel) {
    const params = new HttpParams().set('MonthKey', command.monthKey || '')

    return this.httpclient.get<IApiResponse<string>>(`${this.url}/filter-report`, { params});
  }
}
