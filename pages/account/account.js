// pages/account/account.js
var utilMd5 = require('../../utils/md5.js');  
Page({

  /**
   * 页面的初始数据
   */
  data: {
    register_time:'',
    status_tips:"",
    has_password:false,
    pwd:"",
    showPassword:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.refreshInfo()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  refreshInfo:function(){

    let that=this
    wx.request({
      url: getApp().globalData.using_host+'/fetchuniauthinfo',
      data:{
        openid:getApp().globalData.openID
      },
      fail:function(res){
        console.log(res)
      },
      success:function(res){
        console.log(res)
        var d = new Date(res.data.timestamp*1000); //根据时间戳生成的时间对象
        var date =
          (d.getFullYear()) + "-" +
          (d.getMonth() + 1) + "-" +
          (d.getDate()) + " " +
          (d.getHours()) + ":" +
          (d.getMinutes()) + ":" +
          (d.getSeconds());
        if(res.data.result=='success'){
          that.setData({
            user_id:res.data.uid,
            status_tips:"",
            has_password:true,
            register_time:date
          })
        }else if(res.data.result=='warn:账户未设置密码'){
          that.setData({
            status_tips:"⚠此账户未设置密码,将无法访问小程序外的服务.",
            has_password:false,
            register_time:date,
            user_id:res.data.uid,
          })
        }else{
          wx.showModal({
            icon:'none',
            content:"无法获取账户"
          })
        }
      }
    })
  },
  showPassword:function(e){
    this.setData({
      showPassword:true,
      pwd:''
    })
  },
  closePassword:function(e){
    this.setData({
      showPassword:false
    })
  },
  submitPassword:function(e){
    let that=this
    console.log(this.data.pwd)
    if(this.data.pwd==''){
      return
    }
    let pwdMd5=utilMd5.hexMD5(that.data.pwd);

    wx.request({
      url: getApp().globalData.using_host+'/changepassword',
      data:{
        openid:getApp().globalData.openID,
        "new-password":pwdMd5
      },
      success:function(res){
        console.log(res)
        that.setData({
          showPassword:false,
          has_password:true
        })
        wx.showModal({
          content:"设置密码成功"
        })
      },
      fail:function(e){
        console.log(e)
        wx.showModal({
          icon:'none',
          content:"设置密码失败"
        })
      }
    })
  },
  passwordInput:function(e){
    this.setData({
      pwd:e.detail.value
    })
  }
})