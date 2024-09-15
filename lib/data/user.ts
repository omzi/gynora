import prisma from '#/lib/prisma';

export const getUserByEmail = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    return user;
  } catch (error) {
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });

    return user;
  } catch (error) {
    console.error('Error fetching user :>>', error);
    return null;
  }
};

const calculatePercentageChange = (current: number | null, previous: number | null) => {
  if (current === null || previous === null) return 0;
  if (current === 0 && previous === 0) return 0;
  if (previous === 0) return current > 0 ? 100 : -100;

  return ((current - previous) / Math.abs(previous)) * 100;
};

const getWeeklyStats = async (userId: string, type: 'chat' | 'affirmation') => {
  const currentDate = new Date();
  const lastSunday = new Date(currentDate);
  lastSunday.setDate(currentDate.getDate() - currentDate.getDay());

  const weeklyCounts = Array(7).fill(0);

  for (let i = 0; i < 7; i++) {
    const day = new Date(lastSunday);
    day.setDate(lastSunday.getDate() + i);
    const startOfDay = new Date(day.setHours(0, 0, 0, 0));
    const endOfDay = new Date(day.setHours(23, 59, 59, 999));

    if (type === 'chat') {
      weeklyCounts[i] = await prisma.chat.count({
        where: {
          userId,
          startedAt: { gte: startOfDay, lte: endOfDay }
        }
      });
    } else if (type === 'affirmation') {
      weeklyCounts[i] = await prisma.affirmation.count({
        where: {
          userId,
          createdAt: { gte: startOfDay, lte: endOfDay }
        }
      });
    }
  }

  return [
    { name: 'Sun', value: weeklyCounts[0] },
    { name: 'Mon', value: weeklyCounts[1] },
    { name: 'Tue', value: weeklyCounts[2] },
    { name: 'Wed', value: weeklyCounts[3] },
    { name: 'Thu', value: weeklyCounts[4] },
    { name: 'Fri', value: weeklyCounts[5] },
    { name: 'Sat', value: weeklyCounts[6] }
  ];
};

export const getUserDataById = async (userId: string) => {
  try {
    const userData = await prisma.userData.findUnique({ where: { userId } });

    return userData;
  } catch (error) {
    console.error('Error fetching user data :>>', error);
    return null;
  }
};

export const getDashboardStats = async (userId: string) => {
  const currentDate = new Date();
  const firstDayOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const firstDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  const lastDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

  // Execute all counts concurrently
  const [
    totalChatsCurrentMonth,
    totalChatsLastMonth,
    totalFeedbackCurrentMonth,
    positiveFeedbackCount,
    totalFeedbackLastMonth,
    positiveFeedbackLastMonth,
    totalAffirmationsCurrentMonth,
    totalAffirmationsLastMonth,
    weeklyChatSessions,
    weeklyAffirmations,
  ] = await Promise.all([
    prisma.chat.count({
      where: {
        userId: userId,
        startedAt: { gte: firstDayOfCurrentMonth, lte: lastDayOfCurrentMonth }
      },
    }),
    prisma.chat.count({
      where: {
        userId: userId,
        startedAt: { gte: firstDayOfLastMonth, lte: lastDayOfLastMonth }
      },
    }),
    prisma.feedback.count({
      where: {
        chat: {
          userId: userId,
          createdAt: { gte: firstDayOfCurrentMonth, lte: lastDayOfCurrentMonth }
        },
      },
    }),
    prisma.feedback.count({
      where: {
        chat: {
          userId: userId,
          createdAt: { gte: firstDayOfCurrentMonth, lte: lastDayOfCurrentMonth }
        },
        rating: { gte: 4 }
      },
    }),
    prisma.feedback.count({
      where: {
        chat: {
          userId: userId,
          createdAt: { gte: firstDayOfLastMonth, lte: lastDayOfLastMonth }
        },
      },
    }),
    prisma.feedback.count({
      where: {
        chat: {
          userId: userId,
          createdAt: { gte: firstDayOfLastMonth, lte: lastDayOfLastMonth }
        },
        rating: { gte: 4 }
      },
    }),
    prisma.affirmation.count({
      where: {
        userId: userId,
        createdAt: { gte: firstDayOfCurrentMonth, lte: lastDayOfCurrentMonth }
      },
    }),
    prisma.affirmation.count({
      where: {
        userId: userId,
        createdAt: { gte: firstDayOfLastMonth, lte: lastDayOfLastMonth }
      },
    }),
    getWeeklyStats(userId, 'chat'),
    getWeeklyStats(userId, 'affirmation'),
  ]);

  // Calculate average session duration
  const calculateAverageSessionDuration = async (startDate: Date, endDate: Date) => {
    const chats = await prisma.chat.findMany({
      where: {
        userId: userId,
        startedAt: { gte: startDate, lte: endDate },
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    const durations = chats.map(chat => {
      if (chat.messages.length > 0) {
        const firstMessageTime = chat.messages[0].createdAt;
        const lastMessageTime = chat.messages[chat.messages.length - 1].createdAt;
        return (lastMessageTime.getTime() - firstMessageTime.getTime()) / 60000; // Duration in minutes
      }

      return 0;
    });

    const totalDuration = durations.reduce((sum, duration) => sum + duration, 0);
    return totalDuration / durations.length || 0;
  };

  const averageSessionDurationCurrentMonth = await calculateAverageSessionDuration(firstDayOfCurrentMonth, lastDayOfCurrentMonth);
  const averageSessionDurationLastMonth = await calculateAverageSessionDuration(firstDayOfLastMonth, lastDayOfLastMonth);

  const chatSessionChange = calculatePercentageChange(totalChatsCurrentMonth, totalChatsLastMonth);
  const averageSessionDurationChange = calculatePercentageChange(averageSessionDurationCurrentMonth, averageSessionDurationLastMonth);

  const userSatisfaction = (positiveFeedbackCount / totalFeedbackCurrentMonth) * 100 || 0;
  const lastMonthSatisfaction = (positiveFeedbackLastMonth / totalFeedbackLastMonth) * 100 || 0;
  const satisfactionChange = calculatePercentageChange(userSatisfaction, lastMonthSatisfaction);
  const affirmationChange = calculatePercentageChange(totalAffirmationsCurrentMonth, totalAffirmationsLastMonth);

  return {
    stats: {
      totalChats: totalChatsCurrentMonth,
      chatSessionChange,
      averageSessionDuration: averageSessionDurationCurrentMonth,
      averageSessionDurationChange,
      userSatisfaction,
      satisfactionChange,
      totalAffirmations: totalAffirmationsCurrentMonth,
      affirmationChange
    },
    charts: {
      chatSessionsThisWeek: weeklyChatSessions,
      affirmationsThisWeek: weeklyAffirmations
    }
  };
};
