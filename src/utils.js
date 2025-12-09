export const checkValidUpdates = (updates, allowedUpdates) => {
  const failedUpdates = [];
  updates.forEach(update => {
    const validUpdate = allowedUpdates.includes(update);
    if (!validUpdate) {
      failedUpdates.push(update);
    }
  });
  return failedUpdates;
};

export const toTitleCase = (str) => {
  if (!str) return str;
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}