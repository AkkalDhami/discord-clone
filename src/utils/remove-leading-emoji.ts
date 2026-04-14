export const removeLeadingEmoji = (value: string) => {
  return value.replace(
    /\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu,
    ""
  );
};
