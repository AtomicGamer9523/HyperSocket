/**
 * The Typescript representation of SafeScript's `Result` enum.
 * It is similar to Rust's `Result` enum.
 * 
 * It has two variants, `Ok` and `Err`.
 * 
 * `Ok` is used to represent a successful value, and `Err` is used to represent an error.
*/
export interface Result<T, E> {
    /**
     * Returns true if the result is Ok.
     * @returns {boolean} true if the result is Ok
    */
    isOk(): boolean;
    /**
     * Returns true if the result is Err.
     * @returns {boolean} true if the result is Err
    */
    isErr(): boolean;
    /**
     * Converts from Result<T, E> to Option<T> and discarding the error, if any.
     * @returns {Option<T>} the option containing Some if the result is Ok, otherwise None
    */
    ok(): Option<T>;
    /**
     * Converts from Result<T, E> to Option<E> and discarding the success value, if any.
     * @returns {Option<E>} the option containing Some if the result is Err, otherwise None
    */
    err(): Option<E>;
    /**
     * Maps a Result<T, E> to Result<U, E> by applying a function to a contained Ok value, leaving an Err value untouched.
     *
     * This function can be used to compose the results of two functions.
     * @param {(t: T) => U} op the function to apply to the contained Ok value
     * @returns {Result<U, E>} the result of the function
     * @template U the type of the successful value
    */
    map<U>(op: (t: T) => U): Result<U, E>;
    /**
     * Maps a Result<T, E> to U by applying a function to a contained Ok value, or a fallback function to a contained Err value.
     *
     * This function can be used to unpack a successful result while handling an error.
     * @param {(e: E) => U} fallback the function to apply to the contained Err value
     * @param {(t: T) => U} map the function to apply to the contained Ok value
     * @returns {U} the result of the function
     * @template U the type of the successful value
    */
    mapOrElse<U>(fallback: (e: E) => U, map: (t: T) => U): U;
    /**
     * Maps a Result<T, E> to Result<T, F> by applying a function to a contained Err value, leaving an Ok value untouched.
     *
     * This function can be used to pass through a successful result while handling an error.
     * @param {(e: E) => F} op the function to apply to the contained Err value
     * @returns {Result<T, F>} the result of the function
     * @template F the type of the error value
    */
    mapErr<F>(op: (e: E) => F): Result<T, F>;
    /**
     * Returns res if the result is Ok, otherwise returns the Err value of self.
     * @param {Result<T, E>} res the result to return if self is Ok
     * @returns {Result<T, E>} the result
     * @template U the type of the successful value
    */
    and<U>(res: Result<U, E>): Result<U, E>;
    /**
     * Calls op if the result is Ok, otherwise returns the Err value of self.
     *
     * This function can be used for control flow based on Result values.
     * @param {(t: T) => Result<U, E>} op the function to call if the result is Ok
     * @returns {Result<U, E>} the result of the function
     * @template U the type of the successful value
    */
    andThen<U>(op: (t: T) => Result<U, E>): Result<U, E>;
    /**
     * Returns res if the result is Err, otherwise returns the Ok value of self.
     * @param {Result<T, F>} res the result to return if self is Err
     * @returns {Result<T, F>} the result
     * @template F the type of the error value
    */
    or<F>(res: Result<T, F>): Result<T, F>;
    /**
     * Calls op if the result is Err, otherwise returns the Ok value of self.
     *
     * This function can be used for control flow based on result values.
     * @param {(e: E) => Result<T, F>} op the function to call if the result is Err
     * @returns {Result<T, F>} the result of the function
     * @template F the type of the error value
    */
    orElse<F>(op: (e: E) => Result<T, F>): Result<T, F>;
    /**
     * Unwraps a result, yielding the content of an Ok. Else, it returns optb.
     * @param {T} optb the value to return if the result is Err
     * @returns {T} the value
    */
    unwrapOr(optb: T): T;
    /**
     * Unwraps a result, yielding the content of an Ok. If the value is an Err then it calls op with its value.
     * @param {(e: E) => T} op the function to call if the result is Err
     * @returns {T} the value
    */
    unwrapOrElse(op: (e: E) => T): T;
    /**
     * Unwraps a result, yielding the content of an Ok.
     *
     * Throws Error if the value is an Err, with a error message provided by the Err's value.
     * @returns {T | never} the value
    */
    unwrap(): T | never;
    /**
     * Unwraps a result, yielding the content of an Ok.
     *
     * Throws Error if the value is an Err, with the error message being the passed message.
     * @param {string} msg the message to use
     * @returns {T | never} the value
    */
    expect(msg: string): T | never;
    /**
     * Unwraps a result, yielding the content of an Err.
     *
     * Throws Error if the value is an Ok.
     * @returns {E | never} the value
    */
    unwrapErr(): E | never;
    /**
     * Unwraps a result, yielding the content of an Err.
     *
     * Throws Error if the value is an Ok, with the error message being the passed message.
     * @param {string} msg the message to use
     * @returns {E | never} the value
    */
    expectErr(msg: string): E | never;
    /**
     * shortcut of unwrap, throws the error if Result is Err
     * @returns {T | never} the value
    */
    get $(): T | never;
}
export namespace Result {
    class ResultImpl<T, E> implements Result<T, E> {
        constructor(private value?: T, private error?: E) { }
        isOk(): boolean {
            return this.value !== undefined;
        }
        isErr(): boolean {
            return this.error !== undefined;
        }
        ok(): Option<T> {
            return Option.Some(this.value);
        }
        err(): Option<E> {
            return Option.Some(this.error);
        }
        map<U>(op: (t: T) => U): Result<U, E> {
            return this.value !== undefined ? Result.Ok(op(this.value!)) : Result.Err(this.error!);
        }
        mapOrElse<U>(fallback: (e: E) => U, map: (t: T) => U): U {
            return this.value !== undefined ? map(this.value!) : fallback(this.error!);
        }
        mapErr<F>(op: (e: E) => F): Result<T, F> {
            return this.value !== undefined ? Result.Ok(this.value!) : Result.Err(op(this.error!));
        }
        and<U>(res: Result<U, E>): Result<U, E> {
            return this.value !== undefined ? res : Result.Err(this.error!);
        }
        andThen<U>(op: (t: T) => Result<U, E>): Result<U, E> {
            return this.value !== undefined ? op(this.value!) : Result.Err(this.error!);
        }
        or<F>(res: Result<T, F>): Result<T, F> {
            return this.value !== undefined ? Result.Ok(this.value!) : res;
        }
        orElse<F>(op: (e: E) => Result<T, F>): Result<T, F> {
            return this.value !== undefined ? Result.Ok(this.value!) : op(this.error!);
        }
        unwrapOr(optb: T): T {
            return this.value !== undefined ? this.value : optb;
        }
        unwrapOrElse(op: (e: E) => T): T {
            return this.value !== undefined ? this.value : op(this.error!);
        }
        unwrap(): T {
            if (this.value !== undefined) return this.value;
            throw new Error("called `Result::unwrap()` on an `Err` value: " + this.error);
        }
        expect(msg: string): T {
            if (this.value !== undefined) return this.value;
            throw new Error(msg, { cause: this.error! });
        }
        unwrapErr(): E {
            if (this.error !== undefined) return this.error;
            throw new Error("called `Result::unwrapErr()` on an `Ok` value: " + this.value);
        }
        expectErr(msg: string): E {
            if (this.error !== undefined) return this.error;
            throw new Error(msg, { cause: this.value! });
        }
        get $(): T {
            return this.unwrap();
        }
    }
    /**
     * A simple wrapper to create a new {@link Result}
     * @param {T} value successful value
     * @returns {Result<T,E>} the result
    */
    export function Ok<T, E>(value: T): Result<T, E> {
        return new ResultImpl<T, E>(value);
    }
    /**
     * A simple wrapper to create a new {@link Result}
     * @param {E} err error value
     * @returns {Result<T,E>} the result
    */
    export function Err<T, E>(err: E): Result<T, E> {
        return new ResultImpl<T, E>(undefined, err);
    }
}
/**
 * The Typescript representation of SafeScript's `Option` enum.
 * It is similar to Rust's `Option` enum.
 * 
 * It has two variants, `Some` and `None`.
 * 
 * `Some` is used to represent a value that is present, and `None` is used to represent a value that is absent.
*/
export interface Option<T> {
    /**
     * Returns true if the option is a Some value.
     * @returns {boolean} true if the option is a Some value
    */
    isSome(): boolean;
    /**
     * Returns true if the option is a None value.
     * @returns {boolean} true if the option is a None value
    */
    isNone(): boolean;
    /**
     * throw Error if the value is a None with a custom error message provided by msg.
     * @param {string} msg the message to use
    */
    expect(msg: string): T | never;
    /**
     * return the value v out of the Option<T> if it is Some(v).
     * @returns {T | never} the value
    */
    unwrap(): T | never;
    /**
     * Returns the contained value or a placeholder.
     * @param {T} placeholder the placeholder to use
     * @returns {T} the value
    */
    unwrapOr(placeholder: T): T;
    /**
     * Returns the contained value or computes it from a placeholderFn.
     * @param {() => T} placeholderFn the function to use
     * @returns {T} the value
    */
    unwrapOrElse(placeholderFn: () => T): T;
    /**
     * Maps an Option<T> to Option<U> by applying a function to a contained value.
     * @param {(value: T) => U} fn the function to apply
     * @returns {Option<U>} the option
     * @template U the type of the value
    */
    map<U>(fn: (value: T) => U): Option<U>;
    /**
     * Applies a function to the contained value (if any), or returns the provided placeholder (if not).
     * @param {U} placeholder the placeholder to use
     * @param {(value: T) => U} fn the function to apply
     * @returns {U} the value
     * @template U the type of the value
    */
    mapOr<U>(placeholder: U, fn: (value: T) => U): U;
    /**
     * Applies a function to the contained value (if any), or computes with placeholderFn (if not).
     * @param {() => U} placeholderFn the function to use
     * @param {(value: T) => U} fn the function to apply
     * @returns {U} the value
     * @template U the type of the value
    */
    mapOrElse<U>(placeholderFn: () => U, fn: (value: T) => U): U;
    /**
     * Transforms the Option<T> into a Result<T, E>, mapping Some(v) to Ok(v) and None to Err(err).
     * @param {E} err the error to use
     * @returns {Result<T, E>} the result
     * @template E the type of the error
    */
    okOr<E>(err: E): Result<T, E>;
    /**
     * Transforms the Option<T> into a Result<T, E>, mapping Some(v) to Ok(v) and None to Err(err()).
     * @param {() => E} err the function to use
     * @returns {Result<T, E>} the result
     * @template E the type of the error
    */
    okOrElse<E>(err: () => E): Result<T, E>;
    /**
     * Returns None if the option is None, otherwise returns optb.
     * @param {Option<U>} optb the option to use
     * @returns {Option<U>} the option
     * @template U the type of the value
    */
    and<U>(optb: Option<U>): Option<U>;
    /**
     * Returns None if the option is None, otherwise calls f with the wrapped value and returns the result.
     * You can recognize it as flatMap.
     * @param {(value: T) => Option<U>} fn the function to apply
     * @returns {Option<U>} the option
     * @template U the type of the value
    */
    andThen<U>(fn: (value: T) => Option<U>): Option<U>;
    /**
     * Returns None if the option is None, otherwise calls {@link predicate}
     * with the wrapped value and returns:
     * 
     * - Some(v) if predicate returns true (where 'v' is the wrapped value), and
     * - None if predicate returns false.
     * @param {(value: T) => boolean} predicate the predicate to use
     * @returns {Option<T>} the option
     * @template U the type of the value
    */
    filter(predicate: (value: T) => boolean): Option<T>;
    /**
     * Returns the option if it contains a value, otherwise returns optb.
     * @param {Option<T>} optb the option to use
     * @returns {Option<T>} the option
    */
    or(optb: Option<T>): Option<T>;
    /**
     * Returns the option if it contains a value, otherwise calls f and returns the result.
     * @param {() => Option<T>} fn the function to apply
     * @returns {Option<T>} the option
    */
    orElse(fn: () => Option<T>): Option<T>;
    /**
     * Returns Some if exactly one of self, optb is Some, otherwise returns None.
     * @param {Option<T>} optb the option to use
     * @returns {Option<T>} the option
    */
    xor(optb: Option<T>): Option<T>;
    /**
     * shortcut of unwrap
     * 
     * throws a {@link Error} if the value is a None
     * @returns {T | never} the value
    */
    get $(): T | never;
}
export namespace Option {
    class OptionImpl<T> implements Option<T> {
        constructor(private value?: T) { }
        isSome(): boolean {
            return this.value !== undefined;
        }
        isNone(): boolean {
            return !this.isSome();
        }
        expect(msg: string): T {
            if (this.value !== undefined) return this.value;
            throw new Error(msg);
        }
        unwrap(): T {
            if (this.value !== undefined) return this.value;
            throw new Error("called `Option::unwrap()` on a `None` value");
        }
        unwrapOr(placeholder: T): T {
            return this.value !== undefined ? this.value : placeholder;
        }
        unwrapOrElse(placeholderFn: () => T): T {
            return this.value !== undefined ? this.value : placeholderFn();
        }
        map<U>(fn: (value: T) => U): Option<U> {
            return this.value !== undefined ? Option.Some(fn(this.value)) : Option.None();
        }
        mapOr<U>(placeholder: U, fn: (value: T) => U): U {
            return this.value !== undefined ? fn(this.value) : placeholder;
        }
        mapOrElse<U>(placeholderFn: () => U, fn: (value: T) => U): U {
            return this.value !== undefined ? fn(this.value) : placeholderFn();
        }
        okOr<E>(err: E): Result<T, E> {
            return this.value !== undefined ? Result.Ok(this.value) : Result.Err(err);
        }
        okOrElse<E>(err: () => E): Result<T, E> {
            return this.value !== undefined ? Result.Ok(this.value) : Result.Err(err());
        }
        and<U>(optb: Option<U>): Option<U> {
            return this.value !== undefined ? optb : Option.None();
        }
        andThen<U>(fn: (value: T) => Option<U>): Option<U> {
            return this.value !== undefined ? fn(this.value) : Option.None();
        }
        filter(predicate: (value: T) => boolean): Option<T> {
            return this.value !== undefined && predicate(this.value) ? this : Option.None();
        }
        or(optb: Option<T>): Option<T> {
            return this.value !== undefined ? this : optb;
        }
        orElse(fn: () => Option<T>): Option<T> {
            return this.value !== undefined ? this : fn();
        }
        xor(optb: Option<T>): Option<T> {
            return this.value !== undefined ? Option.None() : optb;
        }
        get $(): T {
            return this.unwrap();
        }
    }    
    /**
     * A simple wrapper to create an {@link Option} enum
     * @param {T | undefined} value value to use
     * @returns {Option<T>} the resulting option enum
    */
    export function Some<T>(value?: T): Option<T> {
        return new OptionImpl(value);
    }
    /**
     * A simple wrapper to create an epmty {@link Option} enum
     * @returns {Option<T>} the resulting option enum
    */
    export function None<T>(): Option<T> {
        return new OptionImpl();
    }
}
