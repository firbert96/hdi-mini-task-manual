import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TransactionComponent } from './transaction.component';
import { TransactionService } from '../../services/transaction.service';
import { of } from 'rxjs';
import { TransactionModel } from '../../models/transaction.model';
import { registerLocaleData } from '@angular/common';
import localeId from '@angular/common/locales/id';
import { LOCALE_ID } from '@angular/core';
registerLocaleData(localeId);

const mockData: TransactionModel[] = [
  {
    id: '1',
    memberId: 'm1',
    memberName: 'Alice',
    city: 'Jakarta',
    category: 'Electronics',
    amount: 100000,
    quantity: 2,
    date: '2024-01-01',
    status: 'paid',
    amountStr: '',
    fmtDate: ''
  },
  {
    id: '2',
    memberId: 'm2',
    memberName: 'Bob',
    city: 'Bandung',
    category: 'Food',
    amount: 50000,
    quantity: 1,
    date: '2024-01-02',
    status: 'pending',
    amountStr: '',
    fmtDate: ''
  },
  {
    id: '3',
    memberId: 'm3',
    memberName: 'Alice',
    city: 'Jakarta',
    category: 'Electronics',
    amount: 200000,
    quantity: 3,
    date: '2024-01-03',
    status: 'paid',
    amountStr: '',
    fmtDate: ''
  },
  {
    id: '4',
    memberId: 'm4',
    memberName: 'Carol',
    city: 'Bandung',
    category: 'Food',
    amount: 75000,
    quantity: 1,
    date: '2024-01-04',
    status: 'cancelled',
    amountStr: '',
    fmtDate: ''
  },
  {
    id: '5',
    memberId: 'm5',
    memberName: 'Endo',
    city: 'Nagoya',
    category: 'Food',
    amount: 75000,
    quantity: 1,
    date: '2024-01-05',
    status: 'refunded',
    amountStr: '',
    fmtDate: ''
  },
];

describe('TransactionComponent', () => {
  let component: TransactionComponent;
  let fixture: ComponentFixture<TransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionComponent],
      providers: [
        { provide: LOCALE_ID, useValue: 'id-ID' },
        { provide: TransactionService, useValue: { getList: () => of(mockData) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // --- Filtering ---

  it('should filter by member name (case-insensitive)', () => {
    component.searchName.set('alice');
    expect(component.filteredData().length).toBe(2);
    expect(component.filteredData().every(r => r.memberName === 'Alice'));
  });

  it('should filter by status', () => {
    component.selectedStatus.set('pending');
    expect(component.filteredData().length).toBe(1);
    expect(component.filteredData()[0].memberName).toBe('Bob');
  });

  it('should filter by city', () => {
    component.selectedCity.set('Bandung');
    expect(component.filteredData().length).toBe(2);
  });

  it('should filter by category', () => {
    component.selectedCategory.set('Food');
    expect(component.filteredData().length).toBe(3);
  });
});
