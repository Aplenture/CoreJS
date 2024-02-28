/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

/** Time units in milliseconds. */
export enum Milliseconds {
    /** One second in milliseconds. */
    Second = 1000,
    /** One minute in milliseconds. */
    Minute = 60 * Second,
    /** One hour in milliseconds. */
    Hour = 60 * Minute,
    /** One day in milliseconds. */
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

/** Options to calculate a Date. */
export interface DateOptions {
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

/**
 * @argument options.date optional reference date to calculate the locale date.
 * @argument options.year default is year of options.date.
 * @argument options.month default is month of options.date.
 * @argument options.monthDay default is month day of options.date.
 * @argument options.hours default is 0.
 * @argument options.minutes default is 0.
 * @argument options.seconds default is 0.
 * @argument options.milliseconds default is 0.
 * @argument options.weekDay optional week day.
 * @returns locale Date.
 */
export function date(options: DateOptions = {}): Date {
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

/**
 * @argument options.date default is date().
 * @argument options.years adds years to reference date.
 * @argument options.months adds months to reference date.
 * @argument options.days adds days to reference date.
 * @argument options.hours adds hours to reference date.
 * @argument options.minutes adds minutes to reference date.
 * @argument options.seconds adds seconds to reference date.
 * @argument options.milliseconds adds milliseconds to reference date.
 * @returns locale Date.
 */
export function add(options: AddOpitons = {}): Date {
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

/**
 * @argument options.date default is date().
 * @argument options.years reduces years of reference date.
 * @argument options.months reduces months of reference date.
 * @argument options.days reduces days of reference date.
 * @argument options.hours reduces hours of reference date.
 * @argument options.minutes reduces minutes of reference date.
 * @argument options.seconds reduces seconds of reference date.
 * @argument options.milliseconds reduces milliseconds of reference date.
 * @returns locale Date.
 */
export function reduce(options: AddOpitons = {}): Date {
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
 * @param format "YYYY" to full year.
 * @param format "YY" to short year.
 * @param format "MM" to month with leading zeros.
 * @param format "DD" to days with leading zeros.
 * @param format "M" to month without leading zeros.
 * @param format "D" to days without leading zeros.
 * @param format "mss" to milliseconds with leading zeros.
 * @param format "hh" to hours with leading zeros.
 * @param format "mm" to minuts with leading zeros.
 * @param format "ss" to seconds with leading zeros.
 * @param format "ms" to milliseconds without leading zeros.
 * @param format "h" to hours without leading zeros.
 * @param format "m" to minutes without leading zeros.
 * @param format "s" to seconds without leading zeros.
 * @param date reference, default is current locale Date.
 * @returns formatted time string as "YYYY-MM-DD hh:mm:ss.mss".
 */
export function format(format = "YYYY-MM-DD hh:mm:ss.mss", date = new Date()): string {
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