import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { DxButtonModule } from 'devextreme-angular';
import { LanguageService } from '../../services/language.service';
import { Utilities } from '../../utils/utilities.service';

@Component({
  selector: 'paginator',
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.scss',
  standalone: true,
  imports: [DxButtonModule, CommonModule],
})
export class PaginatorComponent implements OnChanges {
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 1;
  @Input() totalCount: number = 0;
  @Input() maxPagesToShow: number = 5;

  @Output() pageChange = new EventEmitter<number>(); // Emits the new page number

  totalNbPages: number = 0;
  constructor(
    private languageService: LanguageService,
    private utilities: Utilities
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.totalCount != 0) {
      this.totalNbPages = Math.ceil(this.totalCount / this.pageSize);
    }
    else{
      this.totalNbPages = 0;
    }
  }

  // Generate an array of page numbers to display
  get pages(): number[] {
    const pages = [];
    for (let i = 1; i <= this.pageSize; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Function to calculate the range of pages to show
  getPagesToShow(): number[] {
    const pages: number[] = [];
    let startPage: number;
    let endPage: number;

    if (this.totalNbPages == 0) {
      return [];
    }

    if (this.totalNbPages <= this.maxPagesToShow) {
      startPage = 1;
      endPage = this.totalNbPages;
    } else {
      // Calculate start and end pages based on current page
      const halfMaxPages = Math.floor(this.maxPagesToShow / 2);

      if (this.currentPage <= halfMaxPages) {
        // If current page is near the start
        startPage = 1;
        endPage = this.maxPagesToShow;
      } else if (this.currentPage + halfMaxPages >= this.totalNbPages) {
        // If current page is near the end
        startPage = this.totalNbPages - this.maxPagesToShow + 1;
        endPage = this.totalNbPages;
      } else {
        // If current page is in the middle
        startPage = this.currentPage - halfMaxPages;
        endPage = this.currentPage + halfMaxPages;
      }
    }

    // Generate the array of pages to show
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  // Function to navigate to a specific page
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalNbPages) {
      this.currentPage = page;
      this.pageChange.emit(this.currentPage);
    }
  }

  // Function to navigate to the previous page
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.pageChange.emit(this.currentPage);
    }
  }

  // Function to navigate to the next page
  nextPage(): void {
    if (this.currentPage < this.totalNbPages) {
      this.currentPage++;
      this.pageChange.emit(this.currentPage);
    }
  }

  formatNumber(page: number) {
    let currentLang = this.languageService.getCurrentLanguage();
    if (currentLang == 'ar') {
      return this.utilities.toArabicNumerals(page);
    }

    return page;
  }
}
