import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IApiResponse } from '../models/users';

@Injectable({
  providedIn: 'root'
})

export class UserService {

    constructor(private httpclient: HttpClient) {

  }

  public url: string = 'http://localhost:5190/api/v1/User';

  update(id: number, formData: FormData) {
    return this.httpclient.put<IApiResponse<any>>(`${this.url}/${id}`, formData);
  }
}
