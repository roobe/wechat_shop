// pages/pt/comment/comment.js
var api = require('../../../api.js');
var app = getApp();
var is_no_more = false;
var is_loading = false;
var p = 2;
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
        is_no_more = false;
        is_loading = false;
        p = 2;
        var page = this;
        page.setData({
            gid: options.id,
        });
        wx.showLoading({
            title: "正在加载",
            mask: true,
        });
        app.request({
            url: api.group.comment,
            data: {
                gid: options.id,
            },
            success: function (res) {
                wx.hideLoading();
                if (res.code == 1) {
                    wx.showModal({
                        title: "提示",
                        content: res.msg,
                        showCancel: false,
                        success: function (e) {
                            if (e.confirm) {
                                wx.navigateBack();
                            }
                        }
                    });
                }

                if (res.code == 0) {
                    if (res.data.comment.length==0){
                        wx.showModal({
                            title: "提示",
                            content: '暂无评价',
                            showCancel: false,
                            success: function (e) {
                                if (e.confirm) {
                                    wx.navigateBack();
                                }
                            }
                        });
                    }
                    page.setData({
                        comment: res.data.comment,
                    });
                }
                page.setData({
                    show_no_data_tip: (page.data.comment.length == 0),
                });

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
        var page = this;
        if (is_loading || is_no_more)
            return;
        is_loading = true;
        app.request({
            url: api.group.comment,
            data: {
                gid: page.data.gid,
                page: p,
            },
            success: function (res) {
                if (res.code == 0) {
                    var comment = page.data.comment.concat(res.data.comment);
                    page.setData({
                        comment: comment,
                    });
                    if (res.data.comment.length == 0) {
                        is_no_more = true;
                    }
                }
                p++;
            },
            complete: function () {
                is_loading = false;
            }
        });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  } ,
  /**
   * 图片放大
   */
  bigToImage: function (e) {
      var urls = this.data.comment[e.target.dataset.index]['pic_list'];
      wx.previewImage({
          current: e.target.dataset.url, // 当前显示图片的http链接
          urls: urls // 需要预览的图片http链接列表
      })
  }
})