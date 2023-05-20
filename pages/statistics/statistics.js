// pages/statistics/statistics.js
import * as echarts from '../../echarts-for-weixin/ec-canvas/echarts.js';



Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentChart: "",
    ec_visitor_heat: {
      // lazyLoad:true
      lazyLoad: true
    },
    ec_history_heat_rate: {
      // lazyLoad:true
      lazyLoad: true
    },
    ec_history_heat: {
      // lazyLoad:true
      lazyLoad: true
    },
    ec_content_list: {
      // lazyLoad:true
      lazyLoad: true
    },
    static_data: {
      "visitor_heat": [],
      "history_heat_rate": [],
      "history_heat": []
    },
    content_list: {},
    data_update_time: "",
    tips: "^点击选择要查看的数据",
    windowHeightRpx: 200,
    openid: "",
    status_color: {
      "所有": "#083677",
      "未审核": "#DCB011",
      "通过": "#33DD55",
      "拒绝": "#CC4444",
      "已发表": "#3388DD",
      "失败": "#663300",
      "取消":"#BB8888"
    },
    content_page_list: [1, ],
    timeline_max_length:480
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let ratio = 750.0 / wx.getSystemInfoSync().windowWidth
    console.log("ratio:" + ratio)
    this.setData({
      windowHeightRpx: getApp().globalData.windowHeight * ratio,
      openid: getApp().globalData.openID
    })
  },
  switchChart: function (e) {
    let that = this
    this.setData({
      currentChart: e.currentTarget.id
    })
    switch (e.currentTarget.id) {
      case "visitor_heat": {

        wx.request({
          url: getApp().globalData.using_host+'/events/fetchstaticdata',
          data: {
            key: "visitor_heat"
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
            if (res.data.result == "success") {
              that.ecComponent = that.selectComponent('#visitor_heat_chart_dom')
              that.data.static_data.visitor_heat = JSON.parse(res.data.content)
              that.setUpdateTime(res.data.timestamp)
              that.loadVisitorHeat()
              that.setData({
                tips: "*每周各时段的说说发出二十分钟内点赞量平均值(空白时段至今无数据)"
              })
            } else {
              that.setData({
                tips: "获取失败:" + res.data.result
              })
            }
          }
        })

        break
      }
      case "history_heat": {
        wx.request({
          url: getApp().globalData.using_host+'/events/fetchstaticdata',
          data: {
            key: "history_heat_rate"
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
            if (res.data.result == "success") {
              that.ec_history_heat_rate_component = that.selectComponent('#history_heat_rate_chart_dom')
              that.data.static_data.history_heat_rate = JSON.parse(res.data.content)
              // console.log(that.data.static_data.history_heat_rate)
              //查找最大值
              var max=0;
              for(let arr in that.data.static_data.history_heat_rate){
                if(that.data.static_data.history_heat_rate[arr][1]>max){
                  max=that.data.static_data.history_heat_rate[arr][1]
                }
              }
              that.setUpdateTime(res.data.timestamp)
              that.setData({
                tips: "*1.空间近100天日访客量；2.空间近15天总访客量曲线；由后台测算并分析，数据可能延迟",
                history_heat_rate_max_value:max
              })
              that.loadHistoryHeatRate()
            } else {
              that.setData({
                tips: "获取失败:" + res.data.result
              })
            }
          }
        })
        wx.request({
          url: getApp().globalData.using_host+'/events/fetchstaticdata',
          data: {
            key: "history_heat"
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
            if (res.data.result == "success") {
              that.data.static_data.history_heat = JSON.parse(res.data.content)

              that.setUpdateTime(res.data.timestamp)

              wx.request({
                url: getApp().globalData.using_host+'/events/fetchstaticdata',
                data: {
                  key: "history_heat_per_hour"
                },
                header: {
                  'content-type': 'application/json' // 默认值
                },
                success: function (res) {
                  if (res.data.result == "success") {
                    that.data.static_data.history_heat_per_hour = JSON.parse(res.data.content)


                    wx.request({
                      url: getApp().globalData.using_host+'/events/fetchstaticdata',
                      data: {
                        key: "history_emo_posted"
                      },
                      header: {
                        'content-type': 'application/json' // 默认值
                      },
                      success: function (res) {
                        if (res.data.result == "success") {
                          that.ec_history_heat_component = that.selectComponent('#history_heat_chart_dom')
                          that.data.static_data.history_emo_posted = JSON.parse(res.data.content)
                          that.setUpdateTime(res.data.timestamp)
                          that.loadHistoryHeat()
                        } else {
                          that.setData({
                            tips: "获取失败:" + res.data.result
                          })
                        }
                      }
                    })

                  } else {
                    that.setData({
                      tips: "获取失败:" + res.data.result
                    })
                  }
                }
              })



            } else {
              that.setData({
                tips: "获取失败:" + res.data.result
              })
            }
          }
        })

        break
      }
      case "content_list": {
        that.setData({
          tips: "*稿件及空间说说状态(4月30日起数据正常)"
        })
        wx.request({
          url: getApp().globalData.using_host+'/events/fetchcontents',
          data: {
            capacity: 12,
            page: 1
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
            if (res.data.result == "success") {
              that.ec_content_list_component = that.selectComponent('#content_list_chart_dom')

              //生成页码
              let pageamount = res.data.amt / 12
              if (res.data.amt % 12 != 0)
                pageamount++
              let page_list = []
              for (let i = 1; i <= pageamount; i++) {
                page_list[i - 1] = i
              }
              that.setData({
                content_page_list: page_list
              })


              //处理所有的时间轴
              let timeline_max_length0=1
              for (let i in res.data.contents) {
                var d = new Date(res.data.contents[i].timestamp * 1000); //根据时间戳生成的时间对象
                var date =
                  (d.getMonth() + 1) + "-" +
                  (d.getDate()) + " " +
                  (d.getHours()) + ":" +
                  (d.getMinutes()) + ":" +
                  (d.getSeconds());
                res.data.contents[i].time = date
                if (res.data.contents[i].status == '已发表' || res.data.contents[i].pid == -1) {
                  //十分钟 一小时 六小时的点赞情况
                  res.data.contents[i].timeline = {
                    max: 0
                  }
                  for (let j in res.data.contents[i].like_records) {
                    if (res.data.contents[i].like_records[j][1] == 600) {
                      res.data.contents[i].timeline.ten_minutes = res.data.contents[i].like_records[j][2]
                    } else if (res.data.contents[i].like_records[j][1] == 3600) {
                      res.data.contents[i].timeline.one_hour = res.data.contents[i].like_records[j][2]
                    } else if (res.data.contents[i].like_records[j][1] == 3600 * 6) {
                      res.data.contents[i].timeline.six_hours = res.data.contents[i].like_records[j][2]
                    }
                    res.data.contents[i].timeline.max = Math.max(res.data.contents[i].like_records[j][2], res.data.contents[i].timeline.max)
                    if(res.data.contents[i].timeline.max>timeline_max_length0){
                      timeline_max_length0=res.data.contents[i].timeline.max
                    }
                  }
                }
              }
              if(timeline_max_length0-30>0){
                timeline_max_length0-=30
              }
              that.setData({
                timeline_max_length:timeline_max_length0
              })
              console.log("timline_max_length")
              console.log(timeline_max_length0)

              console.log(res)
              that.setData({
                content_list: res.data
              })
              that.setUpdateTime(res.data.timestamp)
              that.loadContentList()
            } else {
              that.setData({
                tips: "获取失败:" + res.data.result
              })
            }
          }
        })

        break
      }
    }
  },
  loadVisitorHeat: function () {
    console.log("load visitor heat")
    let that = this
    this.ecComponent.init((canvas, width, height, dpr) => {

      var chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr // new
      });
      canvas.setChart(chart);

      var model = {
        yCates: ['23:00', '22:00', '21:00', '20:00', '19:00', '18:00', '17:00', '16:00', '15:00', '14:00', '13:00', '12:00', '11:00', '10:00', '9:00', '8:00', '7:00','2:00', '1:00', '0:00', ],
        xCates: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        data: that.data.static_data.visitor_heat
      };

      var data = model.data.map(function (item) {
        return [item[1], item[0], item[2] || '-'];
      });

      var option = {
        title: {
          top: 25,
          left: 'center',
          text: '周期时段点赞热力',
          textStyle: {
            color: "#668800"
          }
        },
        tooltip: {
          position: 'top'
        },
        animation: true,
        grid: {
          bottom: 40,
          top: 95,
          left: 65
        },
        xAxis: {
          type: 'category',
          data: model.xCates,
          splitArea: {
            show: true
          }
        },
        yAxis: {
          type: 'category',
          data: model.yCates,
          splitArea: {
            show: true
          }
        },
        visualMap: {
          min: 1,
          max: 150,
          show: true,
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          top: 45,
          inRange: {
            color: ["#37A2DA", "#32C5E9", "#67E0E3", "#91F2DE", "#FFDB5C", "#FF9F7F"],
          }
        },
        series: [{
          name: '点赞热力',
          type: 'heatmap',
          data: data,
          label: {
            normal: {
              show: true,
              color: "#fff"
            }
          },
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      };

      chart.setOption(option);
      return chart;
    })
  },
  loadHistoryHeatRate: function () {
    console.log("load history heat rate")
    let that = this

    this.ec_history_heat_rate_component.init((canvas, width, height, dpr) => {
      // 获取组件的 canvas、width、height 后的回调函数
      // 在这里初始化图表
      var chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr // new
      });
      canvas.setChart(chart);

      //计算起点终点
      let begin = getDateStr(-100),
        end = getDateStr(0)

      var option = {
        title: {
          top: 5,
          left: 'center',
          text: '近100天日访客量',
          textStyle: {
            color: "#668800"
          }
        },
        animation: true,
        tooltip: {
          show: true,
          showContent: true,
          formatter: function (params, ticket, callback) {
            return String(params["data"]).replaceAll(",", " 访客量:")
          }
        },
        visualMap: {
          min: 0,
          max: that.data.history_heat_rate_max_value,
          type: 'continuous',
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          top: 25,
          splitNumber: 3,
          precision: 0,
          inRange: {
            color: ["#37A2DA", "#32C5E9", "#67E0E3", "#91F2DE", "#FFDB5C", "#FF9F7F"],
            // color: ["#558855","#58F270"],
          }
        },
        calendar: {
          top: 90,
          left: 44,
          right: 20,
          bottom: 5,
          cellSize: [20, 25],
          range: [begin, end],
          itemStyle: {
            borderWidth: 0.5
          },
          yearLabel: {
            show: false
          },
          monthLabel: {
            show: true,
            nameMap: 'cn'
          },

          dayLabel: {
            firstDay: 1,
            nameMap: 'cn'
          }
        },
        series: {
          type: 'heatmap',
          coordinateSystem: 'calendar',
          data: that.data.static_data.history_heat_rate
        }
      };

      chart.setOption(option);
      return chart
    })
  },
  loadHistoryHeat: function () {
    console.log("load history heat")
    let that = this

    this.ec_history_heat_component.init((canvas, width, height, dpr) => {
      var chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr
      })
      canvas.setChart(chart)

      let xa = []

      let now = parseInt("" + new Date().getTime() / 1000)

      let beginning = now - 30 * 86400 - now % 86400 - 8 * 3600


      while (true) {
        let s = getTwoHourStr(beginning)
        // console.log(s)
        xa[xa.length] = s
        beginning += 3600 * 4
        if (beginning >= now) {
          break
        }
      }

      var option = {
        title: {
          top: 5,
          left: 'center',
          text: '空间近15天访客增长',
          textStyle: {
            color: "#668800"
          }
        },
        dataZoom: {
          type: 'slider',
          bottom: 25,
          height: 20,
          // start:75,
          // end:100,
          startValue: (now - 86400 * 7) * 1000,
          endValue: now * 1000
        },
        grid: {
          containLabel: true,
          top: 75,
          bottom: 45,
          left: 10,
          right: 10,
        },
        tooltip: {
          show: true,
          trigger: 'axis'
        },
        xAxis: {
          type: 'time',
          // boundaryGap: false,
          // data: xa,
          // show: false
        },
        legend: {
          top: 25,
        },
        yAxis: [{
            name: "⬇️访客量",
            x: 'center',
            type: 'value',
            nameGap: 10,
            splitLine: {
              lineStyle: {
                type: 'dashed'
              }
            },
            scale: true,
            // show: false
          },
          {
            name: "每小时增量⬇️   ",
            x: 'center',
            type: 'value',
            nameGap: 10,
            splitLine: {
              lineStyle: {
                type: 'dashed'
              }
            },
            scale: true,
            // show: false
          },
          {
            name: "说说发表⬆️",
            nameLocation: 'start',
            x: 'center',
            type: 'value',
            show: true,
            maxInterval: 20,
            minInterval: 1,
            splitLine: {
              lineStyle: {
                type: 'dashed'
              }
            },
            offset: 37,
            nameGap: 10,
            scale: true,
            // show: false
          }
        ],
        series: [{
          name: "说说发表",
          type: 'scatter',
          yAxisIndex: 2,
          z: 5,
          // symbol:'arrow',
          data: that.data.static_data.history_emo_posted
        }, {
          name: '访客量',
          type: 'line',
          smooth: true,
          z: 2,
          data: that.data.static_data.history_heat
        }, {
          name: '每小时增量',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          z: 2,
          data: that.data.static_data.history_heat_per_hour
        }, ]
      };

      chart.setOption(option);

      return chart
    })
  },
  loadContentList: function () {

  },
  switchContentListPage:function(e){
    let that=this
    wx.request({
      url: getApp().globalData.using_host+'/events/fetchcontents',
      data: {
        capacity: 12,
        page: e.currentTarget.id
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.result == "success") {
          that.ec_content_list_component = that.selectComponent('#content_list_chart_dom')

          //生成页码
          let pageamount = res.data.amt / 12
          if (res.data.amt % 12 != 0)
            pageamount++
          let page_list = []
          for (let i = 1; i <= pageamount; i++) {
            page_list[i - 1] = i
          }
          that.setData({
            content_page_list: page_list
          })


          //处理所有的时间轴
          let timeline_max_length0=1
          for (let i in res.data.contents) {
            var d = new Date(res.data.contents[i].timestamp * 1000); //根据时间戳生成的时间对象
            var date =
              (d.getMonth() + 1) + "-" +
              (d.getDate()) + " " +
              (d.getHours()) + ":" +
              (d.getMinutes()) + ":" +
              (d.getSeconds());
            res.data.contents[i].time = date
            if (res.data.contents[i].status == '已发表' || res.data.contents[i].pid == -1) {
              //十分钟 一小时 六小时的点赞情况
              res.data.contents[i].timeline = {
                max: 0
              }
              for (let j in res.data.contents[i].like_records) {
                if (res.data.contents[i].like_records[j][1] == 600) {
                  res.data.contents[i].timeline.ten_minutes = res.data.contents[i].like_records[j][2]
                } else if (res.data.contents[i].like_records[j][1] == 3600) {
                  res.data.contents[i].timeline.one_hour = res.data.contents[i].like_records[j][2]
                } else if (res.data.contents[i].like_records[j][1] == 3600 * 6) {
                  res.data.contents[i].timeline.six_hours = res.data.contents[i].like_records[j][2]
                }
                res.data.contents[i].timeline.max = Math.max(res.data.contents[i].like_records[j][2], res.data.contents[i].timeline.max)
                if(res.data.contents[i].timeline.max>timeline_max_length0){
                  timeline_max_length0=res.data.contents[i].timeline.max
                }
              }
            }
          }
          if(timeline_max_length0-30>0){
            timeline_max_length0-=30
          }
          console.log("timeline_max_length")
          console.log(timeline_max_length0)
          console.log(res)
          that.setData({
            content_list: res.data,
            timeline_max_length:timeline_max_length0
          })
          that.loadContentList()
        } else {
          that.setData({
            tips: "获取失败:" + res.data.result
          })
        }
      }
    })
  },
  setUpdateTime: function (timestamp) {
    var d = new Date(timestamp * 1000); //根据时间戳生成的时间对象
    var date =
      (d.getMonth() + 1) + "-" +
      (d.getDate()) + " " +
      (d.getHours()) + ":" +
      (d.getMinutes()) + ":" +
      (d.getSeconds());
    this.setData({
      data_update_time: date
    })
  }
})

// function getVirtulData(year) {
//   year = year || '2017';
//   var date = +echarts.number.parseDate(year + '-01-01');
//   var end = +echarts.number.parseDate(+year + 1 + '-01-01');
//   var dayTime = 3600 * 24 * 1000;
//   var data = [];
//   for (var time = date; time < end; time += dayTime) {
//     data.push([
//       echarts.format.formatTime('yyyy-MM-dd', time),
//       Math.floor(Math.random() * 2000)
//     ]);
//   }
//   console.log(data)
//   return data;
// }
function getDateStr(AddDayCount) {
  var dd = new Date();
  dd.setDate(dd.getDate() + AddDayCount); //获取AddDayCount天后的日期
  var y = dd.getFullYear();
  var m = dd.getMonth() + 1; //获取当前月份的日期
  var d = dd.getDate();
  return y + "-" + m + "-" + d + "";
}

function getTwoHourStr(timestamp) {
  var dd = new Date(timestamp * 1000);
  var y = dd.getFullYear();
  var m = dd.getMonth() + 1; //获取当前月份的日期
  var d = dd.getDate();
  return m + "-" + d + "|" + dd.getHours() + "点";
}