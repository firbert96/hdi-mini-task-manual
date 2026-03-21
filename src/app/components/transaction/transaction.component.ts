import { Component, inject } from '@angular/core';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-transaction',
  imports: [],
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.css',
  standalone: true,
})
export class TransactionComponent {
  private readonly purchaseService = inject(TransactionService);
}
