import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface SearchResult {
  tasks: any[];
  projects: any[];
  users: any[];
}

export const search = async (req: Request, res: Response): Promise<void> => {
  const { query } = req.query;

  // Validate query parameter
  if (!query || typeof query !== 'string' || query.trim().length < 3) {
    res.status(400).json({
      message: 'Search query must be at least 3 characters long'
    });
    return;
  }

  const searchTerm = query.toString().trim();

  try {
    // Execute all searches in parallel
    const [tasks, projects, users] = await Promise.all([
      prisma.task.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          dueDate: true,
          // Add other fields you need
        },
      }),
      prisma.project.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          description: true,
          startDate: true,
          endDate: true,
          // Add other fields you need
        },
      }),
      prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        select: {
          username: true,
        },
      }),
    ]);

    const result: SearchResult = { tasks, projects, users };

    // Add count metadata
    const response = {
      ...result,
      meta: {
        totalResults: tasks.length + projects.length + users.length,
        tasksCount: tasks.length,
        projectsCount: projects.length,
        usersCount: users.length,
      }
    };

    res.json(response);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Search error:', error);
    res.status(500).json({
      message: 'Error performing search',
      error: errorMessage
    });
  } finally {
    await prisma.$disconnect();
  }
};