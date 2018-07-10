// pages/video/video-list.js
var api = require('../../api.js');
var app = getApp();
var is_loading_more = false;
var is_no_more = false;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    video_list: [],
    url:'',
    hide:'hide',
    show:false,
    animationData: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      app.pageOnLoad(this);
    var page = this;
    page.loadMoreGoodsList();
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
      app.pageOnShow(this);
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

  loadMoreGoodsList: function () {
    var page = this;
    if (is_loading_more)
      return;
    page.setData({
      show_loading_bar: true,
    });
    is_loading_more = true;
    var p = page.data.page;
    app.request({
      url: api.default.video_list,
      data: {
        page: p,
      },
      success: function (res) {
        if (res.data.list.length == 0)
          is_no_more = true;
        var video_list = page.data.video_list.concat(res.data.list);
        page.setData({
          video_list: video_list,
          page: (p + 1),
        });
      },
      complete: function () {
        is_loading_more = false;
        page.setData({
          show_loading_bar: false,
        });
      }
    });
  }
  ,
  play: function (e) {
    var index = e.currentTarget.dataset.index;//获取视频链接
    var video_all = wx.createVideoContext('video_' + this.data.show_video);
    video_all.pause();
    this.setData({
      show_video:index,
      show:true
    });
    return;
    var videoContext = wx.createVideoContext('video_'+index);
    videoContext.play();
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

    var page = this;
    if (is_no_more)
      return;
    page.loadMoreGoodsList();
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // }

  more:function(e){
    var page = this;
    var index = e.target.dataset.index;
    var video_list = page.data.video_list;
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })

    this.animation = animation
    if (video_list[index].show != -1) {
      animation.rotate(0).step();
      video_list[index].show = -1;
      page.setData({
        video_list: video_list,
        animationData: this.animation.export()
      });
    } else {
      animation.rotate(0).step();
      video_list[index].show = 0;
      page.setData({
        video_list: video_list,
        animationData: this.animation.export()
      });
    }
  }
})