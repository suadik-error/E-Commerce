import InternalMessage from "../model/internalMessage.model.js";

const CHAT_LIMIT = 200;

export const getInternalMessages = async (_req, res) => {
  try {
    const messages = await InternalMessage.find({})
      .sort({ createdAt: -1 })
      .limit(CHAT_LIMIT)
      .lean();

    res.status(200).json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch internal messages" });
  }
};

export const createInternalMessage = async (req, res) => {
  try {
    const content = String(req.body?.content || "").trim();
    if (!content) {
      return res.status(400).json({ message: "Message content is required" });
    }

    const message = await InternalMessage.create({
      sender: req.user._id,
      senderName: req.user.name || "Unknown",
      senderRole: req.user.role,
      content,
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: "Failed to send internal message" });
  }
};
