import { BooleanOperator, Condition, QueryOrder, QueryParams, ComplexCondition } from "..";

export class SqlBuilder<FilterableField extends string, SortableField extends string> {

    private sql: string;
    private sqlForCount: string;
    private params = [];

    constructor(
        private queryParams: QueryParams<FilterableField, SortableField>,
        private filtersFieldMap: Map<FilterableField, string>,
        private sortFieldMap: Map<SortableField, string>,
        private extraCondition?: { sql: string; params: any[]; }
    ) {
        if (extraCondition) {
            this.params.push(...extraCondition.params);
        }
        this.createSql();
    }

    public getSql(): string {
        return this.sql;
    }

    public getSqlForCount(): string {
        return this.sqlForCount;
    }

    public getParams(): any[] {
        return this.params;
    }

    private createSql(): void {
        let sb = ' ';

        if (this.extraCondition) {
            sb += " where " + this.extraCondition.sql;
            if (this.queryParams.filters && this.queryParams.filters.length > 0) {
                sb += " and " + this.getFiltersSql(<Condition<FilterableField> & ComplexCondition<FilterableField>>{ conditions: this.queryParams.filters, booleanOperator: BooleanOperator.AND });
            }
        } else {
            if (this.queryParams.filters && this.queryParams.filters.length > 0) {
                sb += " where " + this.getFiltersSql(<Condition<FilterableField> & ComplexCondition<FilterableField>>{ conditions: this.queryParams.filters, booleanOperator: BooleanOperator.AND });
            }
        }

        this.sqlForCount = sb.toString() + ';';

        if (this.queryParams.sortStatus && this.queryParams.sortStatus.length > 0) {
            sb += " order by" + this.getOrderBySql(this.queryParams.sortStatus);
        }

        if ((this.queryParams.start || this.queryParams.start === 0) && this.queryParams.end) {
            sb += ` limit ${this.queryParams.end - this.queryParams.start} offset ${this.queryParams.start};`;
        } else {
            sb += `;`;
        }

        this.sql = sb.toString();
    }

    private getOrderBySql(sortStatus: QueryOrder<SortableField>[]): string {
        const sort = sortStatus.map(c => `${this.getSortField(c.field)} ${this.getOrderSql(c.order)}`)
            .reduce((prev, curr) => prev + ", " + curr);

        return ` ${sort}`;
    }

    private getFiltersSql(condition: Condition<FilterableField> & ComplexCondition<FilterableField>): string {
        if (this.isSimpleCondition(condition)) {
            if (condition.operator === 'ILIKE_UNACCENT') {
                this.params.push(condition.value);
                return `unaccent(${this.getFilterField(condition.field)}) ${this.getSqlOperator(condition.operator)} unaccent($${this.params.length})`;
            } else if (condition.operator === 'IS_NULL') {
                return `${this.getFilterField(condition.field)} IS NULL`;
            } else {
                this.params.push(condition.value);
                return `${this.getFilterField(condition.field)} ${this.getSqlOperator(condition.operator)} $${this.params.length}`;
            }
        }

        const opt = condition.conditions
            .map(c => this.getFiltersSql(<any>c))
            .reduce((prev, curr) => prev + " " + condition.booleanOperator + " " + curr + "");

        return `(${opt})`;
    }

    private isSimpleCondition(condition: Condition<FilterableField> & ComplexCondition<FilterableField>): boolean {
        return !!(condition.field && condition.operator);
    }

    private getSortField(field: SortableField): string {
        return this.sortFieldMap.get(field);
    }

    private getFilterField(field: FilterableField): string {
        return this.filtersFieldMap.get(field);
    }

    private getOrderSql(order: string): string {
        return order;
    }

    private getSqlOperator(operator: string): string {
        switch (operator) {
            case "EQUALS": return "=";
            case "GREATER_THAN": return ">";
            case "GREATER_EQUALS_THAN": return ">=";
            case "LESS_THAN": return "<";
            case "LESS_EQUALS_THAN": return "<=";
            case "ILIKE": return "ILIKE";
            case "ILIKE_UNACCENT": return "ILIKE";
            case "LIKE": return "LIKE";
            case "IN": return "IN";
            case "NOT_IN": return "NOT IN";
        }
        return operator;
    }

}