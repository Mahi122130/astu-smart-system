import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * 1. STUDENT: Submit a Ticket
 */
export const submitTicket = async (req: any, res: Response): Promise<void> => {
  try {
    const { title, description, category } = req.body;
    if (!req.user) return res.status(401).json({ error: "Unauthorized. Please log in." });

    const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Create the Ticket
    const newTicket = await prisma.ticket.create({
      data: {
        title,
        description,
        category: category || "General",
        attachmentUrl: attachmentUrl, 
        student: { connect: { id: req.user.id } }
      } as Prisma.TicketCreateInput,
    });

    // Notify the submitting Student
    await prisma.notification.create({
      data: {
        message: `Your ticket "${title}" has been submitted successfully.`,
        userId: req.user.id
      }
    });

    // Notify all Staff/Admins
    const staffAndAdmins = await prisma.user.findMany({
      where: { role: { in: ['STAFF', 'ADMIN'] } },
      select: { id: true }
    });

    const staffNotifications = staffAndAdmins.map(user => ({
      userId: user.id,
      message: `New Complaint: "${title}" by ${req.user.name || 'a student'}.`
    }));

    if (staffNotifications.length > 0) {
      await prisma.notification.createMany({ data: staffNotifications });
    }

    res.status(201).json(newTicket);
  } catch (error: any) {
    console.error("Ticket Submission Error:", error);
    res.status(500).json({ error: "Submission failed: " + error.message });
  }
};

/**
 * 2. HISTORY: Role-based filtering
 */
export const getTicketHistory = async (req: any, res: Response): Promise<void> => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { id, role } = req.user;
    let whereClause: any = {};

    if (role === 'STUDENT') whereClause = { studentId: id };
    else if (role === 'STAFF') whereClause = { OR: [{ assignedToId: id }, { status: 'OPEN' }] };
    else if (role === 'ADMIN') whereClause = {}; 

    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      include: {
        student: { select: { name: true, email: true } },
        assignedTo: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tickets);
  } catch (error: any) {
    res.status(500).json({ error: "Could not retrieve ticket history." });
  }
};

/**
 * 3. UPDATE: Staff/Admin updates ticket
 */
export const updateTicket = async (req: any, res: Response): Promise<void> => {
  try {
    const { ticketId } = req.params;
    const { status, remarks, category } = req.body;
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const updateData: any = { status, remarks, category };

    if (req.user.role === 'STAFF') updateData.assignedTo = { connect: { id: req.user.id } };

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: updateData
    });

    // Notify Student of update
    const statusLabel = updatedTicket.status?.toLowerCase().replace('_', ' ');
    await prisma.notification.create({
      data: {
        message: `Update: Your ticket "${updatedTicket.title}" is now ${statusLabel}.`,
        userId: updatedTicket.studentId
      }
    });

    res.json(updatedTicket);
  } catch (error: any) {
    console.error("Update Error:", error);
    res.status(500).json({ error: "Update failed: " + error.message });
  }
};

/**
 * 4. Analytics Dashboard
 */
export const getAnalytics = async (req: any, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Access denied." });

    const [total, open, resolved] = await Promise.all([
      prisma.ticket.count(),
      prisma.ticket.count({ where: { status: 'OPEN' } }),
      prisma.ticket.count({ where: { status: 'RESOLVED' } })
    ]);

    res.json({ total, open, resolved });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load analytics." });
  }
};

/**
 * 5. Ask AI - Gemini
 */
export const askAIHelp = async (req: any, res: Response) => {
  try {
    const { prompt } = req.body;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    await prisma.chatMessage.create({
      data: { role: "assistant", content: answer, userId: req.user.id }
    });

    res.json({ answer });
  } catch (error: any) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "AI Assistant error." });
  }
};

/**
 * 6. Chat History
 */
export const getChatHistory = async (req: any, res: Response) => {
  try {
    const history = await prisma.chatMessage.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'asc' }
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chat history." });
  }
};

/**
 * 7. Notifications (Fixed)
 */
export const getNotifications = async (req: any, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    let notifications;
    if (req.user.role === 'STUDENT') {
      notifications = await prisma.notification.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // Staff/Admin see all notifications
      notifications = await prisma.notification.findMany({
        orderBy: { createdAt: 'desc' }
      });
    }

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications." });
  }
};

export const markNotificationRead = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    if (id) {
      await prisma.notification.update({ where: { id }, data: { isRead: true } });
    } else {
      await prisma.notification.updateMany({
        where: req.user.role === 'STUDENT' ? { userId: req.user.id, isRead: false } : { isRead: false },
        data: { isRead: true }
      });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error marking notifications read:", error);
    res.status(500).json({ error: "Failed to update notification status." });
  }
};