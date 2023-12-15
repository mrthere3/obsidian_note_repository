/*
 * @FilePath        : \ob-templates\Templater-Scripts\Get_photo.js
 * @Description     : 获取bing图片
 * @HomePage        : https://github.com/dmscode/Obsidian-Templates
 */
async function get_photo() {
  const response = await fetch("https://bing.img.run/rand.php")
  const imgurl = await response.url
  return imgurl
}
module.exports = get_photo; 