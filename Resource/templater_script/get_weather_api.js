/*
 * @Author          : 稻米鼠
 * @Date            : 2022-11-22 13:18:46
 * @LastEditTime    : 2022-11-26 08:48:27
 * @FilePath        : \ob-templates\Templater-Scripts\Get_Weather.js
 * @Description     : 获取天气
 * @HomePage        : https://github.com/dmscode/Obsidian-Templates
 */
async function get_weather_api (city=101190101) {
  const response = await fetch("https://devapi.qweather.com/v7/weather/3d?location="+city+"&key=ecc514cf2a894e3fa82dbd06b3d890d7")
  const data = await response.json()
  console.log(data)
  today = data.daily[0]
  format = "天气:"+ today['textDay'] +"  气温Min:"+today["tempMin"]+"  气温Max:"+today["tempMax"]+"  风力:"+today["windScaleDay"] +"  月相:"+ today["moonPhase"]+ "  日出时间:"+today["sunrise"]+"  日落时间:"+today["sunset"]
  return format
}
module.exports = get_weather_api;