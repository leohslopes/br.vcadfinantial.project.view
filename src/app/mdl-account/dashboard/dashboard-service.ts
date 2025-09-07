import { HttpClient } from "@angular/common/http";
import { IApiResponse } from "../../models/users";
import { map } from "rxjs";
import { IAccountBalanceCategoryInfoAgreggate, IAccountMinMaxInfoAgreggate } from "../../models/dashboard";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
    constructor(private httpclient: HttpClient) {

    }

    public url: string = 'http://localhost:5190/api/v1/Dashboard';

    getAccounts() {
        return this.httpclient.get<IApiResponse<IAccountMinMaxInfoAgreggate[]>>(`${this.url}/GetAccount`).pipe(
            map(response => {
                if (!response.success) {
                    console.error('Erros da API:', response.errors);
                }
                return response.data;
            })
        );
    }

    getBalances() {
        return this.httpclient.get<IApiResponse<IAccountBalanceCategoryInfoAgreggate[]>>(`${this.url}/GetBalance`).pipe(
            map(response => {
                if (!response.success) {
                    console.error('Erros da API:', response.errors);
                }
                return response.data;
            })
        );
    }
}
