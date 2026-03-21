import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
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
    {
      key: 'no',
      label: 'No.',
      align: 'center'
    },
    {
      key: 'memberName',
      label: 'Member Name',
      align: 'left'
    },
    {
      key: 'city',
      label: 'City',
      align: 'left'
    },
    {
      key: 'category',
      label: 'Category',
      align: 'left'
    },
    {
      key: 'amountStr',
      abel: 'Amount',
      align: 'left'
    },
    {
      key: 'quantity',
      label: 'Quantity',
      align: 'center'
    },
    {
      key: 'fmtDate',
      label: 'Date',
      align: 'center'
    },
    {
      key: 'status',
      label: 'Status',
      align: 'left'
    },
  ];
  displayedColumns = this.columns.map(c => c.key);
  sortKey: string = '';
  sortDir: 'asc' | 'desc' = 'asc';
  cities = computed(() => [...new Set(this.data().map(r => r.city))].sort());
  categories = computed(() => [...new Set(this.data().map(r => r.category))].sort());
  // replace existing pagePerItems
  pageSizeOptions = [5, 10, 15];
  pageSize = signal(5);
  currentPage = signal(1);
  skeletonRows = Array(5);
  totalPages = computed(() => Math.ceil(this.filteredData().length / this.pageSize()));
  paginatedData = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredData().slice(start, start + this.pageSize());
  });
  searchName = signal('');
  selectedStatus = signal('');
  selectedCity = signal('');
  selectedCategory = signal('');
  filteredData = computed(() =>
    this.data().filter(row =>
      (!this.searchName() || row.memberName.toLowerCase().includes(this.searchName().toLowerCase())) &&
      (!this.selectedStatus() || row.status === this.selectedStatus()) &&
      (!this.selectedCity() || row.city === this.selectedCity()) &&
      (!this.selectedCategory() || row.category === this.selectedCategory())
    )
  );
  summaryTotalTx = '';
  summaryTotalAmtTxPaid = '';
  summaryTotalQtyTxPaid = '';
  summaryTopCategoryPaid = '';

  constructor() {
    effect(() => {
      this.searchName();
      this.selectedStatus();
      this.selectedCity();
      this.selectedCategory();
      this.pageSize();
      this.currentPage.set(1);
      this.summary();
    });
  }

  get pageEnd(): number {
    return Math.min(this.currentPage() * this.pageSize(), this.filteredData().length);
  }

  ngOnInit(): void {
    this.getList();
  }

  getList(): void {
    this.subscription.push(
      this.txService.getList().subscribe({
        next: (data: TransactionModel[]) => {
          const output: TransactionModel[] = data.map((item) => ({
            ...item,
            fmtDate: moment(item.date).format('D MMMM YYYY'),
            amountStr: String(this.currencyPipe.transform(item.amount, 'IDR', 'symbol', '1.0-0', 'id-ID')),
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
    this.selectedCity.set('');
    this.selectedCategory.set('');
    this.summary();
  }

  summary(): void {
    this.summaryTotalTx = String(this.filteredData().length);
    const paidTx: TransactionModel[] = this.filteredData().filter(tx => tx.status === 'paid');
    let totalAmtTxPaid = 0;
    let totalQtyTxPaid = 0;
    let categoryCount: { [category: string]: number } = {};
    paidTx.forEach((item: TransactionModel) => {
      totalAmtTxPaid += item.amount as number;
      totalQtyTxPaid += item.quantity;
      categoryCount[item.category] = (categoryCount[item.category] ?? 0) + 1;
    });
    this.summaryTotalAmtTxPaid = String(this.currencyPipe.transform(totalAmtTxPaid, 'IDR', 'symbol', '1.0-0', 'id-ID')),
    this.summaryTotalQtyTxPaid = String(totalQtyTxPaid);
    this.summaryTopCategoryPaid = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      [0]?.[0] ?? '-';
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  ngOnDestroy(): void {
    this.subscription.forEach((s) => s.unsubscribe());
  }
}
