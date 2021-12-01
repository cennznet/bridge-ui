const axios = require("axios");

async function getCENNZnetReleases() {
  let filename;
  let downloadUrl;

  const response = await axios.get(
    "https://api.github.com/repos/cennznet/extension/releases"
  );

  filename = response.data[1].assets[0].name;
  downloadUrl = response.data[1].assets[0].browser_download_url;

  console.log("filename", filename);
  console.log("downloadUrl", downloadUrl);

  return {
    filename,
    downloadUrl,
  };
}

getCENNZnetReleases("latest");
