/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { Time } from "../src/utils";

describe("Time", () => {
    describe("date()", () => {
        it("Argument options.date optional reference date to calculate the locale date", () => {
            const date = new Date("2023-01-27T00:00");

            expect(Time.date()).is.not.undefined;
            expect(Time.date({ date }).getTime()).equals(date.getTime());
        });

        it("Argument options.year default is year of options.date", () => {
            const date = new Date("2023-02-28T11:37:21.666");

            expect(Time.date({ date, year: 2022 }).getFullYear()).equals(2022);
            expect(Time.date({ date }).getFullYear()).equals(2023);
        });

        it("Argument options.month default is month of options.date", () => {
            const date = new Date("2023-01-27T11:37:21.666");

            expect(Time.date({ date, month: Time.Month.December }).getMonth()).equals(Time.Month.December);
            expect(Time.date({ date }).getMonth()).equals(Time.Month.January);
        });

        it("Argument options.monthDay default is month day of options.date", () => {
            const date = new Date("2023-01-27T11:37:21.666");

            expect(Time.date({ date, monthDay: 2 }).getDate()).equals(2);
            expect(Time.date({ date }).getDate()).equals(27);
        });

        it("Argument options.hours default is 0", () => {
            const date = new Date("2023-01-27T11:37:21.666");

            expect(Time.date({ date, hours: 9 }).getHours()).equals(9);
            expect(Time.date({ date }).getHours()).equals(0);
        });

        it("Argument options.minutes default is 0", () => {
            const date = new Date("2023-01-27T11:37:21.666");

            expect(Time.date({ date, minutes: 13 }).getMinutes()).equals(13);
            expect(Time.date({ date }).getMinutes()).equals(0);
        });

        it("Argument options.seconds default is 0", () => {
            const date = new Date("2023-01-27T11:37:21.666");

            expect(Time.date({ date, seconds: 37 }).getSeconds()).equals(37);
            expect(Time.date({ date }).getSeconds()).equals(0);
        });

        it("Argument options.milliseconds default is 0", () => {
            const date = new Date("2023-01-27T11:37:21.666");

            expect(Time.date({ date, milliseconds: 123 }).getMilliseconds()).equals(123);
            expect(Time.date({ date }).getMilliseconds()).equals(0);
        });

        it("Returns locale Date", () => {
            const date = Time.date();

            expect(date).is.a("date");
            expect(date.getTimezoneOffset()).equals(new Date().getTimezoneOffset());
        });
    });

    describe("add()", () => {
        it("Argument options.default is date()", () => {
            const date = new Date("2023-01-27T00:00");

            expect(Time.add().getTime()).equals(Time.date().getTime());
            expect(Time.add({ date }).getTime()).equals(date.getTime());
        });

        it("Argument options.years adds years to reference date", () => {
            const date = new Date("2021-01-25T09:35:19.664");

            expect(Time.add({ date, years: 2 }).getFullYear()).equals(2023);
        });

        it("Argument options.months adds months to reference date", () => {
            const date = new Date("2021-01-25T09:35:19.664");

            expect(Time.add({ date, months: 2 }).getMonth()).equals(Time.Month.March);
        });

        it("Argument options.days adds days to reference date", () => {
            const date = new Date("2021-01-25T09:35:19.664");

            expect(Time.add({ date, days: 2 }).getDate()).equals(27);
        });

        it("Argument options.hours adds hours to reference date", () => {
            const date = new Date("2021-01-25T09:35:19.664");

            expect(Time.add({ date, hours: 2 }).getHours()).equals(11);
        });

        it("Argument options.minutes adds minutes to reference date", () => {
            const date = new Date("2021-01-25T09:35:19.664");

            expect(Time.add({ date, minutes: 2 }).getMinutes()).equals(37);
        });

        it("Argument options.seconds adds seconds to reference date", () => {
            const date = new Date("2021-01-25T09:35:19.664");

            expect(Time.add({ date, seconds: 2 }).getSeconds()).equals(21);
        });

        it("Argument options.milliseconds adds milliseconds to reference date", () => {
            const date = new Date("2021-01-25T09:35:19.664");

            expect(Time.add({ date, milliseconds: 2 }).getMilliseconds()).equals(666);
        });

        it("Returns locale Date", () => {
            const date = Time.add();

            expect(date).is.a("date");
            expect(date.getTimezoneOffset()).equals(new Date().getTimezoneOffset());
        });
    });

    describe("reduce()", () => {
        it("Argument options.default is date()", () => {
            const date = new Date("2023-01-27T00:00");

            expect(Time.reduce().getTime()).equals(Time.date().getTime());
            expect(Time.reduce({ date }).getTime()).equals(date.getTime());
        });

        it("Argument options.years reduce years of reference date", () => {
            const date = new Date("2021-04-25T09:35:19.664");

            expect(Time.reduce({ date, years: 2 }).getFullYear()).equals(2019);
        });

        it("Argument options.months reduce months of reference date", () => {
            const date = new Date("2021-04-25T09:35:19.664");

            expect(Time.reduce({ date, months: 2 }).getMonth()).equals(Time.Month.February);
        });

        it("Argument options.days reduce days of reference date", () => {
            const date = new Date("2021-04-25T09:35:19.664");

            expect(Time.reduce({ date, days: 2 }).getDate()).equals(23);
        });

        it("Argument options.hours reduce hours of reference date", () => {
            const date = new Date("2021-04-25T09:35:19.664");

            expect(Time.reduce({ date, hours: 2 }).getHours()).equals(7);
        });

        it("Argument options.minutes reduce minutes of reference date", () => {
            const date = new Date("2021-04-25T09:35:19.664");

            expect(Time.reduce({ date, minutes: 2 }).getMinutes()).equals(33);
        });

        it("Argument options.seconds reduce seconds of reference date", () => {
            const date = new Date("2021-04-25T09:35:19.664");

            expect(Time.reduce({ date, seconds: 2 }).getSeconds()).equals(17);
        });

        it("Argument options.milliseconds reduce milliseconds of reference date", () => {
            const date = new Date("2021-04-25T09:35:19.664");

            expect(Time.reduce({ date, milliseconds: 2 }).getMilliseconds()).equals(662);
        });

        it("Returns locale Date", () => {
            const date = Time.reduce();

            expect(date).is.a("date");
            expect(date.getTimezoneOffset()).equals(new Date().getTimezoneOffset());
        });
    });

    describe("format()", () => {
        it('Param format "YYYY" to full year', () => {
            expect(Time.format("YYYY", new Date("2023-02-27T11:37:21.666"))).equals("2023");
        });

        it('Param format "YY" to short year', () => {
            expect(Time.format("YY", new Date("2023-02-27T11:37:21.666"))).equals("23");
        });

        it('Param format "MM" to month with leading zeros', () => {
            expect(Time.format("MM", new Date("2023-02-27T11:37:21.666"))).equals("02");
            expect(Time.format("MM", new Date("2023-11-27T11:37:21.666"))).equals("11");
        });

        it('Param format "DD" to days with leading zeros', () => {
            expect(Time.format("DD", new Date("2023-02-09T11:37:21.666"))).equals("09");
            expect(Time.format("DD", new Date("2023-02-27T11:37:21.666"))).equals("27");
        });

        it('Param format "M" to month without leading zeros', () => {
            expect(Time.format("M", new Date("2023-02-27T11:37:21.666"))).equals("2");
            expect(Time.format("M", new Date("2023-11-27T11:37:21.666"))).equals("11");
        });

        it('Param format "D" to days without leading zeros', () => {
            expect(Time.format("D", new Date("2023-02-27T11:37:21.666"))).equals("27");
            expect(Time.format("D", new Date("2023-02-09T11:37:21.666"))).equals("9");
        });

        it('Param format "mss" to milliseconds with leading zeros', () => {
            expect(Time.format("mss", new Date("2023-02-27T11:37:21.666"))).equals("666");
            expect(Time.format("mss", new Date("2023-02-27T11:37:21.066"))).equals("066");
            expect(Time.format("mss", new Date("2023-02-27T11:37:21.006"))).equals("006");
        });

        it('Param format "hh" to hours with leading zeros', () => {
            expect(Time.format("hh", new Date("2023-02-27T11:37:21.666"))).equals("11");
            expect(Time.format("hh", new Date("2023-02-27T09:37:21.666"))).equals("09");
        });

        it('Param format "mm" to minutes with leading zeros', () => {
            expect(Time.format("mm", new Date("2023-02-27T11:37:21.666"))).equals("37");
            expect(Time.format("mm", new Date("2023-02-27T11:09:21.666"))).equals("09");
        });

        it('Param format "ss" to seconds with leading zeros', () => {
            expect(Time.format("ss", new Date("2023-02-27T11:37:21.666"))).equals("21");
            expect(Time.format("ss", new Date("2023-02-27T11:37:09.666"))).equals("09");
        });

        it('Param format "ms" to milliseconds without leading zeros', () => {
            expect(Time.format("ms", new Date("2023-02-27T11:37:21.666"))).equals("666");
            expect(Time.format("ms", new Date("2023-02-27T11:37:21.066"))).equals("66");
            expect(Time.format("ms", new Date("2023-02-27T11:37:21.006"))).equals("6");
        });

        it('Param format "h" to hours without leading zeros', () => {
            expect(Time.format("h", new Date("2023-02-27T11:37:21.666"))).equals("11");
            expect(Time.format("h", new Date("2023-02-27T09:37:21.666"))).equals("9");
        });

        it('Param format "m" to minutes without leading zeros', () => {
            expect(Time.format("m", new Date("2023-02-27T11:37:21.666"))).equals("37");
            expect(Time.format("m", new Date("2023-02-27T11:09:21.666"))).equals("9");
        });

        it('Param format "s" to seconds without leading zeros', () => {
            expect(Time.format("s", new Date("2023-02-27T11:37:21.666"))).equals("21");
            expect(Time.format("s", new Date("2023-02-27T11:37:09.666"))).equals("9");
        });

        it('Param date reference, default is current locale Date', () => {
            expect(new Date(Time.format("YYYY-MM-DDThh:mm:ss.mss")).getTime() / Time.Milliseconds.Second).equals(new Date().getTime() / Time.Milliseconds.Second);
        });

        it('Returns formatted time string as "YYYY-MM-DD hh:mm:ss.mss"', () => {
            expect(Time.format(undefined, new Date("2023-02-27T11:37:21.666"))).equals("2023-02-27 11:37:21.666");
        });
    });
});