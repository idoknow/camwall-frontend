// pages/index/index.js

var textareavalue = ""
var feedbackvalue = ""

var posting = false

Page({

  /**
   * 页面的初始数据
   */
  data: {
    windowHeight: 200,
    windowHeightRpx: 200,
    showTrend: false,
    showPost: false,
    showMe: false,
    showService: false,
    serviceList: [],
    bind: false,
    showPreview: false,
    user: {},
    textfield: "",
    rules: [],
    rulesText: "",
    ready: false,
    showFeedback: false,
    feedbackvalue: "",
    banner: "",
    tags: [],
    tagtips: "",
    selectedTag: {},
    announcement: "",
    loadingTips: "*正在加载数据...",
    textareavalue: "",
    isadmin: false,
    selectedMedia: [], //'http://tmp/0z3kqELltPyC716c039b607c3ed263fba31ac61ca1d2.JPG','http://tmp/B7Dw6SkrJdqtff15618b414dd7af7fbc4fa389b3f1ae.JPG,http://tmp/IP2aORp6Zdu1f5bf8da42c01cfbc62a105e639924959.JPG','http://tmp/NbomHqITF2oJ87d2fe18c5d393c6f07e88dd6f29ed93.JPG','http://tmp/QIZLzrp2Uw8O9846f2a5961ffcfa11dd09ab6c8b9d82.jpg'
    anonymous: false,
    pendingPost: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this

    getApp().globalData.windowHeight = wx.getSystemInfoSync().windowHeight
    let ratio = 750.0 / wx.getSystemInfoSync().windowWidth
    console.log("ratio:" + ratio)
    this.setData({
      windowHeightRpx: getApp().globalData.windowHeight * ratio
    })
    // 登录
    //调用后端接口获取openid

    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log(res)
        wx.request({
          url: getApp().globalData.using_host + "/get_openid",
          data: {
            code: res.code
          },
          success(resp) {
            console.log(resp)
            if (resp.data.result == 'success') {
              getApp().globalData.openID = resp.data.openid
              //accounts
              wx.request({
                url: getApp().globalData.using_host + '/account',
                data: {
                  openid: getApp().globalData.openID,
                  version: 2
                },
                header: {
                  'content-type': 'application/json' // 默认值
                },
                success(res) {
                  console.log(res.data)
                  getApp().globalData.user = res.data
                  getApp().globalData.user.current = 0
                  var d = new Date(res.data.expire * 1000); //根据时间戳生成的时间对象
                  var date =
                    (d.getFullYear()) + "-" +
                    (d.getMonth() + 1) + "-" +
                    (d.getDate()) + " " +
                    (d.getHours()) + ":" +
                    (d.getMinutes()) + ":" +
                    (d.getSeconds());
                  getApp().globalData.user.expireText = date
                  let isadmin = false
                  for (let k in getApp().globalData.user.accounts) {
                    if (getApp().globalData.user.accounts[k]['identity'] == "admin") {
                      isadmin = true
                    }
                  }
                  that.setData({
                    windowHeight: wx.getSystemInfoSync().windowHeight,
                    showTrend: false,
                    showPost: getApp().globalData.user.length != 0,
                    showMe: getApp().globalData.user.length == 0,
                    ready: true,
                    isadmin: isadmin,
                    bind: getApp().globalData.bind,
                    user: getApp().globalData.user
                  })
                },
                fail: function (res) {
                  console.log(res)
                  that.setData({
                    loadingTips: res.errMsg
                  })
                }
              })


              //pendingpost
              wx.request({
                url: getApp().globalData.using_host + '/pullonepoststatus',
                data: {
                  status: "未审核",
                  openid: getApp().globalData.openID
                },
                header: {
                  'content-type': 'application/json' // 默认值
                },
                success(res) {
                  console.log(res)

                  if (res.data.result == "success") {
                    let textt = res.data.text
                    res.data.subtext = textt.substring(0, 100) + (textt.length > 100 ? "..." : "")
                    res.data.media = JSON.parse(res.data.media)
                    var d = new Date(res.data.timestamp * 1000); //根据时间戳生成的时间对象
                    var date =
                      (d.getMonth() + 1) + "-" +
                      (d.getDate()) + " " +
                      (d.getHours()) + ":" +
                      (d.getMinutes()) + ":" +
                      (d.getSeconds());
                    res.data.time = date
                    let pdRaw=res.data
                    let medias=[]

                    for(let i in res.data.media){
                      if(!res.data.media[i].startsWith('cloud:')){
                        medias.push(getApp().globalData.using_host+"/media/download_image/"+res.data.media[i])
                      }else{
                        medias.push(res.data.media[i])
                      }
                    }
                    pdRaw.media=medias
                    that.setData({
                      pendingPost: pdRaw
                    })
                    console.log(that.data.pendingPost)
                  }
                },
                fail: function (res) {
                  console.log(res)
                }
              })

              //banner
              wx.request({
                url: getApp().globalData.using_host + '/constant',
                data: {
                  key: "banner"
                },
                header: {
                  'content-type': 'application/json' // 默认值
                },
                success(res) {
                  console.log(res)
                  that.setData({
                    banner: res.data.value
                  })
                },
                fail: function (res) {
                  console.log(res)
                }
              })
              //textfield
              wx.request({
                url: getApp().globalData.using_host + '/constant',
                data: {
                  key: "textfield0120"
                },
                header: {
                  'content-type': 'application/json' // 默认值
                },
                success(res) {
                  console.log(res)
                  that.setData({
                    textfield: res.data.value
                  })
                },
                fail: function (res) {
                  console.log(res)
                }
              })

              //rules
              wx.request({
                url: getApp().globalData.using_host + '/constant',
                data: {
                  key: "rules"
                },
                header: {
                  'content-type': 'application/json' // 默认值
                },
                success(res) {
                  console.log(res)
                  let value = JSON.parse(res.data.value)
                  let text = ""
                  for (let rule in value) {
                    text += (parseInt(rule) + 1) + "." + value[rule] + "\n"
                  }
                  that.setData({
                    rules: res.data.value,
                    rulesText: text
                  })
                },
                fail: function (res) {
                  console.log(res)
                }
              })

              //announcement
              wx.request({
                url: getApp().globalData.using_host + '/constant',
                data: {
                  key: "announcement"
                },
                header: {
                  'content-type': 'application/json' // 默认值
                },
                success(res) {
                  console.log(res)
                  that.setData({
                    announcement: res.data.value
                  })
                  if (res.data.value != "") {
                    wx.showModal({
                      content: res.data.value
                    })
                  }
                },
                fail: function (res) {
                  console.log(res)
                }
              })
              //services
              wx.request({
                url: getApp().globalData.using_host + '/fetchservicelist',
                data: {},
                header: {
                  'content-type': 'application/json' // 默认值
                },
                success(res) {
                  console.log(res)
                  that.setData({
                    serviceList: res.data.services
                  })
                },
                fail: function (res) {
                  console.log(res)
                }
              })
              //tags
              wx.request({
                url: getApp().globalData.using_host + '/constant',
                data: {
                  key: "tags"
                },
                header: {
                  'content-type': 'application/json' // 默认值
                },
                success(res) {
                  console.log(res)
                  that.setData({
                    tags: JSON.parse(res.data.value)
                  })
                  let st = {}
                  for (let i in that.data.tags) {
                    st[that.data.tags[i]] = false
                  }
                  that.setData({
                    selectedTag: st
                  })
                },
                fail: function (res) {
                  console.log(res)
                }
              })
              //tagtips
              wx.request({
                url: getApp().globalData.using_host + '/constant',
                data: {
                  key: "tagtips"
                },
                header: {
                  'content-type': 'application/json' // 默认值
                },
                success(res) {
                  console.log(res)
                  that.setData({
                    tagtips: res.data.value
                  })
                },
                fail: function (res) {
                  console.log(res)
                }
              })
            } else {
              wx.showToast({
                title: '登录失败1',
                icon: 'error'
              })
            }
          },
          fail(resp) {
            wx.showToast({
              title: '登录失败',
              icon:'error'
            })
            console.log(resp)
          }
        })
      }
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
  switchTrend: function (e) {
    this.setData({
      showTrend: true,
      showPost: false,
      showMe: false,
    })
  },
  switchPost: function (e) {
    this.setData({
      showTrend: false,
      showPost: true,
      showMe: false,
      showService: false,
    })
  },
  switchMe: function (e) {
    this.setData({
      showTrend: false,
      showPost: false,
      showMe: true,
      showService: false,
    })
  },
  switchService: function (e) {
    this.setData({
      showTrend: false,
      showPost: false,
      showMe: false,
      showService: true,
    })
  },
  selectAccount: function (e) {
    console.log(e)
    let usr = this.data.user
    usr.current = parseInt(e.currentTarget.id)
    this.setData({
      user: usr
    })
    // console.log(this.data.user.current)

    // var pages = getCurrentPages()
    // pages[pages.length - 1].onLoad()

    // this.setData({
    //   showTrend: false,
    //   showPost: false,
    //   showMe: true
    // })
  },
  bindAccount: function (e) {
    if (getApp().globalData.openID == "") {
      wx.showToast({
        icon: 'none',
        title: '数据缺失请稍候',
      })
      return
    }
    wx.showModal({
      content: "请将以下内容通过QQ发给沙塘大道第一墙(点击确定后复制):\n" + '#id{' + getApp().globalData.openID + "}",
      success(res) {
        if (res.confirm) {
          wx.setClipboardData({
            data: '#id{' + getApp().globalData.openID + "}",
            success(res) {}
          })
        }
      }
    })
  },
  postNow: function (e) {
    if (posting) {
      return
    }
    let that = this
    posting = true
    if (this.data.user.accounts.length == 0) {
      wx.showToast({
        icon: 'none',
        title: '请先添加账户',
      })
      return
    }
    if (textareavalue.trim() == "") {
      wx.showToast({
        icon: 'none',
        title: '请输入内容',
      })
      return
    }



    //上传、包装、发送给后端
    let modalContent = "我已阅读投稿规则，确保投稿内容合规。\n"

    let tagtext = "我保证内容完全符合所选标签:"
    let hasTag = false
    for (let i in this.data.tags) {
      if (this.data.selectedTag[this.data.tags[i]]) {
        tagtext += "#" + this.data.tags[i] + " "
        hasTag = true
      }
    }

    if (hasTag) {
      modalContent += tagtext + "\n"
    }
    modalContent += "确认发表？"

    wx.showModal({
      content: modalContent,
      success: function (res) {
        console.log(res)
        console.log(that.data.selectedMedia)
        if (res.confirm) {
          //显示加载框
          wx.showLoading({
            title: '正在上传..',
          })

          let cloudids = []

          if (that.data.selectedMedia.length != 0) {
            let currentFinishedCount = 0
            for (let i in that.data.selectedMedia) {

              wx.uploadFile({
                filePath: that.data.selectedMedia[i],
                name: 'file',
                url: getApp().globalData.using_host+"/media/upload_image",
                success(res){
                  console.log(res)

                  let da=JSON.parse(res.data)
                  console.log(da.file_name)
                  cloudids[i] = da.file_name
                  currentFinishedCount++
                  if (currentFinishedCount == that.data.selectedMedia.length) {

                    console.log("cloudids")
                    console.log(cloudids)

                    let textwithtag = textareavalue


                    for (let i in that.data.tags) {
                      if (that.data.selectedTag[that.data.tags[i]]) {
                        textwithtag += " #[" + that.data.tags[i] + "]#"
                      }
                    }

                    wx.request({
                      url: getApp().globalData.using_host + '/postnew',
                      data: {
                        text: /*"#" + textareavalue.replaceAll("\n", "  \n#")*/ textwithtag,
                        media: JSON.stringify(cloudids),
                        anonymous: that.data.anonymous,
                        qq: that.data.user.accounts[that.data.user.current].qq,
                        openid: getApp().globalData.openID
                      },
                      header: {
                        'content-type': 'application/json' // 默认值
                      },
                      success(res) {
                        console.log(res.data)
                        if (res.data == "操作成功") {

                          wx.showToast({
                            title: '上传成功',
                          })
                          var d = new Date(new Date().getTime()); //根据时间戳生成的时间对象
                          var date =
                            (d.getMonth() + 1) + "-" +
                            (d.getDate()) + " " +
                            (d.getHours()) + ":" +
                            (d.getMinutes()) + ":" +
                            (d.getSeconds());

                          let medias=[]

                          for(let i in cloudids){
                            medias.push(getApp().globalData.using_host+"/media/download_image/"+cloudids[i])
                          }
                          that.setData({
                            selectedMedia: [],
                            textareavalue: "",
                            pendingPost: {
                              result: "success",
                              anonymous: that.data.anonymous,
                              id: "未定",
                              media: medias,
                              nickname: "",
                              openid: getApp().globalData.openID,
                              qq: that.data.user.accounts[that.data.user.current].qq,
                              text: textwithtag,
                              status: "未审核",
                              timestamp: new Date().getTime() / 1000,
                              subtext: textwithtag.substring(0, 100) + (textwithtag.length > 100 ? "..." : ""),
                              time: date,
                            }
                          })

                        } else {

                          wx.showToast({
                            icon: 'none',
                            title: '上传失败！',
                          })
                        }
                        wx.hideLoading({
                          success: (res) => {},
                        })
                        posting = false
                      },
                      fail: function (res) {
                        console.log(res)
                        wx.hideLoading({
                          success: (res) => {},
                        })
                        posting = false
                      }
                    })

                  } else {

                    wx.showLoading({
                      title: '上传..' + currentFinishedCount + "/" + that.data.selectedMedia.length,
                    })
                  }
                },
                fail(res){
                  console.log(res)
                  wx.hideLoading({
                    success: (res) => {},
                  })
                }
              })

              // let filenamespt = that.data.selectedMedia[i].split("\.")
              // let uuidfilename = generateUUID() + "dot" + filenamespt[filenamespt.length - 1]
              // console.log(uuidfilename)
              // wx.cloud.uploadFile({
              //   cloudPath: uuidfilename, // 上传至云端的路径
              //   filePath: that.data.selectedMedia[i], // 小程序临时文件路径
              //   success: res => {
              //     // 返回文件 ID
              //   },
              //   fail: function (res) {
              //     console.error

              //     posting = false
              //     wx.hideLoading({
              //       success: (res) => {},
              //     })
              //   }
              // })
            }
            let st = that.data.selectedTag
            for (let idx in that.data.tags) {
              st[that.data.tags[idx]] = false
            }
            that.setData({
              selectedTag: st
            })
          } else {

            let textwithtag = textareavalue


            for (let i in that.data.tags) {
              if (that.data.selectedTag[that.data.tags[i]]) {
                textwithtag += " #[" + that.data.tags[i] + "]#"
              }
            }
            wx.request({
              url: getApp().globalData.using_host + '/postnew',
              data: {
                text: textwithtag,
                media: cloudids,
                anonymous: that.data.anonymous,
                qq: that.data.user.accounts[that.data.user.current].qq,
                openid: getApp().globalData.openID
              },
              header: {
                'content-type': 'application/json' // 默认值
              },
              success(res) {
                console.log(res.data)
                if (res.data == "操作成功") {

                  wx.showToast({
                    title: '上传成功',
                  })

                  var d = new Date(new Date().getTime()); //根据时间戳生成的时间对象
                  var date =
                    (d.getMonth() + 1) + "-" +
                    (d.getDate()) + " " +
                    (d.getHours()) + ":" +
                    (d.getMinutes()) + ":" +
                    (d.getSeconds());
                  that.setData({
                    selectedMedia: [],
                    textareavalue: "",
                    pendingPost: {
                      result: "success",
                      anonymous: that.data.anonymous,
                      id: "未定",
                      media: [],
                      nickname: "",
                      openid: getApp().globalData.openID,
                      qq: that.data.user.accounts[that.data.user.current].qq,
                      text: textwithtag,
                      status: "未审核",
                      timestamp: new Date().getTime() / 1000,
                      subtext: textwithtag.substring(0, 100) + (textwithtag.length > 100 ? "..." : ""),
                      time: date,
                    }
                  })
                } else {

                  wx.showToast({
                    icon: 'none',
                    title: '上传失败！',
                  })
                }
                wx.hideLoading({
                  success: (res) => {},
                })
                posting = false
              },
              fail: function (res) {
                console.log(res)
                wx.showToast({
                  icon: 'none',
                  title: '上传失败！',
                })
                wx.hideLoading({
                  success: (res) => {},
                })
                posting = false
              }
            })

            wx.hideLoading({
              success: (res) => {},
            })
            let st = that.data.selectedTag
            for (let idx in that.data.tags) {
              st[that.data.tags[idx]] = false
            }
            that.setData({
              selectedTag: st
            })
          }
        }
      }
    })

  },
  addMedia: function (e) {
    let that = this

    wx.chooseImage({
      count: 9,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        console.log(res)
        let sm = that.data.selectedMedia
        let idx = sm.length
        for (let i in res.tempFilePaths) {
          if (sm.length >= 9) {
            wx.showToast({
              icon: 'none',
              title: '最多九张',
            })
            break
          }
          if(!(res.tempFilePaths[i].endsWith("jpg")||
          res.tempFilePaths[i].endsWith("jpeg")||
          res.tempFilePaths[i].endsWith("png")||
          res.tempFilePaths[i].endsWith("gif")||
          res.tempFilePaths[i].endsWith("bmp"))){
            wx.showToast({
              title: '仅支持:jpg/png/gif/bmp',
              icon:'none'
            })
            continue
          }
          // let index = parseInt(i) + idx
          sm.push(res.tempFilePaths[i])
        }
        that.setData({
          selectedMedia: sm
        })
      }
    })
  },
  feedback: function (e) {
    this.setData({
      showFeedback: true
    })
  },
  closeFeedback: function (e) {
    this.setData({
      showFeedback: false
    })
  },
  feedbackInput: function (e) {
    feedbackvalue = e.detail.value
  },
  submitFeedback: function (e) {
    let that = this
    if (feedbackvalue == "") {
      wx.showToast({
        icon: 'none',
        title: '请输入内容',
      })
      return
    }
    wx.request({
      url: getApp().globalData.using_host + '/userfeedback',
      data: {
        content: feedbackvalue,
        media: [],
        openid: getApp().globalData.openID
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        console.log(res.data)
        if (res.data == "success") {

          that.setData({
            feedbackvalue: "",
            showFeedback: false
          })
          wx.showToast({
            title: '感谢反馈！',
          })
        } else {

          wx.showToast({
            icon: 'none',
            title: '提交失败！',
          })
        }
      },
      fail: function (res) {
        console.log(res)
        wx.showToast({
          icon: 'none',
          title: '提交失败！',
        })
      }
    })
  },
  deleteImg: function (e) {
    let lo = 0
    let sm = []
    for (let i in this.data.selectedMedia) {
      if (this.data.selectedMedia[i] == e.currentTarget.id) {
        continue
      }
      sm[lo++] = this.data.selectedMedia[i]
    }
    console.log(sm)
    this.setData({
      selectedMedia: sm,
    })
  },
  textAreaInput: function (e) {
    textareavalue = e.detail.value
  },
  anonymousChange: function (e) {
    this.setData({
      anonymous: e.detail.value
    })
  },
  navigateAdmin: function (e) {
    wx.navigateTo({
      url: '../admin/admin',
    })
  },
  navigateLog: function (e) {
    wx.navigateTo({
      url: '../generalLog/log',
    })
  },
  navigateStatistics: function (e) {
    wx.navigateTo({
      url: '../statistics/statistics',
    })
  },
  navigateAccount: function (e) {
    wx.navigateTo({
      url: '../account/account',
    })
  },
  navigateAbout: function (e) {
    wx.navigateTo({
      url: '../about/about',
    })
  },
  refreshAccount: function (e) {
    let that = this
    wx.showLoading({
      title: '正在加载...',
    })
    wx.request({
      url: getApp().globalData.using_host + '/account',
      data: {
        openid: getApp().globalData.openID,
        version: 2
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        getApp().globalData.user = res.data
        getApp().globalData.user.current = 0
        var d = new Date(res.data.expire * 1000); //根据时间戳生成的时间对象
        var date =
          (d.getFullYear()) + "-" +
          (d.getMonth() + 1) + "-" +
          (d.getDate()) + " " +
          (d.getHours()) + ":" +
          (d.getMinutes()) + ":" +
          (d.getSeconds());
        getApp().globalData.user.expireText = date
        let isadmin = false
        for (let k in getApp().globalData.user.accounts) {
          if (getApp().globalData.user.accounts[k]['identity'] == "admin") {
            isadmin = true
          }
        }
        that.setData({
          windowHeight: wx.getSystemInfoSync().windowHeight,
          showTrend: false,
          showPost: false,
          showMe: true,
          ready: true,
          isadmin: isadmin,
          bind: getApp().globalData.bind,
          user: getApp().globalData.user
        })
        wx.hideLoading({
          success: (res) => {},
        })
        console.log(that.data.user)
        if (that.data.user.accounts.length == 0) {
          wx.showModal({
            content: "未绑定账户：\n1.请先点击左上角添加绑定，复制id并发送给墙号(2297454588)\n2.若已发送id给墙号但无反应，请尝试删除好友后重加再发。",
          })
        } else {
          wx.showToast({
            title: '加载成功',
          })
        }
      },
      fail: function (res) {
        console.log(res)
        that.setData({
          loadingTips: res.errMsg
        })
        wx.hideLoading({
          success: (res) => {},
        })
        wx.showToast({
          icon: 'none',
          title: '加载失败',
        })
      }
    })
  },
  showRules: function (e) {
    wx.showModal({
      content: this.data.rulesText,
    })
  },
  selectTag: function (e) {
    if (this.data.selectedTag[e.currentTarget.id] == false) {
      let st = this.data.selectedTag
      st[e.currentTarget.id] = true
      this.setData({
        selectedTag: st
      })
    } else {
      let st = this.data.selectedTag
      st[e.currentTarget.id] = false
      this.setData({
        selectedTag: st
      })
    }
  },
  showWholePendingText: function (e) {
    let that = this
    wx.showModal({
      content: that.data.pendingPost.text,
      success: function (e) {

      }
    })
  },
  showImage: function (e) {
    wx.previewImage({
      urls: [e.currentTarget.id],
    })
  },
  useService: function (e) {
    let that = this
    console.log(e)
    let id = e.currentTarget.id
    if (that.data.serviceList[id].page_url == "" && that.data.serviceList[id].external_url != "") {
      wx.showModal({
        content: that.data.serviceList[id].description + "\n外部链接:\n" + that.data.serviceList[id].external_url + "\n(点击确定复制)",
        success(res) {
          if (res.confirm) {
            wx.setClipboardData({
              data: that.data.serviceList[id].external_url,
              success(res) {}
            })
          }
        }
      })
    } else if (that.data.serviceList[id].page_url != "") {
      wx.navigateTo({
        url: that.data.serviceList[id].page_url,
      })
    } else if (that.data.serviceList[id].external_url == "") {
      wx.showModal({
        content: that.data.serviceList[id].description + "\n(此服务暂未提供访问方法)",
        success(res) {}
      })
    }
  },
  cancelPendingPost: function (e) {
    let that = this
    wx.showModal({
      content: "确认取消发表此稿件？",
      success: function (e) {

        wx.request({
          url: getApp().globalData.using_host + '/cancelonepost',
          data: {
            openid: getApp().globalData.openID,
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success(res) {
            if (res.data == "success") {
              that.setData({
                pendingPost: null
              })
              wx.showToast({
                title: '成功',
              })
            } else {
              wx.showToast({
                icon: 'none',
                title: '失败:' + res.data,
              })
            }
          },
          fail(res) {
            console.log(res)
            wx.showToast({
              icon: 'none',
              title: '失败:' + res,
            })
          }
        })
      }
    })
  }
})

function generateUUID() {
  var d = new Date().getTime();
  var uuid = 'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}