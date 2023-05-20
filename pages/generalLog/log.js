// pages/generalLog/log.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    windowHeight:300,
    page:0,
    logs:{
      page:0,
      page_list:[1],
      logs:[]
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      windowHeight:getApp().globalData.windowHeight
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  switchPage:function(e){
    this.setData({
      page:e.currentTarget.id
    })
    this.fetchFromBackend()
  },
  fetchFromBackend:function(){

    let that=this
    this.setData({
      loadingTips:"正在加载..",
      loading:true,
      page:this.data.page==0?1:this.data.page
    })
    wx.request({
      url: getApp().globalData.using_host+'/pullloglist',
      data: {
        capacity:25,
        page:that.data.page,
        openid:getApp().globalData.openID
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        console.log(res.data)
        let lo=res.data

        for(let k in lo.logs){
          var d = new Date(lo.logs[k].timestamp * 1000);    //根据时间戳生成的时间对象
          var date =
                     (d.getMonth() + 1) + "-" +
                     (d.getDate()) + " " + 
                     (d.getHours()) + ":" + 
                     (d.getMinutes()) + ":" + 
                     (d.getSeconds());
          lo.logs[k].time=date
        }
        that.setData({
          logs:lo,
          loading:false
        })
      },
      fail: function (res) {
        console.log(res)
        that.setData({
          loadingTips:"加载失败!"
        })
      }
    })
  }
})