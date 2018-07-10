// pages/share-team/share-team.js
var api = require('../../api.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    status:1,
    first_count:0,
    second_count:0,
    third_count:0,
    list:Array
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      app.pageOnLoad(this);
    var page = this;
    var share_setting = wx.getStorageSync("share_setting");
    page.setData({
      share_setting: share_setting,
    });
    page.GetList(options.status || 1);
  },
  GetList: function (status) {
    var page = this;
    page.setData({
      status: parseInt(status || 1),
    });
    wx.showLoading({
      title: "正在加载",
      mask: true,
    });
    app.request({
      url: api.share.get_team,
      data: {
        status: page.data.status,
      },
      success: function (res) {
        page.setData({
          first_count: res.data.first,
          second_count: res.data.second,
          third_count: res.data.third,
          list: res.data.list,
        });
      },
      complete: function () {
        wx.hideLoading();
      }
    });
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
  
  }
})