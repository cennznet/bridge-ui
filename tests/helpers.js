const axios = require("axios");
const fs = require("fs");
const zip = require("cross-zip");
const path = require("path");

module.exports = {
  getSynpressPath: () => {
    return "node_modules/@synthetixio/synpress";
  },
  getCENNZnetReleases: async () => {
    let filename;
    let downloadUrl;

    const response = await axios.get(
      "https://api.github.com/repos/cennznet/extension/releases"
    );

    filename = response.data[0].assets[0].name;
    downloadUrl = response.data[0].assets[0].browser_download_url;

    return {
      filename,
      downloadUrl,
    };
  },
  download: async (url, destination) => {
    const writer = fs.createWriteStream(destination);
    const result = await axios({
      url,
      method: "GET",
      responseType: "stream",
    });
    await new Promise((resolve) =>
      result.data.pipe(writer).on("finish", resolve)
    );
  },
  extract: async (file, destination) => {
    await zip.unzip(file, destination);
  },
  prepareCENNZnet: async () => {
    const release = await module.exports.getCENNZnetReleases();
    const downloadsDirectory = path.resolve(__dirname, "downloads");
    if (!fs.existsSync(downloadsDirectory)) {
      fs.mkdirSync(downloadsDirectory);
    }
    const downloadDestination = path.join(downloadsDirectory, release.filename);
    await module.exports.download(release.downloadUrl, downloadDestination);
    const CENNZnetDirectory = path.join(downloadsDirectory, "CENNZnet");
    await module.exports.extract(downloadDestination, CENNZnetDirectory);
    return CENNZnetDirectory;
  },
};
