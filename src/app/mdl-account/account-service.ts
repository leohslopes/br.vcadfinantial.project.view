import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { IApiResponse } from "../models/users";
import { IDocumentAccountInfoAgreggate, IResultSetImportArchive } from "../models/accounts";
import { map } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class AccountService {

    constructor(private httpclient: HttpClient) {

    }

    public url: string = 'http://localhost:5190/api/v1/Account';

    get() {
        return this.httpclient.get<IApiResponse<IDocumentAccountInfoAgreggate[]>>(`${this.url}/Get`).pipe(
            map(response => {
                if (!response.success) {
                    console.error('Erros da API:', response.errors);
                }
                return response.data;
            })
        );
    }

    import(formData: FormData) {
        return this.httpclient.post<IApiResponse<IResultSetImportArchive>>(`${this.url}/Import`, formData);
    }

    getByID(accountKey: number) {
        return this.httpclient.get<IApiResponse<IDocumentAccountInfoAgreggate[]>>(`${this.url}/${accountKey}`).pipe(
            map(response => {
                if (!response.success) {
                    console.error('Erros da API:', response.errors);
                }
                return response.data;
            })
        );
    }
}
