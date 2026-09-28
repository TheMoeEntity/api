/** Resolves to `true` only if A and B are exactly the same type. */
export type Equals<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;

/** Compile error unless T is `true`. */
export type Assert<T extends true> = T;
