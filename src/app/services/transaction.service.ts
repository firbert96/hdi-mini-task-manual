import { Injectable } from '@angular/core';
import { TransactionModel } from '../models/transaction.model';
import { Observable, of } from 'rxjs';
import rawData from '../../../public/dataset.json';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  getList(): Observable<TransactionModel[]> {
    return of(rawData as TransactionModel[]);
  }
}
