
/**
 * We define the main unit of data that our registers will store,
 * which (for now), is javascript's double precsision floating point
 * "number" primitive.
 */
export type Word = number;

/**
 * A "Buffer" is just an arbitrary array of Word values
 */
export type Buffer = Word[];