// pages/admin/admin.js

var reviewvalue = ""
Page({

  /**
   * 页面的初始数据
   */
  data: {
    status: ["所有", "未审核", "通过", "拒绝", "已发表", "失败", "取消"],
    post_status: ["未审核", "通过", "拒绝", "已发表", "失败", "取消"],
    status_color: {
      "所有": "#083677",
      "未审核": "#DCB011",
      "通过": "#33DD55",
      "拒绝": "#CC4444",
      "已发表": "#3388DD",
      "失败": "#663300",
      "取消": "#BB8888"
    },
    status_value: 0,
    page: 1,
    posts: {
      page: 0,
      page_list: [1],
      status: "所有"
    },
    loading: false,
    loadingTips: "正在加载..",
    windowHeight: wx.getSystemInfoSync().windowHeight,
    showReview: false,
    reviewValue: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      windowHeight: getApp().globalData.windowHeight
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
  selectStatus: function (e) {
    this.setData({
      status_value: parseInt(e.detail.value)
    })
    this.fetchFromBackend()
  },
  switchPage: function (e) {
    this.setData({
      page: e.currentTarget.id
    })
    this.fetchFromBackend()
  },
  showWholeText: function (e) {
    let that = this
    wx.showModal({
      content: that.data.posts.posts[parseInt(e.currentTarget.id)].text,
      success: function (e) {

      }
    })
  },
  fetchFromBackend: function (e) {
    let that = this
    this.setData({
      loadingTips: "正在加载..",
      loading: true,
      page: this.data.page == 0 ? 1 : this.data.page
    })
    wx.request({
      url: getApp().globalData.using_host + '/pullmultipostsstatus',
      data: {
        status: that.data.status[that.data.status_value],
        capacity: 15,
        page: that.data.page,
        openid: getApp().globalData.openID
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        console.log(res.data)
        let po = res.data

        for (let k in po.posts) {
          po.posts[k].subtext = po.posts[k].text.substring(0, 25) + (po.posts[k].text.length > 25 ? "..." : "")
          po.posts[k].media = JSON.parse(po.posts[k].media)
          
          let medias=[]

          for(let idx in po.posts[k].media){
            if(!po.posts[k].media[idx].startsWith('cloud:')){
              medias.push(getApp().globalData.using_host+"/media/download_image/"+po.posts[k].media[idx])
            }else{
              medias.push(po.posts[k].media[idx])
            }
          }
          po.posts[k].media = medias

          po.posts[k].showthumb = false
          var d = new Date(po.posts[k].timestamp * 1000); //根据时间戳生成的时间对象
          var date =
            (d.getMonth() + 1) + "-" +
            (d.getDate()) + " " +
            (d.getHours()) + ":" +
            (d.getMinutes()) + ":" +
            (d.getSeconds());
          po.posts[k].time = date
        }
        that.setData({
          posts: po,
          loading: false
        })
      },
      fail: function (res) {
        console.log(res)
        that.setData({
          loadingTips: "加载失败!"
        })
      }
    })
  },
  showThumb: function (e) {
    let po = this.data.posts
    po.posts[parseInt(e.currentTarget.id)].showthumb = true
    this.setData({
      posts: po
    })
  },
  showImage: function (e) {
    wx.previewImage({
      urls: [e.currentTarget.id],
    })
  },
  updatePostStatus: function (e) {
    let that = this
    console.log(e)

    if (that.data.post_status[parseInt(e.detail.value)] == "拒绝") {
      this.setData({
        showReview: true
      })
      submitReviewRecallFunction = function () {
        wx.request({
          url: getApp().globalData.using_host + '/updatepoststatus',
          data: {
            id: that.data.posts.posts[parseInt(e.currentTarget.id)].id,
            "new-status": that.data.post_status[parseInt(e.detail.value)],
            openid: getApp().globalData.openID,
            review: reviewvalue
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success(res) {
            let po = that.data.posts
            po.posts[parseInt(e.currentTarget.id)].status = that.data.post_status[parseInt(e.detail.value)]
            that.setData({
              posts: po,
              reviewValue: "",
              showReview: false
            })
          },
          fail(res) {
            console.log(res)
            wx.showToast({
              title: '失败!',
            })
          }
        })
      }
      submitWithoutReviewRecallFunction = function () {

        wx.request({
          url: getApp().globalData.using_host + '/updatepoststatus',
          data: {
            id: that.data.posts.posts[parseInt(e.currentTarget.id)].id,
            "new-status": that.data.post_status[parseInt(e.detail.value)],
            openid: getApp().globalData.openID
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success(res) {
            let po = that.data.posts
            po.posts[parseInt(e.currentTarget.id)].status = that.data.post_status[parseInt(e.detail.value)]
            that.setData({
              posts: po,
              reviewValue: "",
              showReview: false
            })
          },
          fail(res) {
            console.log(res)
            wx.showToast({
              title: '失败!',
            })
          }
        })
      }
    } else {

      wx.request({
        url: getApp().globalData.using_host + '/updatepoststatus',
        data: {
          id: that.data.posts.posts[parseInt(e.currentTarget.id)].id,
          "new-status": that.data.post_status[parseInt(e.detail.value)],
          openid: getApp().globalData.openID
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          let po = that.data.posts
          po.posts[parseInt(e.currentTarget.id)].status = that.data.post_status[parseInt(e.detail.value)]
          that.setData({
            posts: po
          })
        },
        fail(res) {
          console.log(res)
          wx.showToast({
            title: '失败!',
          })
        }
      })
    }

  },
  closeReview: function (e) {
    this.setData({
      showReview: false
    })
  },
  submitReview: function (e) {
    submitReviewRecallFunction()
  },
  denyWithoutReview: function (e) {
    let that = this;
    submitWithoutReviewRecallFunction()
  },
  reviewInput: function (e) {
    reviewvalue = e.detail.value
  }
})

var submitReviewRecallFunction = function () {}
var submitWithoutReviewRecallFunction = function () {}