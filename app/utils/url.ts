export const shareUrlBase = "https://warpcast.com/~/compose?text=";
export const embedParam = "&embeds[]=";
export const shareText = encodeURIComponent(
  "Add comments to NFTs and enjoy!\n"
);

export const getImageUrl = (key: string) => {
  const filePath = "images/" + key + ".png";
  const encodedFilePath = encodeURIComponent(filePath);
  const imageUrl =
    `https://firebasestorage.googleapis.com/v0/b/${"image-comment-frame.appspot.com"}/o/${encodedFilePath}?alt=media` +
    "&reload=" +
    new Date().getTime();
  return imageUrl;
};
