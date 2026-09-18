const getBaseEmailWrapper = (contentHtml, ctaUrl = "http://localhost:3000", ctaText = "Open MessBuddy") => {
  return `
    <div style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      max-width: 580px;
      margin: 0 auto;
      background-color: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 16px;
      overflow: hidden;
      color: #f8fafc;
    ">
      <div style="
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        padding: 24px 30px;
        border-bottom: 1px solid #334155;
        display: flex;
        align-items: center;
      ">
        <h2 style="
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: #f8fafc;
          letter-spacing: -0.5px;
        ">
          🍽️ <span style="color: #60a5fa;">Mess</span><span style="color: #facc15;">Buddy</span>
        </h2>
      </div>

      <div style="padding: 30px;">
        ${contentHtml}

        <div style="margin-top: 30px; margin-bottom: 25px;">
          <a
            href="${ctaUrl}"
            style="
              display: inline-block;
              background-color: #2563eb;
              color: #ffffff;
              font-size: 15px;
              font-weight: 600;
              text-decoration: none;
              padding: 12px 26px;
              border-radius: 10px;
              text-align: center;
            "
          >
            ${ctaText}
          </a>
        </div>

        <hr style="border: 0; border-top: 1px solid #1e293b; margin: 25px 0 20px 0;" />

        <p style="
          margin: 0;
          font-size: 13px;
          color: #94a3b8;
          line-height: 1.5;
        ">
          MessBuddy — Your Campus Food Companion 🍛<br />
          You received this email based on your notification preferences.
        </p>
      </div>
    </div>
  `
}

export const renderMealReminderEmail = ({
  username,
  restaurantName,
  mealName,
  minutesBefore,
  timing,
  dishes = [],
  ctaUrl,
}) => {
  const dishesListHtml =
    dishes && dishes.length > 0
      ? dishes
          .map(
            (d) =>
              `<li style="margin-bottom: 6px; color: #f1f5f9; font-size: 14px;">${d}</li>`
          )
          .join("")
      : `<li style="color: #94a3b8; font-style: italic;">Standard thali / daily menu</li>`

  const content = `
    <p style="font-size: 16px; margin: 0 0 16px 0; color: #cbd5e1;">
      Hi <strong style="color: #ffffff;">${username}</strong>,
    </p>

    <h3 style="font-size: 18px; font-weight: 600; color: #facc15; margin: 0 0 12px 0;">
      🍛 ${mealName} at ${restaurantName} starts in ${minutesBefore} minutes!
    </h3>

    <div style="
      background-color: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 18px 20px;
      margin: 18px 0;
    ">
      <div style="font-size: 13px; font-weight: 600; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px; margin-bottom: 8px;">
        Today's Menu
      </div>
      <ul style="margin: 0; padding-left: 20px;">
        ${dishesListHtml}
      </ul>

      ${
        timing
          ? `<div style="margin-top: 14px; font-size: 13px; color: #60a5fa; font-weight: 500;">
              🕒 Timing: ${timing}
            </div>`
          : ""
      }
    </div>

    <p style="font-size: 15px; color: #cbd5e1; margin: 0;">
      Enjoy your meal! 🍛
    </p>
  `

  return {
    subject: `🍛 ${mealName} starts in ${minutesBefore} minutes — MessBuddy`,
    html: getBaseEmailWrapper(content, ctaUrl, "Open MessBuddy"),
  }
}

export const renderFavoriteFoodAvailableEmail = ({
  username,
  restaurantName,
  dish,
  price,
  ctaUrl,
}) => {
  const content = `
    <p style="font-size: 16px; margin: 0 0 16px 0; color: #cbd5e1;">
      Hi <strong style="color: #ffffff;">${username}</strong>,
    </p>

    <h3 style="font-size: 18px; font-weight: 600; color: #f43f5e; margin: 0 0 12px 0;">
      ❤️ Your favorite is available!
    </h3>

    <div style="
      background-color: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 18px 20px;
      margin: 18px 0;
    ">
      <p style="margin: 0 0 8px 0; font-size: 17px; font-weight: 600; color: #ffffff;">
        "${dish}" is now available at ${restaurantName}.
      </p>
      ${
        price !== null && price !== undefined
          ? `<span style="display: inline-block; background-color: #10b981; color: #ffffff; font-size: 14px; font-weight: 700; padding: 4px 10px; border-radius: 6px;">
              ₹${price}
            </span>`
          : ""
      }
    </div>

    <p style="font-size: 15px; color: #cbd5e1; margin: 0;">
      Open MessBuddy to check today's full menu before it runs out!
    </p>
  `

  return {
    subject: `❤️ Your favorite is available! — MessBuddy`,
    html: getBaseEmailWrapper(content, ctaUrl, "Check Menu on MessBuddy"),
  }
}

export const renderAlmostFinishedEmail = ({
  username,
  restaurantName,
  dish,
  ctaUrl,
}) => {
  const content = `
    <p style="font-size: 16px; margin: 0 0 16px 0; color: #cbd5e1;">
      Hi <strong style="color: #ffffff;">${username}</strong>,
    </p>

    <h3 style="font-size: 18px; font-weight: 600; color: #fbbf24; margin: 0 0 12px 0;">
      ⚠️ Almost finished!
    </h3>

    <div style="
      background-color: #1e293b;
      border-left: 4px solid #fbbf24;
      border-radius: 10px;
      padding: 18px 20px;
      margin: 18px 0;
    ">
      <p style="margin: 0; font-size: 16px; color: #f1f5f9; line-height: 1.5;">
        Your favorite <strong>"${dish}"</strong> at <strong>${restaurantName}</strong> is running low.
      </p>
    </div>

    <p style="font-size: 15px; color: #cbd5e1; margin: 0;">
      If you want it, now might be a good time to check MessBuddy!
    </p>
  `

  return {
    subject: `⚠️ Almost finished! "${dish}" is running low — MessBuddy`,
    html: getBaseEmailWrapper(content, ctaUrl, "View on MessBuddy"),
  }
}

export const renderRestaurantOpenEmail = ({
  username,
  restaurantName,
  currentMeal,
  ctaUrl,
}) => {
  const content = `
    <p style="font-size: 16px; margin: 0 0 16px 0; color: #cbd5e1;">
      Hi <strong style="color: #ffffff;">${username}</strong>,
    </p>

    <h3 style="font-size: 18px; font-weight: 600; color: #10b981; margin: 0 0 12px 0;">
      🟢 Your favorite mess is open!
    </h3>

    <div style="
      background-color: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 18px 20px;
      margin: 18px 0;
    ">
      <p style="margin: 0 0 8px 0; font-size: 16px; color: #ffffff;">
        <strong>${restaurantName}</strong> is now open and serving fresh meals.
      </p>
      ${
        currentMeal
          ? `<p style="margin: 0; font-size: 14px; color: #60a5fa;">
              Currently serving: <strong>${currentMeal}</strong>
            </p>`
          : ""
      }
    </div>

    <p style="font-size: 15px; color: #cbd5e1; margin: 0;">
      Check out today's offerings and live status on MessBuddy.
    </p>
  `

  return {
    subject: `🟢 Your favorite mess is open! — MessBuddy`,
    html: getBaseEmailWrapper(content, ctaUrl, "Open MessBuddy"),
  }
}

export const renderAISuggestionEmail = ({
  username,
  restaurantName,
  dish,
  price,
  rating,
  note,
  ctaUrl,
}) => {
  const content = `
    <p style="font-size: 16px; margin: 0 0 16px 0; color: #cbd5e1;">
      Hi <strong style="color: #ffffff;">${username}</strong>,
    </p>

    <h3 style="font-size: 18px; font-weight: 600; color: #a855f7; margin: 0 0 12px 0;">
      🤖 MessBuddy AI has a suggestion
    </h3>

    <div style="
      background-color: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 18px 20px;
      margin: 18px 0;
    ">
      <p style="margin: 0 0 12px 0; font-size: 15px; color: #cbd5e1;">
        Based on your preferences, today's <strong>${dish}</strong> at <strong>${restaurantName}</strong> looks like a great match for you:
      </p>

      <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
        <span style="background-color: #10b981; color: #ffffff; font-size: 14px; font-weight: 700; padding: 4px 10px; border-radius: 6px;">
          ₹${price}
        </span>
        ${
          rating
            ? `<span style="background-color: #eab308; color: #111827; font-size: 13px; font-weight: 700; padding: 4px 10px; border-radius: 6px;">
                ⭐ ${rating}
              </span>`
            : ""
        }
        <span style="background-color: #334155; color: #94a3b8; font-size: 13px; padding: 4px 10px; border-radius: 6px;">
          Currently available
        </span>
      </div>

      ${
        note
          ? `<p style="margin: 12px 0 0 0; font-size: 13px; color: #94a3b8; font-style: italic;">
              ${note}
            </p>`
          : ""
      }
    </div>

    <p style="font-size: 15px; color: #cbd5e1; margin: 0;">
      Open MessBuddy to view reviews or order.
    </p>
  `

  return {
    subject: `🤖 MessBuddy AI recommendation: ${dish} — MessBuddy`,
    html: getBaseEmailWrapper(content, ctaUrl, "View Suggestion on MessBuddy"),
  }
}
