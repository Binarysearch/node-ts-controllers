export enum Order {
    ASC = "ASC",
    DESC = "DESC"
}
export interface QueryOrder<SortableField extends string> {
    field: SortableField;
    order: Order;
}
export interface QueryParams<FilterableField extends string, SortableField extends string> {
    start: number;
    end: number;
    sortStatus?: QueryOrder<SortableField>[];
    filters?: (Condition<FilterableField> | ComplexCondition<FilterableField>)[];
}
export enum BooleanOperator {
    AND = "AND",
    OR = "OR"
}
export enum Operator {
    EQUALS = "EQUALS",
    NOT_EQUALS = "NOT_EQUALS",
    IS_NULL = "IS_NULL",
    IS_NOT_NULL = "IS_NOT_NULL",
    GREATER_THAN = "GREATER_THAN",
    GREATER_EQUALS_THAN = "GREATER_EQUALS_THAN",
    LESS_THAN = "LESS_THAN",
    LESS_EQUALS_THAN = "LESS_EQUALS_THAN",
    IN = "IN",
    NOT_IN = "NOT_IN",
    CONTAINS = "CONTAINS",
    LIKE = "LIKE",
    ILIKE = "ILIKE",
    ILIKE_UNACCENT = "ILIKE_UNACCENT",
    JSONB_CONTAINS_ALL = "JSONB_CONTAINS_ALL",
}
export interface ComplexCondition<FilterableField extends string> {
    conditions: (Condition<FilterableField> | ComplexCondition<FilterableField>)[];
    booleanOperator: BooleanOperator;
}
export interface Condition<FilterableField extends string> {
    field: FilterableField;
    value: any;
    operator: Operator;
}
export interface QueryResult<T> {
    total: number;
    data: T[];
}