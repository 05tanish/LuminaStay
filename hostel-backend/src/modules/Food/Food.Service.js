import { prisma } from "../../config/db.js";
import AppError from "../../utils/AppError.js";

export const upsertMenuService = async (date, meals) => {
  return await prisma.$transaction(async (tx) => {

    // Validate meal types
    const allowedTypes = ["BREAKFAST", "LUNCH", "DINNER"];
    for (const meal of meals) {
      if (!allowedTypes.includes(meal.type)) {
        throw new AppError(`Invalid meal type: ${meal.type}`, 400);
      }
    }

    // 1️⃣ create or get food
    const food = await tx.food.upsert({
      where: { date: new Date(date) },
      update: {},
      create: { date: new Date(date) }
    });

    const incomingTypes = meals.map(m => m.type);

    // 2️⃣ delete removed meals
    await tx.meal.deleteMany({
      where: {
        foodId: food.id,
        NOT: {
          type: { in: incomingTypes }
        }
      }
    });

    // 3️⃣ upsert meals + items
    for (const meal of meals) {

      const upsertedMeal = await tx.meal.upsert({
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

      // replace items
      await tx.mealItem.deleteMany({
        where: { mealId: upsertedMeal.id }
      });

      await tx.mealItem.createMany({
        data: meal.items.map(item => ({
          name: item,
          mealId: upsertedMeal.id
        }))
      });
    }

    return food;
  });
};


// Get menu by date
export const getMenuByDateService = async (date) => {

  const food = await prisma.food.findUnique({
    where: { date: new Date(date) },
    include: {
      meals: {
        include: {
          items: true
        }
      }
    }
  });

  if (!food) {
    throw new AppError("Menu not found", 404);
  }

  return food;
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