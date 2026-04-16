import { prisma } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import {logger} from "../../utils/logger.js";

export const upsertMenuService = async (date, meals, tx = null) => {
  const db = tx || prisma;

  const allowedTypes = ["BREAKFAST", "LUNCH", "DINNER"];

  for (const meal of meals) {
    if (!allowedTypes.includes(meal.type)) {
      throw new AppError(`Invalid meal type: ${meal.type}`, 400);
    }
  }

  const food = await db.food.upsert({
    where: { date: new Date(date) },
    update: {},
    create: { date: new Date(date) }
  });

  const incomingTypes = meals.map(m => m.type);

  await db.meal.deleteMany({
    where: {
      foodId: food.id,
      NOT: {
        type: { in: incomingTypes }
      }
    }
  });

  for (const meal of meals) {

    const upsertedMeal = await db.meal.upsert({
      where: {
        foodId_type: {
          foodId: food.id,
          type: meal.type
        }
      },
      update: {},
      create: {
        type: meal.type,
        foodId: food.id
      }
    });

    await db.mealItem.deleteMany({
      where: { mealId: upsertedMeal.id }
    });

  
    if (!meal.items || !Array.isArray(meal.items) || meal.items.length === 0) {
      throw new AppError(`Meal ${meal.type} must have at least one item`, 400);
    }

    await db.mealItem.createMany({
      data: meal.items.map(item => ({
        name: item,
        mealId: upsertedMeal.id
      }))
    });
  }
logger.info("Menu upserted", {
  date,
  mealsCount: meals.length
});
  return food;
};

// Get menu by date — returns null if no menu set for that date
export const getMenuByDateService = async (date) => {
  const food = await prisma.food.findUnique({
    where: { date: new Date(date) },
    include: {
      meals: {
        include: { items: true }
      }
    }
  });

  // Return null instead of throwing — frontend handles "no menu" gracefully
  return food || null;
};



export const createWeeklyMenuService = async (startDate, menus) => {
  return await prisma.$transaction(async (tx) => {

    for (const menu of menus) {

      if (menu.day === undefined || !menu.meals) {
        throw new AppError("Each menu must have day and meals", 400);
      }

      const date = new Date(startDate);
      date.setDate(date.getDate() + menu.day);

      await upsertMenuService(date, menu.meals, tx);
    }

    return { success: true };
  });
};

export const getWeeklyMenuService = async (startDate) => {

  const start = new Date(startDate);

  const end = new Date(startDate);
  end.setDate(end.getDate() + 6); // 7 days total

  const menus = await prisma.food.findMany({
    where: {
      date: {
        gte: start,
        lte: end
      }
    },
    include: {
      meals: {
        include: {
          items: true
        }
      }
    },
    orderBy: {
      date: "asc"
    }
  });

  if (!menus.length) {
    return [];
  }

  return menus;
};