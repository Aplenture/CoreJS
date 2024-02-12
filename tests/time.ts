/**
 * Aplenture/CoreJS
 * https://github.com/Aplenture/CoreJS
 * Copyright (c) 2024 Aplenture
 * License https://github.com/Aplenture/CoreJS/blob/main/LICENSE
 */

import { expect } from "chai";
import { Time } from "../src";

describe("Time", () => {
    describe("format()", () => {
        it("serializes complete Date", () => {
            const format = Time.format("YYYY-MM-DD hh:mm:ss.mss", new Date("2024-02-05T13:37:42.666"));

            expect(format).equals("2024-02-05 13:37:42.666");
        });

        it("serializes without time", () => {
            const format = Time.format("YYYY-MM-DD", new Date("2024-02-05T13:37:42.666"));

            expect(format).equals("2024-02-05");
        });

        it("serializes time only", () => {
            const format = Time.format("hh:mm:ss.mss", new Date("2024-02-05T13:37:42.666"));

            expect(format).equals("13:37:42.666");
        });

        it("serializes without milliseconds", () => {
            const format = Time.format("YYYY-MM-DD hh:mm:ss", new Date("2024-02-05T13:37:42.666"));

            expect(format).equals("2024-02-05 13:37:42");
        });
    });

    describe("date()", () => {
        describe("date", () => {
            it("calculates start of day", () => {
                const reference = new Date();
                const date = Time.date();

                expect(date.getFullYear()).equals(reference.getFullYear(), "year");
                expect(date.getMonth()).equals(reference.getMonth(), "month");
                expect(date.getDate()).equals(reference.getDate(), "day");
                expect(date.getHours()).equals(0, "hours");
                expect(date.getMinutes()).equals(0, "minutes");
                expect(date.getSeconds()).equals(0, "seconds");
                expect(date.getMilliseconds()).equals(0, "milliseconds");
            });

            it("considers a different date reference", () => {
                const date = new Date("2024-02-11");
                const target = new Date("2024-02-11T00:00:00.000");

                expect(Time.date({ date })).deep.equals(target);
            });
        });

        describe("year", () => {
            it("changes the year", () => {
                const date = new Date("2024-02-12");
                const target = new Date("2023-02-12T00:00:00.000");

                expect(Time.date({ date, year: 2023 })).deep.equals(target);
            });
        });

        describe("month", () => {
            it("changes the month", () => {
                const date = new Date("2024-02-12");
                const target = new Date("2024-01-12T00:00:00.000");

                expect(Time.date({ date, month: Time.Month.January })).deep.equals(target);
            });
        });

        describe("day", () => {
            it("changes to first day of febrary", () => {
                const date = new Date("2024-02-12");
                const target = new Date("2024-02-01T00:00:00.000");

                expect(Time.date({ date, monthDay: 1 })).deep.equals(target);
            });

            it("changes to last day of long febrary", () => {
                const date = new Date("2024-02-12");
                const target = new Date("2024-02-29T00:00:00.000");

                expect(Time.date({ date, monthDay: 29 })).deep.equals(target);
            });

            it("overflows to first day of march after short febrary", () => {
                const date = new Date("2025-02-12");
                const target = new Date("2025-03-01T00:00:00.000");

                expect(Time.date({ date, monthDay: 29 })).deep.equals(target);
            });
        });

        describe("week day", () => {
            it("changes from monday to saturday", () => {
                const date = new Date("2024-02-12");
                const target = new Date("2024-02-17T00:00:00.000");

                expect(Time.date({ date, weekDay: Time.WeekDay.Saturday })).deep.equals(target);
            });

            it("changes from monday to sunday", () => {
                const date = new Date("2024-02-12");
                const target = new Date("2024-02-11T00:00:00.000");

                expect(Time.date({ date, weekDay: Time.WeekDay.Sunday })).deep.equals(target);
            });

            it("changes from sunday to monday", () => {
                const date = new Date("2024-02-11");
                const target = new Date("2024-02-12T00:00:00.000");

                expect(Time.date({ date, weekDay: Time.WeekDay.Monday })).deep.equals(target);
            });

            it("changes from sunday to saturday", () => {
                const date = new Date("2024-02-11");
                const target = new Date("2024-02-17T00:00:00.000");

                expect(Time.date({ date, weekDay: Time.WeekDay.Saturday })).deep.equals(target);
            });
        });

        describe("hours", () => {
            it("changes hours", () => {
                const date = new Date("2024-02-12");
                const target = new Date("2024-02-12T01:00:00.000");

                expect(Time.date({ date, hours: 1 })).deep.equals(target);
            });

            it("overflows hours to days", () => {
                const date = new Date("2024-02-12");
                const target = new Date("2024-02-13T01:00:00.000");

                expect(Time.date({ date, hours: 25 })).deep.equals(target);
            });
        });

        describe("minutes", () => {
            it("changes minutes", () => {
                const date = new Date("2024-02-12");
                const target = new Date("2024-02-12T00:01:00.000");

                expect(Time.date({ date, minutes: 1 })).deep.equals(target);
            });

            it("overflows minutes to hours", () => {
                const date = new Date("2024-02-12");
                const target = new Date("2024-02-12T01:01:00.000");

                expect(Time.date({ date, minutes: 61 })).deep.equals(target);
            });
        });

        describe("seconds", () => {
            it("changes seconds", () => {
                const date = new Date("2024-02-12");
                const target = new Date("2024-02-12T00:00:01.000");

                expect(Time.date({ date, seconds: 1 })).deep.equals(target);
            });

            it("overflows seconds to minutes", () => {
                const date = new Date("2024-02-12");
                const target = new Date("2024-02-12T00:01:01.000");

                expect(Time.date({ date, seconds: 61 })).deep.equals(target);
            });
        });

        describe("milliseconds", () => {
            it("changes milliseconds", () => {
                const date = new Date("2024-02-12");
                const target = new Date("2024-02-12T00:00:00.001");

                expect(Time.date({ date, milliseconds: 1 })).deep.equals(target);
            });

            it("overflows milliseconds to seconds", () => {
                const date = new Date("2024-02-12");
                const target = new Date("2024-02-12T00:00:01.001");

                expect(Time.date({ date, milliseconds: 1001 })).deep.equals(target);
            });
        });
    });

    describe("add()", () => {
        describe("years", () => {
            it("adds the year", () => {
                const date = Time.date({ year: 2024, month: Time.Month.February, monthDay: 12 });
                const target = new Date("2025-02-12T00:00:00.000");

                expect(Time.add({ date, years: 1 })).deep.equals(target);
            });
        });

        describe("months", () => {
            it("adds the month", () => {
                const date = Time.date({ year: 2024, month: Time.Month.February, monthDay: 12 });
                const target = new Date("2024-03-12T00:00:00.000");

                expect(Time.add({ date, months: 1 })).deep.equals(target);
            });

            it("overflows to year", () => {
                const date = Time.date({ year: 2024, month: Time.Month.February, monthDay: 12 });
                const target = new Date("2025-01-12T00:00:00.000");

                expect(Time.add({ date, months: 11 })).deep.equals(target);
            });
        });

        describe("days", () => {
            it("adds the day", () => {
                const date = Time.date({ year: 2024, month: Time.Month.February, monthDay: 12 });
                const target = new Date("2024-02-13T00:00:00.000");

                expect(Time.add({ date, days: 1 })).deep.equals(target);
            });

            it("overflows to month", () => {
                const date = Time.date({ year: 2024, month: Time.Month.February, monthDay: 12 });
                const target = new Date("2024-03-01T00:00:00.000");

                expect(Time.add({ date, days: 18 })).deep.equals(target);
            });
        });

        describe("hours", () => {
            it("adds the hours", () => {
                const date = Time.date({ year: 2024, month: Time.Month.February, monthDay: 12 });
                const target = new Date("2024-02-12T01:00:00.000");

                expect(Time.add({ date, hours: 1 })).deep.equals(target);
            });

            it("overflows to day", () => {
                const date = Time.date({ year: 2024, month: Time.Month.February, monthDay: 12 });
                const target = new Date("2024-02-13T00:00:00.000");

                expect(Time.add({ date, hours: 24 })).deep.equals(target);
            });
        });

        describe("minutes", () => {
            it("adds the minutes", () => {
                const date = Time.date({ year: 2024, month: Time.Month.February, monthDay: 12 });
                const target = new Date("2024-02-12T00:01:00.000");

                expect(Time.add({ date, minutes: 1 })).deep.equals(target);
            });

            it("overflows to hours", () => {
                const date = Time.date({ year: 2024, month: Time.Month.February, monthDay: 12 });
                const target = new Date("2024-02-12T01:00:00.000");

                expect(Time.add({ date, minutes: 60 })).deep.equals(target);
            });
        });

        describe("seconds", () => {
            it("adds the seconds", () => {
                const date = Time.date({ year: 2024, month: Time.Month.February, monthDay: 12 });
                const target = new Date("2024-02-12T00:00:01.000");

                expect(Time.add({ date, seconds: 1 })).deep.equals(target);
            });

            it("overflows to minutes", () => {
                const date = Time.date({ year: 2024, month: Time.Month.February, monthDay: 12 });
                const target = new Date("2024-02-12T00:01:00.000");

                expect(Time.add({ date, seconds: 60 })).deep.equals(target);
            });
        });

        describe("milliseconds", () => {
            it("adds the milliseconds", () => {
                const date = Time.date({ year: 2024, month: Time.Month.February, monthDay: 12 });
                const target = new Date("2024-02-12T00:00:00.001");

                expect(Time.add({ date, milliseconds: 1 })).deep.equals(target);
            });

            it("overflows to seconds", () => {
                const date = Time.date({ year: 2024, month: Time.Month.February, monthDay: 12 });
                const target = new Date("2024-02-12T00:00:01.000");

                expect(Time.add({ date, milliseconds: 1000 })).deep.equals(target);
            });
        });
    });

    describe("reduce()", () => {
        describe("years", () => {
            it("reduces the year", () => {
                const date = Time.date({ year: 2024, month: Time.Month.February, monthDay: 12 });
                const target = new Date("2023-02-12T00:00:00.000");

                expect(Time.reduce({ date, years: 1 })).deep.equals(target);
            });
        });

        describe("months", () => {
            it("reduces the month", () => {
                const date = Time.date({ year: 2024, month: Time.Month.February, monthDay: 12 });
                const target = new Date("2024-01-12T00:00:00.000");

                expect(Time.reduce({ date, months: 1 })).deep.equals(target);
            });

            it("overflows to year", () => {
                const date = Time.date({ year: 2024, month: Time.Month.February, monthDay: 12 });
                const target = new Date("2023-12-12T00:00:00.000");

                expect(Time.reduce({ date, months: 2 })).deep.equals(target);
            });
        });

        describe("days", () => {
            it("reduces the day", () => {
                const date = Time.date({ year: 2024, month: Time.Month.February, monthDay: 12 });
                const target = new Date("2024-02-11T00:00:00.000");

                expect(Time.reduce({ date, days: 1 })).deep.equals(target);
            });

            it("overflows to month", () => {
                const date = Time.date({ year: 2024, month: Time.Month.February, monthDay: 12 });
                const target = new Date("2024-01-31T00:00:00.000");

                expect(Time.reduce({ date, days: 12 })).deep.equals(target);
            });
        });

        describe("hours", () => {
            it("reduces the hours", () => {
                const date = Time.date({ year: 2024, month: Time.Month.February, monthDay: 12, hours: 1 });
                const target = new Date("2024-02-12T00:00:00.000");

                expect(Time.reduce({ date, hours: 1 })).deep.equals(target);
            });

            it("overflows to day", () => {
                const date = Time.date({ year: 2024, month: Time.Month.February, monthDay: 12 });
                const target = new Date("2024-02-11T23:00:00.000");

                expect(Time.reduce({ date, hours: 1 })).deep.equals(target);
            });
        });

        describe("minutes", () => {
            it("reduces the minutes", () => {
                const date = Time.date({ year: 2024, month: Time.Month.February, monthDay: 12, minutes: 1 });
                const target = new Date("2024-02-12T00:00:00.000");

                expect(Time.reduce({ date, minutes: 1 })).deep.equals(target);
            });

            it("overflows to hours", () => {
                const date = Time.date({ year: 2024, month: Time.Month.February, monthDay: 12 });
                const target = new Date("2024-02-11T23:59:00.000");

                expect(Time.reduce({ date, minutes: 1 })).deep.equals(target);
            });
        });

        describe("seconds", () => {
            it("reduces the seconds", () => {
                const date = Time.date({ year: 2024, month: Time.Month.February, monthDay: 12, seconds: 1 });
                const target = new Date("2024-02-12T00:00:00.000");

                expect(Time.reduce({ date, seconds: 1 })).deep.equals(target);
            });

            it("overflows to minutes", () => {
                const date = Time.date({ year: 2024, month: Time.Month.February, monthDay: 12 });
                const target = new Date("2024-02-11T23:59:59.000");

                expect(Time.reduce({ date, seconds: 1 })).deep.equals(target);
            });
        });

        describe("milliseconds", () => {
            it("reduces the milliseconds", () => {
                const date = Time.date({ year: 2024, month: Time.Month.February, monthDay: 12, milliseconds: 1 });
                const target = new Date("2024-02-12T00:00:00.000");

                expect(Time.reduce({ date, milliseconds: 1 })).deep.equals(target);
            });

            it("overflows to seconds", () => {
                const date = Time.date({ year: 2024, month: Time.Month.February, monthDay: 12 });
                const target = new Date("2024-02-11T23:59:59.999");

                expect(Time.reduce({ date, milliseconds: 1 })).deep.equals(target);
            });
        });
    });
});