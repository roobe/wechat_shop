// pages/pt/group/details.js
var api = require('../../../api.js');
var utils = require('../../../utils.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
      groupFail:0,
      show_attr_picker: false,
      form: {
          number: 1,
      },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      app.pageOnLoad(this);


      var parent_id = 0;
      var user_id = options.user_id;
      console.log("options=>" + JSON.stringify(options));
      var scene = decodeURIComponent(options.scene);
      if (user_id != undefined) {
          parent_id = user_id;
      } else if (scene != undefined) {
          console.log("scene string=>" + scene);
          var scene_obj = utils.scene_decode(scene);
          console.log("scene obj=>" + JSON.stringify(scene_obj));
          if (scene_obj.uid && scene_obj.oid) {
              parent_id = scene_obj.uid;
              options.oid = scene_obj.oid;
          } else {
              parent_id = scene;
          }
      }
      app.loginBindParent({ parent_id: parent_id });

      this.setData({
          oid: options.oid,
      });
      this.getInfo(options);
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

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (options) {
      var page = this;
      var user_info = wx.getStorageSync("user_info");
      var path = '/pages/pt/group/details?oid=' + page.data.oid + '&user_id=' + user_info.id;
      return {
          title: "快来" +page.data.goods.price+"元拼  "+page.data.goods.name,
          path: path,
        //   imageUrl: page.data.goods.cover_pic,
          success: function (res) {
              console.log(path)
              console.log(res)
          }
      }
  },
    /**
     * 获取信息
     */
  getInfo: function (e){
      var oid = e.oid;
        var page = this;
        wx.showLoading({
            title: "正在加载",
            mask: true,
        });
        app.request({
            url: api.group.group_info,
            method: "get",
            data: { oid: oid },
            success: function (res) {
                if (res.code == 0) {
                    if (res.data.groupFail == 0){
                        page.countDownRun(res.data.limit_time_ms);
                    }
                    // page.countDownRun(res.data.limit_time_ms);
                    var reduce_price = (res.data.goods.original_price - res.data.goods.price).toFixed(2);
                    page.setData({
                        goods: res.data.goods,
                        groupList: res.data.groupList,
                        surplus: res.data.surplus,
                        limit_time_ms: res.data.limit_time_ms,
                        goods_list: res.data.goodsList,
                        group_fail: res.data.groupFail,
                        oid: res.data.oid,
                        in_group: res.data.inGroup,
                        attr_group_list: res.data.attr_group_list,
                        group_rule_id: res.data.groupRuleId,
                        reduce_price: reduce_price < 0 ? 0 : reduce_price,
                    });
                } else {
                    wx.showModal({
                        title: '提示',
                        content: res.msg,
                        showCancel: false,
                        success: function (res) {
                            if (res.confirm) {
                                wx.redirectTo({
                                    url: '/pages/pt/index/index'
                                });
                            }
                        }
                    });
                }
            },
            complete: function (res) {
                setTimeout(function () {
                    // 延长一秒取消加载动画
                    wx.hideLoading();
                }, 1000);
            }
        });
    },
  /**
* 执行倒计时
*/
  countDownRun: function (limit_time_ms) {
      var page = this;
      setInterval(function () {
          var leftTime = (new Date(limit_time_ms[0], limit_time_ms[1] - 1, limit_time_ms[2], limit_time_ms[3], limit_time_ms[4], limit_time_ms[5])) - (new Date()); //计算剩余的毫秒数 
          var days = parseInt(leftTime / 1000 / 60 / 60 / 24, 10); //计算剩余的天数 
          var hours = parseInt(leftTime / 1000 / 60 / 60 % 24, 10); //计算剩余的小时 
          var minutes = parseInt(leftTime / 1000 / 60 % 60, 10);//计算剩余的分钟 
          var seconds = parseInt(leftTime / 1000 % 60, 10);//计算剩余的秒数 
 
          days = page.checkTime(days);
          hours = page.checkTime(hours);
          minutes = page.checkTime(minutes);
          seconds = page.checkTime(seconds);
          page.setData({
              limit_time: {
                  days: days,
                  hours: hours,
                  mins: minutes,
                  secs: seconds,
              },
          });
      }, 1000);
  },
  /**
   * 时间补0
   */
  checkTime: function (i) { //将0-9的数字前面加上0，例1变为01 
        i = i>0?i:0;
        if (i < 10) {
            i = "0" + i;
        }
        return i;
  },
  /**
   * 返回首页
   */
  goToHome:function(){
      wx.redirectTo({
          url: '/pages/pt/index/index'
      })
  },
   /**
    * 前往商品详情
    */
    goToGoodsDetails:function(e)
    {
        var page = this;
        wx.redirectTo({
            url: '/pages/pt/details/details?gid=' + page.data.goods.id,
        });
    },
    /**
 * 隐藏规格选择框
 */
    hideAttrPicker: function () {
        var page = this;
        page.setData({
            show_attr_picker: false,
        });
    },
    /**
     * 显示规格选择框
     */
    showAttrPicker: function () {
        var page = this;
        page.setData({
            show_attr_picker: true,
        });
    },
    attrClick: function (e) {
        var page = this;
        var attr_group_id = e.target.dataset.groupId;
        var attr_id = e.target.dataset.id;
        var attr_group_list = page.data.attr_group_list;
        for (var i in attr_group_list) {
            if (attr_group_list[i].attr_group_id != attr_group_id)
                continue;
            for (var j in attr_group_list[i].attr_list) {
                if (attr_group_list[i].attr_list[j].attr_id == attr_id) {
                    attr_group_list[i].attr_list[j].checked = true;
                } else {
                    attr_group_list[i].attr_list[j].checked = false;
                }
            }
        }
        page.setData({
            attr_group_list: attr_group_list,
        });

        var check_attr_list = [];
        var check_all = true;
        for (var i in attr_group_list) {
            var group_checked = false;
            for (var j in attr_group_list[i].attr_list) {
                if (attr_group_list[i].attr_list[j].checked) {
                    check_attr_list.push(attr_group_list[i].attr_list[j].attr_id);
                    group_checked = true;
                    break;
                }
            }
            if (!group_checked) {
                check_all = false;
                break;
            }
        }
        if (!check_all)
            return;
        wx.showLoading({
            title: "正在加载",
            mask: true,
        });
        app.request({
            url: api.group.goods_attr_info,
            data: {
                goods_id: page.data.goods.id,
                attr_list: JSON.stringify(check_attr_list),
            },
            success: function (res) {
                wx.hideLoading();
                if (res.code == 0) {
                    var goods = page.data.goods;
                    goods.price = res.data.price;
                    goods.num = res.data.num;
                    goods.attr_pic = res.data.pic;
                    page.setData({
                        goods: goods,
                        // miaosha_data: res.data.miaosha,
                    });
                }
            }
        });
    },
    /**
    * 参团
    */
    buyNow: function () {
        this.submit('GROUP_BUY_C');
    },
    /**
     * 订单提交
     */
    submit: function (type) {
        var page = this;
        console.log(page.data.show_attr_picker);
        if (!page.data.show_attr_picker) {
            page.setData({
                show_attr_picker: true,
            });
            return true;
        }

        if (page.data.form.number > page.data.goods.num) {
            wx.showToast({
                title: "商品库存不足，请选择其它规格或数量",
                image: "/images/icon-warning.png",
            });
            return true;
        }
        var attr_group_list = page.data.attr_group_list;
        var checked_attr_list = [];
        for (var i in attr_group_list) {
            var attr = false;
            for (var j in attr_group_list[i].attr_list) {
                if (attr_group_list[i].attr_list[j].checked) {
                    attr = {
                        attr_id: attr_group_list[i].attr_list[j].attr_id,
                        attr_name: attr_group_list[i].attr_list[j].attr_name,
                    };
                    break;
                }
            }
            if (!attr) {
                wx.showToast({
                    title: "请选择" + attr_group_list[i].attr_group_name,
                    image: "/images/icon-warning.png",
                });
                return true;
            } else {
                checked_attr_list.push({
                    attr_group_id: attr_group_list[i].attr_group_id,
                    attr_group_name: attr_group_list[i].attr_group_name,
                    attr_id: attr.attr_id,
                    attr_name: attr.attr_name,
                });
            }
        }

        page.setData({
            show_attr_picker: false,
        });
        // console.log(JSON.stringify({
        //     goods_id: page.data.goods.id,
        //     attr: checked_attr_list,
        //     num: page.data.form.number,
        //     type: type,
        // }));return true;
        wx.redirectTo({
            url: "/pages/pt/order-submit/order-submit?goods_info=" + JSON.stringify({
                goods_id: page.data.goods.id,
                attr: checked_attr_list,
                num: page.data.form.number,
                type: type,
                parent_id: page.data.oid,
                deliver_type: page.data.goods.type
            }),
        });
    },
    numberSub: function () {
        var page = this;
        var num = page.data.form.number;
        if (num <= 1)
            return true;
        num--;
        page.setData({
            form: {
                number: num,
            }
        });
    },
    numberAdd: function () {
        var page = this;
        var num = page.data.form.number;
        num++;
        if (num > page.data.goods.one_buy_limit) {
            wx.showModal({
                title: '提示',
                content: '最多只允许购买' + page.data.goods.one_buy_limit + '件',
                showCancel: false,
            });
            return;
        }
        page.setData({
            form: {
                number: num,
            }
        });
    },
    numberBlur: function (e) {
        var page = this;
        var num = e.detail.value;
        num = parseInt(num);
        if (isNaN(num))
            num = 1;
        if (num <= 0)
            num = 1;
        if (num > page.data.goods.one_buy_limit) {
            wx.showModal({
                title: '提示',
                content: '最多只允许购买' + page.data.goods.one_buy_limit + '件',
                showCancel: false,
            });
            return;
        }
        page.setData({
            form: {
                number: num,
            }
        });
    },
    /**
     * 拼团规则
     */
    goArticle: function (e) {
        if (this.data.group_rule_id) {
            wx.navigateTo({
                url: '/pages/article-detail/article-detail?id=' + this.data.group_rule_id,
            });
        };
    },
    showShareModal: function (e) {
        console.log(e);
        var page = this;
        page.setData({
            share_modal_active: "active",
            no_scroll: true,
        });
    },

    shareModalClose: function () {
        var page = this;
        page.setData({
            share_modal_active: "",
            no_scroll: false,
        });
    },
    getGoodsQrcode: function () {
        var page = this;
        page.setData({
            goods_qrcode_active: "active",
            share_modal_active: "",
        });
        if (page.data.goods_qrcode)
            return true;
        app.request({
            url: api.group.order.goods_qrcode,
            data: {
                order_id: page.data.oid,
            },
            success: function (res) {
                if (res.code == 0) {
                    page.setData({
                        goods_qrcode: res.data.pic_url,
                    });
                }
                if (res.code == 1) {
                    page.goodsQrcodeClose();
                    wx.showModal({
                        title: "提示",
                        content: res.msg,
                        showCancel: false,
                        success: function (res) {
                            if (res.confirm) {

                            }
                        }
                    });
                }
            },
        });
    },
    goodsQrcodeClose: function () {
        var page = this;
        page.setData({
            goods_qrcode_active: "",
            no_scroll: false,
        });
    },
    goodsQrcodeClose: function () {
        var page = this;
        page.setData({
            goods_qrcode_active: "",
            no_scroll: false,
        });
    },

    saveGoodsQrcode: function () {
        var page = this;
        if (!wx.saveImageToPhotosAlbum) {
            // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
            wx.showModal({
                title: '提示',
                content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。',
                showCancel: false,
            });
            return;
        }

        wx.showLoading({
            title: "正在保存图片",
            mask: false,
        });

        wx.downloadFile({
            url: page.data.goods_qrcode,
            success: function (e) {
                wx.showLoading({
                    title: "正在保存图片",
                    mask: false,
                });
                wx.saveImageToPhotosAlbum({
                    filePath: e.tempFilePath,
                    success: function () {
                        wx.showModal({
                            title: '提示',
                            content: '商品海报保存成功',
                            showCancel: false,
                        });
                    },
                    fail: function (e) {
                        wx.showModal({
                            title: '图片保存失败',
                            content: e.errMsg,
                            showCancel: false,
                        });
                    },
                    complete: function (e) {
                        console.log(e);
                        wx.hideLoading();
                    }
                });
            },
            fail: function (e) {
                wx.showModal({
                    title: '图片下载失败',
                    content: e.errMsg + ";" + page.data.goods_qrcode,
                    showCancel: false,
                });
            },
            complete: function (e) {
                console.log(e);
                wx.hideLoading();
            }
        });
    },
    goodsQrcodeClick: function (e) {
        var src = e.currentTarget.dataset.src;
        wx.previewImage({
            urls: [src],
        });
    },
})