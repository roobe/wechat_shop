// pages/test/test.js
var api = require('../../api.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {},

  formSubmit: function (e) {
    console.log(e);
    app.saveFormId(e.detail.formId);

  },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
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
  send:function(){
      app.request({
          url:'http://cje.tunnel.qydev.com/we7offical/addons/zjhj_mall/core/web/index.php?store_id=1&r=api/user/test',
          success:function(res){
            console.log(11);
          }
      });
  }
})