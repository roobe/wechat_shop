// pages/coupon-list/coupon-list.js
var api = require('../../api.js');
var app = getApp();
var share_count = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      app.pageOnLoad(this);
    var page = this;
    wx.showLoading({
      mask: true,
    });
    app.request({
      url: api.default.coupon_list,
      success: function (res) {
        if (res.code == 0) {
          page.setData({
            coupon_list: res.data.list
          });
        }
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

  },
  receive: function (e) {
    var page = this;
    var id = e.target.dataset.index;
    wx.showLoading({
      mask: true,
    });
    if (!page.hideGetCoupon) {
      page.hideGetCoupon = function (e) {
        var url = e.currentTarget.dataset.url || false;
        page.setData({
          get_coupon_list: null,
        });
        if (url) {
          wx.navigateTo({
            url: url,
          });
        }
      };
    }
    app.request({
      url: api.coupon.receive,
      data: { id: id },
      success: function (res) {
        if (res.code == 0) {
          page.setData({
            get_coupon_list: res.data.list,
            coupon_list: res.data.coupon_list
          });
        }
      },
      complete: function () {
        wx.hideLoading();
      }
    });
  },
  closeCouponBox: function (e) {
    this.setData({
      get_coupon_list: ""
    });
  }
})