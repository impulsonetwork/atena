import mongoose from 'mongoose'

export const providers = {
  rocketchat: 'rocketchat'
}

export const scoreTypes = {
  messageSent: 'messageSent',
  threadAnswered: 'threadAnswered',
  newAchievement: 'newAchievement',
  inactivity: 'inactivity',
  manual: 'manual'
}

export default new mongoose.Schema(
  {
    score: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      enum: Object.values(scoreTypes)
    },
    user: {
      type: String,
      required: true
    },
    details: {
      provider: String,
      messageId: String,
      sender: String,
      reason: String,
      room: Object,
      achievement: String,
      medal: String,
      range: String
    }
  },
  {
    timestamps: true
  }
)