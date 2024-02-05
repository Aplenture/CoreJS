/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

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