import { io } from '../index.js';
import { Conversation, Message, User } from '../models/index.js';
import { generateErrorResponse } from '../utils/response.js';

const getConversations = async (req, res) => {
  try {
    const { _id } = req.user;

    const conversations = await Conversation.find({ participants: _id })
      .populate('participants', 'name username avatar bio')
      .populate('lastMessage')
      .sort({ updatedAt: -1 })
      .lean();

    const formattedConversations = conversations.map((conv) => {
      const otherParticipant = conv.participants.find(
        (p) => p._id.toString() !== _id.toString()
      );
      return {
        ...conv,
        otherParticipant,
      };
    });

    res.send(formattedConversations);
  } catch (error) {
    res.status(500).json(error);
  }
};

const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .lean();

    res.send(messages);
  } catch (error) {
    res.status(500).json(error);
  }
};

const getOrCreateConversationWithUser = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { userId } = req.params;

    const targetUser = await User.findById(userId).lean();
    if (!targetUser) {
      return res.status(404).json(generateErrorResponse('user.notFound'));
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, userId] },
    })
      .populate('participants', 'name username avatar bio')
      .lean();

    if (!conversation) {
      const newConv = new Conversation({
        participants: [currentUserId, userId],
      });
      await newConv.save();
      conversation = await Conversation.findById(newConv._id)
        .populate('participants', 'name username avatar bio')
        .lean();
    }

    const messages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .lean();

    const otherParticipant = conversation.participants.find(
      (p) => p._id.toString() !== currentUserId.toString()
    );

    res.send({
      conversation: {
        ...conversation,
        otherParticipant,
      },
      messages,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId, text } = req.body;

    if (!receiverId || !text || !text.trim()) {
      return res.status(400).json(generateErrorResponse('message.invalidData'));
    }

    const targetUser = await User.findById(receiverId).lean();
    if (!targetUser) {
      return res.status(404).json(generateErrorResponse('user.notFound'));
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId],
      });
      await conversation.save();
    }

    const message = new Message({
      conversationId: conversation._id,
      senderId,
      receiverId,
      text: text.trim(),
    });
    await message.save();

    conversation.lastMessage = message._id;
    await conversation.save();

    const populatedMessage = await Message.findById(message._id).lean();

    // Broadcast message:receive event to both participants' rooms
    io.to(`${receiverId}`).emit('message:receive', populatedMessage);
    io.to(`${senderId}`).emit('message:receive', populatedMessage);

    res.send(populatedMessage);
  } catch (error) {
    res.status(500).json(error);
  }
};

const deleteConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json(generateErrorResponse('conversation.notFound'));
    }

    if (!conversation.participants.some((p) => p.toString() === userId.toString())) {
      return res.status(403).json(generateErrorResponse('auth.accessDenied'));
    }

    await Message.deleteMany({ conversationId });
    await Conversation.deleteOne({ _id: conversationId });

    const otherParticipantId = conversation.participants.find(
      (p) => p.toString() !== userId.toString()
    );

    if (otherParticipantId) {
      io.to(`${otherParticipantId}`).emit('conversation:delete', { conversationId });
    }
    io.to(`${userId}`).emit('conversation:delete', { conversationId });

    res.sendStatus(200);
  } catch (error) {
    res.status(500).json(error);
  }
};

const messageCtrl = {
  getConversations,
  getMessages,
  getOrCreateConversationWithUser,
  sendMessage,
  deleteConversation,
};

export default messageCtrl;
