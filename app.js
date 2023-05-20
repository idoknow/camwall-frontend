// app.js
App({
  onLaunch() {
    let that=this
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

  },
  globalData: {
    using_host:'https://yourbackend.address',  // 在这里填写你的后端地址，同时你需要在将其添加到小程序域名
    userInfo: null,
    openID: "",
    windowHeight:300,
    user: {
      current:0,
      accounts: [],
    }
  }
})