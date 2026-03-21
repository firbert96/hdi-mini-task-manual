import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { TransactionService } from '../../services/transaction.service';
import { TransactionModel } from '../../models/transaction.model';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import moment from 'moment';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.css',
  providers: [CurrencyPipe],
})
export class TransactionComponent implements OnInit, OnDestroy {
  private readonly txService = inject(TransactionService);
  private readonly currencyPipe = inject(CurrencyPipe);
  private readonly subscription: Subscription[] = [];
  data = signal<TransactionModel[]>([]);
  loading = true;
  columns = [
    { key: 'no',         label: 'No.',         align: 'center' },
    { key: 'memberName', label: 'Member Name', align: 'left' },
    { key: 'city',       label: 'City',        align: 'left' },
    { key: 'category',   label: 'Category',    align: 'left' },
    { key: 'amount',     label: 'Amount',      align: 'left' },
    { key: 'quantity',   label: 'Quantity',    align: 'center' },
    { key: 'date',       label: 'Date',        align: 'center' },
    { key: 'status',     label: 'Status',      align: 'left' },
  ];
  displayedColumns = this.columns.map(c => c.key);
  sortKey: string = '';
  sortDir: 'asc' | 'desc' = 'asc';
  searchName = signal('');
  selectedStatus = signal('');
  filteredData = computed(() =>
    this.data().filter(row =>
      (!this.searchName() || row.memberName.toLowerCase().includes(this.searchName().toLowerCase())) &&
      (!this.selectedStatus() || row.status === this.selectedStatus())
    )
  );


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
          this.data.set(output);
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

  sort(key: string): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDir = 'asc';
    }
    this.data.set([...this.data()].sort((a, b) => {
      const valA = (a as any)[key] ?? '';
      const valB = (b as any)[key] ?? '';
      return valA > valB
        ? (this.sortDir === 'asc' ? 1 : -1)
        : valA < valB
        ? (this.sortDir === 'asc' ? -1 : 1)
        : 0;
    }));
  }


  clearFilters(): void {
    this.searchName.set('');
    this.selectedStatus.set('');
  }


  ngOnDestroy(): void {
    this.subscription.forEach((s) => s.unsubscribe());
  }
}
