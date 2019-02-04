import { _throw } from "../helpers";
import { sendToUser, sendMessage } from "../rocket/bot";
import { getUserInfo } from "../rocket/api";
import { calculateAchievementsPosition } from "./calculateAchievementsPosition";
import { getLastAchievementRatingEarned } from "./achievements";

export const sendEarnedAchievementMessage = async (user, achievement) => {
  if (!user) {
    _throw("Error no user pass to send earned achievement messages");
  }

  const rocketUser = await getUserInfo(user.rocketId);

  if (rocketUser) {
    const privateMessage = `:medal: ${
      achievement.name
    }: Você acabou de conquistar ${achievement.rating}!`;

    const publicMessage = `:medal: ${user.name} acabou de conquistar ${
      achievement.rating
    } em ${achievement.name}`;

    await sendToUser(privateMessage, rocketUser.username);
    await sendMessage(publicMessage, "thais-tests");
  }
};

export const generateAchievementsMessages = achievements => {
  let messages = [];

  achievements = calculateAchievementsPosition(achievements);
  if (achievements.length) {
    achievements.map(achievement => {
      messages.push({
        text: `*${achievement.name}*:
        \n Você é ${achievement.rating.name} com ${achievement.total}/${
          achievement.rating.value
        }.`
      });
    });
  }

  return messages;
};

export const generateAchievementsTemporaryMessages = achievements => {
  let messages = [];

  achievements.map(achievement => {
    const currentAchievement = getLastAchievementRatingEarned(achievement);
    messages.push({
      text: `*${achievement.name}*:
      \n Você é ${currentAchievement.rating.name} ${
        currentAchievement.range.name
      } com total de ${currentAchievement.rating.total}.
      \n :trophy: Seu record é ${achievement.record.name} ${
        achievement.record.range
      } com total de ${achievement.record.total}.`
    });
  });

  return messages;
};

export const generateAchievementLevelMessage = achievement => {
  let messages = [];
  const lastRating = getLastAchievementRatingEarned(achievement);

  messages.push({
    text: `*Network | Nível*:
    \n Você é ${lastRating.rating.name} ${lastRating.range.name} com nível ${
      lastRating.range.value
    }.
    \n :trophy: Seu record é ${achievement.record.name} ${
      achievement.record.range
    } com nível ${achievement.record.level}.`
  });

  return messages;
};