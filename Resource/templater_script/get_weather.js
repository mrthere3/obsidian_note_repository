/*
 * @Author          : 稻米鼠
 * @Date            : 2022-11-22 13:18:46
 * @LastEditTime    : 2022-11-26 08:48:27
 * @FilePath        : \ob-templates\Templater-Scripts\Get_Weather.js
 * @Description     : 获取天气
 * @HomePage        : https://github.com/dmscode/Obsidian-Templates
 * 天气：%c %C 气温：%t 风力：%w  \\n月相：%m 日出时间：%S 日落时间：%s
 */
<<<<<<< HEAD
async function get_weather(
  city = "nanjing",
  format = "天气：%c %C 气温：%t 风力：%w ",
) {
  const response = await fetch(
    "https://wttr.in/" + city + "?Tm2&lang=zh-cn&format=" + format,
  );
  const data = await response.text();
  return data;
=======
async function get_weather(city = 'nanjing', format = "%c %C 气温：%t 风力：%w ") {
  const response = await fetch("https://wttr.in/" + city + "?Tm2&lang=zh-cn&format=" + format)
  const data = await response.text()
  return data
>>>>>>> 5abd68f03b37ec9482f9422948c50b66f79329bd
}
module.exports = get_weather;
