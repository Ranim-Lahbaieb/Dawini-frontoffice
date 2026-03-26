import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {

  tableRowData = [
    {
      id: 'U001',
      user: { initials: 'AD', name: 'Admin User', email: 'admin@dawini.com' },
      product: { name: 'Administrator' },
      status: { type: 'Active' }
    },
    {
      id: 'U002',
      user: { initials: 'DR', name: 'Dr Ahmed', email: 'doctor@dawini.com' },
      product: { name: 'Doctor' },
      status: { type: 'Pending' }
    },
    {
      id: 'U003',
      user: { initials: 'PA', name: 'Patient Ali', email: 'patient@dawini.com' },
      product: { name: 'Patient' },
      status: { type: 'Cancel' }
    },
    {
      id: 'U004',
      user: { initials: 'PH', name: 'Pharmacist Sami', email: 'pharmacist@dawini.com' },
      product: { name: 'Pharmacist' },
      status: { type: 'Active' }
    },
    {
      id: 'U005',
      user: { initials: 'NU', name: 'Nurse Mariem', email: 'nurse@dawini.com' },
      product: { name: 'Nurse' },
      status: { type: 'Pending' }
    },
    {
      id: 'U006',
      user: { initials: 'RE', name: 'Reception User', email: 'reception@dawini.com' },
      product: { name: 'Receptionist' },
      status: { type: 'Active' }
    }
  ];

  filteredData: any[] = [];

  selectedRows: string[] = [];
  selectAll = false;

  searchTerm: string = '';

  currentPage: number = 1;
  itemsPerPage: number = 5;

  ngOnInit(): void {
    this.filteredData = [...this.tableRowData];
  }

  handleSelectAll(): void {
    this.selectAll = !this.selectAll;

    if (this.selectAll) {
      this.selectedRows = this.currentItems.map(row => row.id);
    } else {
      this.selectedRows = [];
    }
  }

  handleRowSelect(id: string): void {
    if (this.selectedRows.includes(id)) {
      this.selectedRows = this.selectedRows.filter(x => x !== id);
    } else {
      this.selectedRows.push(id);
    }
  }

  onSearchChange(): void {
    const term = this.searchTerm.toLowerCase().trim();

    this.filteredData = this.tableRowData.filter(row =>
      row.id.toLowerCase().includes(term) ||
      row.user.name.toLowerCase().includes(term) ||
      row.user.email.toLowerCase().includes(term) ||
      row.product.name.toLowerCase().includes(term) ||
      row.status.type.toLowerCase().includes(term)
    );

    this.currentPage = 1;
    this.selectAll = false;
    this.selectedRows = [];
  }

  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.itemsPerPage) || 1;
  }

  get currentItems() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredData.slice(start, start + this.itemsPerPage);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.selectAll = false;
      this.selectedRows = [];
    }
  }

  deleteUser(id: string): void {
    this.tableRowData = this.tableRowData.filter(user => user.id !== id);
    this.filteredData = this.filteredData.filter(user => user.id !== id);
    this.selectedRows = this.selectedRows.filter(rowId => rowId !== id);

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }
}