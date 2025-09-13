import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class OdataUtilityService {
  constructor(private authService: AuthService) {}

  constructQueryString(
    loadOptions: any,
    ignoredColumns: string[],
    customFilter: string | null = null
  ): string {
    let filter = '';

    if (customFilter != null) {
      filter = customFilter;
    }

    let generatedFilter = this.generateFilterString(
      loadOptions.filter,
      ignoredColumns
    );

    if (generatedFilter != null && generatedFilter != '') {
      if (filter == '') {
        filter += generatedFilter;
      } else {
        filter += ' and ' + generatedFilter;
      }
    }

    let orderBy = 'id';
    if (loadOptions.sort) {
      let item = loadOptions.sort[0];

      if (!ignoredColumns.includes(item.selector)) {
        orderBy = `${item.selector} ${item.desc ? 'desc' : 'asc'}`;
      }
    }

    const params: Record<string, any> = {
      $top: loadOptions.take || 10,
      $skip: loadOptions.skip || 0,
      $orderby: orderBy,
      $filter: filter,
    };

    const queryString = Object.keys(params)
      .filter((key) => params[key] !== '' && params[key] !== undefined)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');

    return queryString;
  }

  private generateFilterString(
    filters: any,
    ignoredColumns: string[] = []
  ): string {
    if (!Array.isArray(filters)) {
      return '';
    }

    // Simple condition ["field", "operator", "value"]
    if (typeof filters[0] === 'string' && filters.length === 3) {
      const [selector, operation, value] = filters;

      if (ignoredColumns.includes(selector)) {
        return '';
      }

      return this.convertOperator(operation, selector, value);
    }

    let filterExpressions: string[] = [];
    let orGroup: string[] = []; // To group OR conditions

    for (let i = 0; i < filters.length; i++) {
      const filter = filters[i];

      if (Array.isArray(filter)) {
        const [selector, operation, value] = filter;

        // Skip ignored columns
        if (ignoredColumns.includes(selector)) {
          continue;
        }

        const condition = this.generateFilterString(filter, ignoredColumns);

        if (condition) {
          // If the previous operator was OR, add to the OR group
          if (i > 0 && filters[i - 1] === 'or') {
            orGroup.push(condition);
          } else {
            // If there's an existing OR group, wrap it in parentheses and add to filterExpressions
            if (orGroup.length > 0) {
              filterExpressions.push(`(${orGroup.join(' OR ')})`);
              orGroup = []; // Reset the OR group
            }
            filterExpressions.push(condition);
          }
        }
      } else if (
        filter.toLowerCase() === 'and' ||
        filter.toLowerCase() === 'or'
      ) {
        // Handle AND/OR operators
        if (filterExpressions.length > 0 && i !== filters.length - 1) {
          // If the operator is OR, continue adding to the OR group
          if (filter.toLowerCase() === 'or') {
            orGroup.push(filterExpressions.pop()!); // Move the last condition to the OR group
          } else {
            // If there's an existing OR group, wrap it in parentheses and add to filterExpressions
            if (orGroup.length > 0) {
              filterExpressions.push(`(${orGroup.join(' OR ')})`);
              orGroup = []; // Reset the OR group
            }
            filterExpressions.push(filter.toUpperCase());
          }
        }
      }
    }

    // If there's an OR group left, wrap it in parentheses and add to filterExpressions
    if (orGroup.length > 0) {
      filterExpressions.push(`(${orGroup.join(' OR ')})`);
    }

    return filterExpressions.join(' ');
  }

  private convertOperator(
    operator: string,
    selector: string,
    value: any
  ): string {
    // Check if the value is a valid date
    const isDate = this.isValidDate(value);

    if (isDate) {
      // Convert date to ISO 8601 format (OData v4 expects this format)
      const dateValue = new Date(value).toISOString();
      return `${selector} ${this.getOperator(operator)} ${dateValue}`;
    }

    // Handle string and numeric filters
    const op = this.getOperator(operator);

    if (['contains', 'notcontains', 'startswith', 'endswith'].includes(op)) {
      return `${op}(${selector}, '${value}')`;
    }

    return `${selector} ${op} '${value}'`;
  }

  private getOperator(operator: string): string {
    const operatorMap: { [key: string]: string } = {
      contains: 'contains',
      notcontains: 'not contains',
      startswith: 'startswith',
      endswith: 'endswith',
      equals: 'eq',
      '=': 'eq',
      doesnotequal: 'ne',
      '<>': 'ne',
      '<': 'lt',
      '>': 'gt',
      '<=': 'le',
      '>=': 'ge',
    };

    return (
      operatorMap[operator.toLowerCase()] ??
      (() => {
        throw new Error(`Unsupported operator: ${operator}`);
      })()
    );
  }

  private isValidDate(value: any): boolean {
    if (typeof value !== 'string') {
      return false; // Only strings can be dates
    }

    // Reject numeric strings (e.g., "123")
    if (/^\d+$/.test(value)) {
      return false;
    }

    // Try parsing the string as a date
    const date = new Date(value);
    return !isNaN(date.getTime()); // Check if the date is valid
  }
}
