export const shareUrlBase = "https://warpcast.com/~/compose?text=";
export const embedParam = "&embeds[]=";
export const shareText = encodeURIComponent(
  "Add comments to NFTs and enjoy!\n"
);

export const getZoraUrl = (key: string) => {
  const zoraBaseUrl = "https://zora.co/collect/";
  const referrer = "?referrer=0xa989173a1545eedF7a0eBE49AC51Dd1383F7EbC8";

  const path = key.replace(/:(?=[^:]*$)/, "/");

  return `${zoraBaseUrl}${path}${referrer}`;
};
export const getImageUrl = (key: string) => {
  const filePath = "images/" + key + ".png";
  const encodedFilePath = encodeURIComponent(filePath);
  const imageUrl =
    `https://firebasestorage.googleapis.com/v0/b/${"image-comment-frame.appspot.com"}/o/${encodedFilePath}?alt=media` +
    "&reload=" +
    new Date().getTime();
  return imageUrl;
};
