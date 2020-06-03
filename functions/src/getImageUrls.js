const admin = require('./utils/admin')

const getImageUrls = async () => {
  const downloadUrls = {}
  const filess = await admin
    .storage()
    .bucket('gs://tinanh-8f0ba.appspot.com')
    .getFiles()

  for (const files of filess) {
    for (const file of files) {
      const fileName = file.metadata.name

      if (fileName.startsWith('images/')) {
        const formatted = fileName
          .replace('images/', '')
          .replace('_400x400', '')
          .replace('.png', '')

        const downloadUrl = (
          await file.getSignedUrl({
            action: 'read',
            expires: '01-01-2121',
          })
        )[0]

        if (formatted) {
          if (!downloadUrls[formatted]) {
            downloadUrls[formatted] = {}
          }
          if (fileName.includes('_400x400')) {
            downloadUrls[formatted].thumbnail = downloadUrl
          } else {
            downloadUrls[formatted].uri = downloadUrl
          }
        }
      }
    }
  }
  const final = Object.keys(downloadUrls).map(name => ({
    uri: downloadUrls[name].uri,
    thumbnail: downloadUrls[name].thumbnail,
  }))
  return final
}

getImageUrls()

module.exports = getImageUrls
