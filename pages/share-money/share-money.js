// pages/share-money/share-money.js
var api = require('../../api.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    block:false,
    active:'',
    total_price:0,
    price:0,
    cash_price:0,
    un_pay:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      app.pageOnLoad(this);
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

    var page = this;
    var share_setting = wx.getStorageSync("share_setting");
    page.setData({
      share_setting: share_setting,
    });
    wx.showLoading({
      title: "正在加载",
      mask: true,
    });
    app.request({
      url: api.share.get_price,
      success: function (res) {
        if (res.code == 0) {
          page.setData({
            total_price: res.data.price.total_price,
            price: res.data.price.price,
            cash_price: res.data.price.cash_price,
            un_pay: res.data.price.un_pay
          });
        }
      },
      complete: function () {
        wx.hideLoading();
      }
    });
  },
  tapName:function(e){
    var page = this;
    var active = '';
    if (!page.data.block){
      active = 'active';
    }
    page.setData({
      block:!page.data.block,
      active: active
    });

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
})