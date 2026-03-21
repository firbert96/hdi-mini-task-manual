import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { TransactionService } from '../../services/transaction.service';
import { TransactionModel } from '../../models/transaction.model';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import moment from 'moment';
import { CommonModule, CurrencyPipe } from '@angular/common';
@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [MatTableModule, CommonModule],
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.css',
  providers: [CurrencyPipe],
})
export class TransactionComponent implements OnInit, OnDestroy {
  private readonly txService = inject(TransactionService);
  private readonly currencyPipe = inject(CurrencyPipe);
  private readonly subscription: Subscription[] = [];
  dataSource = new MatTableDataSource<TransactionModel>();
  loading = true;
  columns = [
    { key: 'memberName', label: 'Member Name', align: 'left' },
    { key: 'city',       label: 'City',        align: 'left' },
    { key: 'category',   label: 'Category',    align: 'left' },
    { key: 'amount',     label: 'Amount',      align: 'left' },
    { key: 'quantity',   label: 'Quantity',    align: 'center' },
    { key: 'date',       label: 'Date',        align: 'center' },
    { key: 'status',     label: 'Status',      align: 'left' },
  ];

  displayedColumns = this.columns.map(c => c.key);

  ngOnInit(): void {
    this.getList();
  }

  getList(): void {
    this.subscription.push(
      this.txService.getList().subscribe({
        next: (data: TransactionModel[]) => {
          const output: TransactionModel[] = data.map((item) => ({
            ...item,
            date: moment(item.date).format('D MMMM YYYY'),
            amount: this.currencyPipe.transform(item.amount, 'IDR', 'symbol', '1.0-0', 'id-ID') as any,
          }));
          this.dataSource.data = output;
        },
        error: (err: HttpErrorResponse) => {
          console.error(err);
        },
        complete: () => {
          this.loading = false;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.forEach((s) => s.unsubscribe());
  }
}
