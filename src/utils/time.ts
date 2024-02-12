/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

/** Time units in milliseconds. */
export enum Milliseconds {
    Second = 1000,
    Minute = 60 * Second,
    Hour = 60 * Minute,
    Day = 24 * Hour
}

/** 
 * All week days parsed in numbers.
 * Beginning with Sunday as 0.
 */
export enum WeekDay {
    Sunday = 0,
    Monday,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday
}

/** 
 * All months parsed in numbers.
 * Beginning with Janary as 0.
 */
export enum Month {
    January = 0,
    February,
    March,
    April,
    May,
    June,
    July,
    August,
    September,
    October,
    November,
    December
}

/** Options to calculate a date. */
export interface DateOpitons {
    /** 
     * The reference to calculate the date.
     * Default is current date.
     */
    readonly date?: Date;

    /** 
     * Year of the day.
     * Default is the year of the reference date.
     */
    readonly year?: number;

    /** 
     * Month of the day.
     * Default is the month of the reference date.
     */
    readonly month?: Month;

    /** 
     * Day of the month between [1, 31].
     * Default is the day of the reference date.
     */
    readonly monthDay?: number;

    /** 
     * Day of the week.
     */
    readonly weekDay?: WeekDay;

    /** 
     * Hours of the date. 
     * Default is 0.
     */
    readonly hours?: number;

    /** 
     * Minutes of the date. 
     * Default is 0.
     */
    readonly minutes?: number;

    /** 
     * Seconds of the date. 
     * Default is 0.
     */
    readonly seconds?: number;

    /** 
     * Milliseconds of the date. 
     * Default is 0.
     */
    readonly milliseconds?: number;
}

/** Options to add time to a date. */
export interface AddOpitons {
    /** 
     * The reference to calculate the date.
     * If not set, the reference is calculated by date().
     */
    readonly date?: Date;

    /** 
     * Number of years to add to the reference. 
     * Default is 0.
     */
    readonly years?: number;

    /** 
     * Number of months to add to the reference. 
     * Default is 0.
     */
    readonly months?: number;

    /** 
     * Number of days to add to the reference. 
     * Default is 0.
     */
    readonly days?: number;

    /** 
     * Number of hours to add to the reference. 
     * Default is 0.
     */
    readonly hours?: number;

    /** 
     * Number of minutes to add to the reference. 
     * Default is 0.
     */
    readonly minutes?: number;

    /** 
     * Number of seconds to add to the reference. 
     * Default is 0.
     */
    readonly seconds?: number;

    /** 
     * Number of milliseconds to add to the reference. 
     * Default is 0.
     */
    readonly milliseconds?: number;
}

/** Calculates local date by opitons. */
export function date(options: DateOpitons = {}) {
    const tmp = options.date || new Date();

    const result = new Date(
        options.year ?? tmp.getFullYear(),
        options.month ?? tmp.getMonth(),
        options.monthDay ?? tmp.getDate(),
        options.hours || 0,
        options.minutes || 0,
        options.seconds || 0,
        options.milliseconds || 0
    );

    if (undefined != options.weekDay) {
        const weekDay: WeekDay = result.getDay();

        // calculate day of month by week day
        // first calculate day of last monday
        // then add number of days to calculate the target week day
        result.setDate(result.getDate() - weekDay + options.weekDay);
    }

    return result;
}

/** Increases a local date by opitons. */
export function add(options: AddOpitons = {}) {
    const tmp = options.date || date();

    return new Date(
        tmp.getFullYear() + (options.years || 0),
        tmp.getMonth() + (options.months || 0),
        tmp.getDate() + (options.days || 0),
        tmp.getHours() + (options.hours || 0),
        tmp.getMinutes() + (options.minutes || 0),
        tmp.getSeconds() + (options.seconds || 0),
        tmp.getMilliseconds() + (options.milliseconds || 0)
    );
}

/** Decreases a local date by opitons. */
export function reduce(options: AddOpitons = {}) {
    const tmp = options.date || date();

    return new Date(
        tmp.getFullYear() - (options.years || 0),
        tmp.getMonth() - (options.months || 0),
        tmp.getDate() - (options.days || 0),
        tmp.getHours() - (options.hours || 0),
        tmp.getMinutes() - (options.minutes || 0),
        tmp.getSeconds() - (options.seconds || 0),
        tmp.getMilliseconds() - (options.milliseconds || 0)
    );
}

/**
 * Parses date to string with specific format.
 * Example 1707136662666 to '2024-02-05 13:37:42.666'.
 */
export function format(format = "YYYY-MM-DD hh:mm:ss.mss", date = new Date()) {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString();
    const day = date.getDate().toString();
    const hours = date.getHours().toString();
    const minutes = date.getMinutes().toString();
    const seconds = date.getSeconds().toString();
    const milliseconds = date.getMilliseconds().toString();

    return format
        .replace("YYYY", year)
        .replace("YY", year.substring(2))
        .replace("MM", month.length == 2 ? month : '0' + month)
        .replace("DD", day.length == 2 ? day : '0' + day)
        .replace("M", month)
        .replace("D", day)
        .replace("mss", '0'.repeat(3 - milliseconds.length) + milliseconds)
        .replace("hh", hours.length == 2 ? hours : '0' + hours)
        .replace("mm", minutes.length == 2 ? minutes : '0' + minutes)
        .replace("ss", seconds.length == 2 ? seconds : '0' + seconds)
        .replace("ms", milliseconds)
        .replace("h", hours)
        .replace("m", minutes)
        .replace("s", seconds);
}