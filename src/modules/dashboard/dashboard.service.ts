import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../../config/database";

interface DateRange {
  gte: Date;
  lte: Date;
}

interface DateFilter {
  startDate?: string;
  endDate?: string;
}

export class DashboardService {
  private getDateRange(filter: DateFilter): DateRange {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (filter.startDate) {
      startDate = new Date(filter.startDate);
    } else {
      // First day of current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    if (filter.endDate) {
      endDate = new Date(filter.endDate);
    } else {
      endDate = now;
    }

    return { gte: startDate, lte: endDate };
  }

  async getSummary(filter: DateFilter) {
    const dateRange = this.getDateRange(filter);

    const [incomeAgg, expenseAgg, totalCount, incomeCount, expenseCount] =
      await Promise.all([
        prisma.transaction.aggregate({
          where: {
            type: "INCOME",
            date: { gte: dateRange.gte, lte: dateRange.lte },
            deletedAt: null,
          },
          _sum: { amount: true },
          _count: true,
        }),
        prisma.transaction.aggregate({
          where: {
            type: "EXPENSE",
            date: { gte: dateRange.gte, lte: dateRange.lte },
            deletedAt: null,
          },
          _sum: { amount: true },
          _count: true,
        }),
        prisma.transaction.count({
          where: {
            date: { gte: dateRange.gte, lte: dateRange.lte },
            deletedAt: null,
          },
        }),
        prisma.transaction.count({
          where: {
            type: "INCOME",
            date: { gte: dateRange.gte, lte: dateRange.lte },
            deletedAt: null,
          },
        }),
        prisma.transaction.count({
          where: {
            type: "EXPENSE",
            date: { gte: dateRange.gte, lte: dateRange.lte },
            deletedAt: null,
          },
        }),
      ]);

    const totalIncome = incomeAgg._sum.amount
      ? Number(incomeAgg._sum.amount)
      : 0;
    const totalExpenses = expenseAgg._sum.amount
      ? Number(expenseAgg._sum.amount)
      : 0;
    const netBalance = totalIncome - totalExpenses;
    const savingsRate =
      totalIncome > 0
        ? Math.round((netBalance / totalIncome) * 100 * 100) / 100
        : 0;

    return {
      period: {
        startDate: dateRange.gte,
        endDate: dateRange.lte,
      },
      totalIncome,
      totalExpenses,
      netBalance,
      savingsRate,
      transactionCount: totalCount,
      incomeTransactions: incomeCount,
      expenseTransactions: expenseCount,
    };
  }

  async getCategoryBreakdown(filter: DateFilter) {
    const dateRange = this.getDateRange(filter);

    const grouped = await prisma.transaction.groupBy({
      by: ["categoryId", "type"],
      where: {
        date: { gte: dateRange.gte, lte: dateRange.lte },
        deletedAt: null,
      },
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: "desc" } },
    });

    const categoryIds = [...new Set(grouped.map((g) => g.categoryId))];
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });

    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    const breakdown = grouped.map((g) => ({
      categoryId: g.categoryId,
      categoryName: categoryMap.get(g.categoryId) || "Unknown",
      type: g.type,
      total: g._sum.amount ? Number(g._sum.amount) : 0,
      count: g._count,
    }));

    return breakdown.sort((a, b) => b.total - a.total);
  }

  async getMonthlyTrends(months: number = 6) {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months, 1);

    const transactions = await prisma.transaction.findMany({
      where: {
        date: { gte: startDate, lte: now },
        deletedAt: null,
      },
      select: {
        amount: true,
        type: true,
        date: true,
      },
    });

    const monthlyMap = new Map<
      string,
      { income: number; expense: number; net: number }
    >();

    for (const tx of transactions) {
      const year = tx.date.getFullYear();
      const month = String(tx.date.getMonth() + 1).padStart(2, "0");
      const monthKey = `${year}-${month}`;

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { income: 0, expense: 0, net: 0 });
      }

      const monthData = monthlyMap.get(monthKey)!;
      const amount = Number(tx.amount);

      if (tx.type === "INCOME") {
        monthData.income += amount;
      } else {
        monthData.expense += amount;
      }

      monthData.net = monthData.income - monthData.expense;
    }

    const trends = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        ...data,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return trends;
  }

  async getRecentActivity(limit: number = 10) {
    const transactions = await prisma.transaction.findMany({
      where: { deletedAt: null },
      include: {
        category: {
          select: { id: true, name: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return transactions;
  }
}
