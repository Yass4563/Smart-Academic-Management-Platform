import { createAnnouncement, listAnnouncements } from "../services/announcements.js";
import { sendTelegramMessage } from "../services/telegram.js";

export async function getAnnouncements(req, res, next) {
  try {
    const announcements = await listAnnouncements();
    return res.json({ announcements });
  } catch (error) {
    return next(error);
  }
}

export async function createAnnouncementHandler(req, res, next) {
  try {
    const id = await createAnnouncement({
      createdBy: req.user.id,
      title: req.body.title,
      message: req.body.message,
    });

    await sendTelegramMessage(`Announcement: ${req.body.title}\n${req.body.message}`);

    return res.status(201).json({ id });
  } catch (error) {
    return next(error);
  }
}
