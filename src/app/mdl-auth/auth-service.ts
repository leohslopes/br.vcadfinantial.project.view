import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IApiResponse, ILoginRequestModel, IUserSession } from '../models/users';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private httpclient: HttpClient) {

  }

  public url: string = 'http://localhost:5190/api/v1/User';

  login(command: ILoginRequestModel) {
    return this.httpclient.post<IApiResponse<IUserSession>>(`${this.url}/Login`, command);
  }

  register(formData: FormData) {
    return this.httpclient.post<IApiResponse<any>>(`${this.url}/Register`, formData);
  }


}
