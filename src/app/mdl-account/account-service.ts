import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { IApiResponse } from "../models/users";
import { IDocumentAccountInfoAgreggate, IGetAllAccountRequestModel, IResultSetImportArchive } from "../models/accounts";
import { map } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class AccountService {

    constructor(private httpclient: HttpClient) {

    }

    public url: string = 'http://localhost:5190/api/v1/Account';

    get(command: IGetAllAccountRequestModel) {
        const params = new HttpParams()
            .set('AccountKey', command.accountKey)
            .set('UserId', command.userId || '');

        return this.httpclient.get<IApiResponse<IDocumentAccountInfoAgreggate[]>>(`${this.url}/GetAll/filter-search`, { params }).pipe(
            map(response => {
                if (!response.success) {
                    console.error('Erros da API:', response.errors);
                }
                return response.data;
            })
        );
    }

    import(formData: FormData, force: boolean = false) {
        return this.httpclient.post<IApiResponse<IResultSetImportArchive>>(`${this.url}/Import/${force}`, formData);
    }

    getByID(command: IGetAllAccountRequestModel) {
        const params = new HttpParams()
            .set('AccountKey', command.accountKey)
            .set('UserId', command.userId || '');

        return this.httpclient.get<IApiResponse<IDocumentAccountInfoAgreggate[]>>(`${this.url}/Get/filter-search`, { params }).pipe(
            map(response => {
                if (!response.success) {
                    console.error('Erros da API:', response.errors);
                }
                return response.data;
            })
        );
    }

    delete(userId: number) {
        return this.httpclient.delete<IApiResponse<any>>(`${this.url}/${userId}`);
    }
}
