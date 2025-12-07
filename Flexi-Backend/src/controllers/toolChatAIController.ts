import { Request, Response } from "express";
import { DynamicTool } from "@langchain/core/tools";
import { PrismaClient as PrismaClient1 } from "../generated/client1/client";

import { flexiDBPrismaClient } from "../../lib/PrismaClient1";;

const prisma = flexiDBPrismaClient;

// ---------------------- Date Utilities ----------------------
function startOfDay(d: Date) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function addDays(d: Date, n: number) { const nd = new Date(d); nd.setDate(nd.getDate() + n); return nd; }
function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function startOfNextMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth() + 1, 1); }
function startOfPrevMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth() - 1, 1); }
function startOfYear(d: Date) { return new Date(d.getFullYear(), 0, 1); }
function startOfNextYear(d: Date) { return new Date(d.getFullYear() + 1, 0, 1); }

interface Range { start: Date; end: Date; }
function range(start: Date, end: Date): Range { return { start, end }; }

async function aggregate(memberId: string, r: Range) {
  const res = await prisma.bill.aggregate({
    where: { memberId, createdAt: { gte: r.start, lt: r.end } },
    _sum: { total: true },
    _count: { id: true },
  });
  return {
    amount: res._sum.total || 0,
    count: res._count.id || 0,
    period: `${r.start.toISOString().split("T")[0]} to ${addDays(r.end, -1).toISOString().split("T")[0]}`,
  };
}

export type SalesPeriod =
  | "today"
  | "yesterday"
  | "thisMonth"
  | "lastMonth"
  | "last3Months"
  | "last6Months"
  | "lastYear"
  | "summary";

export async function getSelectiveSalesData(memberId: string, period: SalesPeriod) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const tomorrowStart = addDays(todayStart, 1);
  const yesterdayStart = addDays(todayStart, -1);

  if (period === "today") {
    const today = await aggregate(memberId, range(todayStart, tomorrowStart));
    const yesterday = await aggregate(memberId, range(yesterdayStart, todayStart));
    return {
      today,
      yesterday,
      changePct:
        yesterday.amount > 0
          ? (((today.amount - yesterday.amount) / yesterday.amount) * 100).toFixed(1) + "%"
          : "N/A",
    };
  }
  if (period === "yesterday") {
    const y = await aggregate(memberId, range(yesterdayStart, todayStart));
    return { yesterday: y };
  }
  if (period === "thisMonth") {
    const thisMonthStart = startOfMonth(now);
    const nextMonthStart = startOfNextMonth(now);
    const lastMonthStart = startOfPrevMonth(now);
    const thisMonth = await aggregate(memberId, range(thisMonthStart, nextMonthStart));
    const lastMonth = await aggregate(memberId, range(lastMonthStart, thisMonthStart));
    return {
      thisMonth,
      lastMonth,
      growthPct:
        lastMonth.amount > 0
          ? (((thisMonth.amount - lastMonth.amount) / lastMonth.amount) * 100).toFixed(1) + "%"
          : "N/A",
      dailyAverage: thisMonth.amount / Math.max(1, now.getDate()),
    };
  }
  if (period === "lastMonth") {
    const thisMonthStart = startOfMonth(now);
    const lastMonthStart = startOfPrevMonth(now);
    return { lastMonth: await aggregate(memberId, range(lastMonthStart, thisMonthStart)) };
  }
  if (period === "last3Months") {
    // Include current (possibly partial) month plus previous two months
    const currentMonthStart = startOfMonth(now);
    const start3 = new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() - 2, 1); // -2 => total span of 3 months including current
    const nextMonthStart = startOfNextMonth(now);
    const totalAgg = await aggregate(memberId, range(start3, nextMonthStart));
    const monthBreakdowns: any[] = [];
    for (let i = 0; i < 3; i++) {
      const mStart = new Date(start3.getFullYear(), start3.getMonth() + i, 1);
      const mEnd = new Date(start3.getFullYear(), start3.getMonth() + i + 1, 1);
      const agg = await aggregate(memberId, range(mStart, mEnd));
      monthBreakdowns.push({
        month: mStart.getMonth() + 1,
        year: mStart.getFullYear(),
        label: `${mStart.getFullYear()}-${String(mStart.getMonth() + 1).padStart(2, '0')}`,
        amount: agg.amount,
        count: agg.count,
        isCurrent: mStart.getTime() === currentMonthStart.getTime(),
      });
    }
    return { last3Months: totalAgg, breakdown: monthBreakdowns, includedCurrentMonth: true };
  }
  if (period === "last6Months") {
    // Include current (possibly partial) month + previous 5 months
    const currentMonthStart = startOfMonth(now);
    const start6 = new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() - 5, 1); // -5 => span 6 months including current
    const nextMonthStart = startOfNextMonth(now);
    const totalAgg = await aggregate(memberId, range(start6, nextMonthStart));
    const monthBreakdowns: any[] = [];
    for (let i = 0; i < 6; i++) {
      const mStart = new Date(start6.getFullYear(), start6.getMonth() + i, 1);
      const mEnd = new Date(start6.getFullYear(), start6.getMonth() + i + 1, 1);
      const agg = await aggregate(memberId, range(mStart, mEnd));
      monthBreakdowns.push({
        month: mStart.getMonth() + 1,
        year: mStart.getFullYear(),
        label: `${mStart.getFullYear()}-${String(mStart.getMonth() + 1).padStart(2, '0')}`,
        amount: agg.amount,
        count: agg.count,
        isCurrent: mStart.getTime() === currentMonthStart.getTime(),
      });
    }
    return { last6Months: totalAgg, breakdown6: monthBreakdowns, includedCurrentMonth: true };
  }
  if (period === "lastYear") {
    const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
    const thisYearStart = startOfYear(now);
    return { lastYear: await aggregate(memberId, range(lastYearStart, thisYearStart)) };
  }
  if (period === "summary") {
    const [today, month, three, six, year] = await Promise.all([
      getSelectiveSalesData(memberId, "today"),
      getSelectiveSalesData(memberId, "thisMonth"),
      getSelectiveSalesData(memberId, "last3Months"),
      getSelectiveSalesData(memberId, "last6Months"),
      getSelectiveSalesData(memberId, "lastYear"),
    ]);
    return { ...(today as any), ...(month as any), ...(three as any), ...(six as any), ...(year as any) };
  }
  return {};
}

function inferPeriod(raw: string): SalesPeriod {
  const t = raw.toLowerCase().replace(/\s+/g, " ");
  if (/(^|\b)(today|วันนี้)(\b|$)/.test(t)) return "today";
  if (/(^|\b)(yesterday|เมื่อวาน)(\b|$)/.test(t)) return "yesterday";
  if (/(this month|เดือนนี้|current month)/.test(t)) return "thisMonth";
  if (/(last month|เดือนที่แล้ว|previous month)/.test(t)) return "lastMonth";
  if (/((last|previous)\s*3\s*months|last3months|3\s*months|สามเดือน|ย้อนหลัง\s*3\s*เดือน|quarter)/.test(t)) return "last3Months";
  if (/((last|previous)\s*6\s*months|last6months|6\s*months|หกเดือน|ย้อนหลัง\s*6\s*เดือน)/.test(t)) return "last6Months";
  if (/(last year|ปีที่แล้ว|ปีก่อน|previous year)/.test(t)) return "lastYear";
  if (/(all|overall|summary|ภาพรวม|performance|ยอดขายรวม)/.test(t)) return "summary";
  return "today";
}

export function createSalesAnalyticsTool(memberId: string) {
  // --- Helper: parse explicit month/year requests (Thai & English) ---
  const thaiMonths: Record<string, number> = {
    "มกราคม": 1, "กุมภาพันธ์": 2, "มีนาคม": 3, "เมษายน": 4, "พฤษภาคม": 5, "มิถุนายน": 6,
    "กรกฎาคม": 7, "สิงหาคม": 8, "กันยายน": 9, "ตุลาคม": 10, "พฤศจิกายน": 11, "ธันวาคม": 12,
  };
  const engMonths: Record<string, number> = {
    january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
    july: 7, august: 8, september: 9, oct: 10, october: 10, nov: 11, november: 11, dec: 12, december: 12,
    sep: 9, sept: 9,
  };

  function parseSpecificMonth(raw: string): { month: number; year: number } | null {
    const text = raw.toLowerCase().trim();
    if (!text) return null;

    const now = new Date();
    let year: number | undefined;
    // Patterns for year: ปี 2023, ปี2023, 2023
    const yearMatch = text.match(/(ปี\s*นี้|ปี\s*(\d{4})|(\d{4}))/);
    if (yearMatch) {
      if (yearMatch[1] && yearMatch[1].includes("ปีนี้")) year = now.getFullYear();
      else year = parseInt(yearMatch[2] || yearMatch[3], 10);
    }
    if (!year) {
      // If they refer to "ปีนี้" implicitly or omit year, assume current
      if (/ปีนี้/.test(text) || /(this year|current year)/.test(text) || !/ปี\s*\d{4}/.test(text)) {
        year = now.getFullYear();
      }
    }

    // Numeric month: เดือน 9 / เดือนที่ 9
    const numericMonthMatch = text.match(/เดือน(?:ที่)?\s*(1[0-2]|0?[1-9])/);
    if (numericMonthMatch) {
      const m = parseInt(numericMonthMatch[1], 10);
      return { month: m, year: year || now.getFullYear() };
    }

    // Thai month names
    for (const [name, m] of Object.entries(thaiMonths)) {
      if (text.includes(name)) return { month: m, year: year || now.getFullYear() };
    }
    // English month names / abbreviations
    for (const [name, m] of Object.entries(engMonths)) {
      if (text.includes(name)) return { month: m, year: year || now.getFullYear() };
    }
    return null;
  }

  return new DynamicTool({
    name: "getSalesAnalytics",
    description: "Fetch ONLY required real-time sales data (today, yesterday, thisMonth, lastMonth, last3Months, last6Months, lastYear, summary). Input can be natural language.",
    func: async (input: string) => {
      try {
        // 1. Month-specific override BEFORE generic period inference
        const specific = parseSpecificMonth(input || "");
        if (specific) {
          const { month, year } = specific;
          // Compute month range
            const monthStart = new Date(year, month - 1, 1);
            const nextMonthStart = new Date(year, month, 1);
            const prevMonthStart = new Date(year, month - 2, 1);
            const prevMonthEnd = new Date(year, month - 1, 1);
            // Same month last year (YoY)
            const lastYearMonthStart = new Date(year - 1, month - 1, 1);
            const lastYearNextMonthStart = new Date(year - 1, month, 1);

            const [currentMonth, prevMonth, lastYearSame] = await Promise.all([
              aggregate(memberId, { start: monthStart, end: nextMonthStart }),
              aggregate(memberId, { start: prevMonthStart, end: prevMonthEnd }),
              aggregate(memberId, { start: lastYearMonthStart, end: lastYearNextMonthStart }),
            ]);

            const monthNamesTh = ["", "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
            const nameTh = monthNamesTh[month];

            const mom = prevMonth.amount > 0 ? (((currentMonth.amount - prevMonth.amount) / prevMonth.amount) * 100).toFixed(1) + "%" : "N/A";
            const yoy = lastYearSame.amount > 0 ? (((currentMonth.amount - lastYearSame.amount) / lastYearSame.amount) * 100).toFixed(1) + "%" : "N/A";

            return `ยอดขายเดือน ${nameTh} ${year}\nรวม: ${currentMonth.amount.toLocaleString()} THB (${currentMonth.count} orders)\nMoM: ${mom}\nYoY: ${yoy}`;
        }

        const period = inferPeriod(input || "");
        const data = await getSelectiveSalesData(memberId, period);
        if (period === "today") {
          const d: any = data;
          return `Today: ${d.today.amount.toLocaleString()} THB (${d.today.count} orders)\nYesterday: ${d.yesterday.amount.toLocaleString()} THB\nChange: ${d.changePct}`;
        }
        if (period === "thisMonth") {
          const d: any = data;
          return `This Month: ${d.thisMonth.amount.toLocaleString()} THB (${d.thisMonth.count} orders)\nLast Month: ${d.lastMonth.amount.toLocaleString()} THB\nGrowth: ${d.growthPct}\nDaily Avg: ${Math.round(d.dailyAverage).toLocaleString()} THB`;
        }
        if (period === "summary") {
          return "Summary fetched (today + month + 3/6 months + last year). Ask a specific period for lower cost.";
        }
        if (period === "last3Months") {
          const d: any = data;
          if (d.breakdown) {
            const lines = d.breakdown.map((m: any) => `- ${m.label}: ${m.amount.toLocaleString()} THB (${m.count} orders)`).join("\n");
            return `Last 3 Months (incl. current) Total: ${d.last3Months.amount.toLocaleString()} THB (${d.last3Months.count} orders)\n\nBreakdown:\n${lines}`;
          }
          return JSON.stringify(d);
        }
        if (period === "last6Months") {
          const d: any = data;
          if (d.breakdown6) {
            const lines = d.breakdown6.map((m: any) => `- ${m.label}: ${m.amount.toLocaleString()} THB (${m.count} orders)`).join("\n");
            return `Last 6 Months (incl. current) Total: ${d.last6Months.amount.toLocaleString()} THB (${d.last6Months.count} orders)\n\nBreakdown:\n${lines}`;
          }
          return JSON.stringify(d);
        }
        return JSON.stringify(data);
      } catch (e: any) {
        if (e instanceof Error && (e.message.includes("connection") || e.message.includes("network") || e.message.includes("timeout"))) {
          return "DATABASE_CONNECTION_ERROR";
        }
        return `Error: ${e?.message || "Unknown"}`;
      }
    },
  });
}

export async function getSalesAnalytics(req: Request, res: Response) {
  try {
    let memberId: string | undefined;
    const userPayload: any = (req as any).user;
    const userNumericId = userPayload?.id;
    if (userNumericId) {
      const member = await prisma.member.findFirst({ where: { userId: Number(userNumericId) } });
      memberId = member?.uniqueId;
    }
    if (!memberId) return res.status(401).json({ error: "Unauthorized" });
    const { period = "summary" } = (req.query || {}) as { period?: SalesPeriod };
    const data = await getSelectiveSalesData(memberId, period as SalesPeriod);
    res.json({ success: true, period, data });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to get sales analytics" });
  }
}
