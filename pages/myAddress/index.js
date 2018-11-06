// pages/myAddress/index.js
import address from "../../services/myAddress";
import editor from "../../services/editor";
Page({
  data: {
    addressList: null,
    color: 'blue',
    type: '',
    from: ''
  },
  onLoad: function (options) {
    if (options.from == 'send') {
      if (options.type == 'receive') {
        wx.setNavigationBarTitle({
          title: '寄件人列表',
        })
        this.setData({
          type: 'receive',
          from: 'send'
        })
      }
      if (options.type == 'send') {
        wx.setNavigationBarTitle({
          title: '收件人列表',
        })
        this.setData({
          type: 'send',
          from: 'send'
        })
      }
    } else {
      if (options.type == 'receive') {
        wx.setNavigationBarTitle({
          title: '收件人列表',
        })
        this.setData({
          type: options.type
        })
      }
    }
  },
  onShow: function () {
    if (this.data.type == 'send') {
      this.getSenderAddress();
    } else {
      this.getAddList();
    }
  },
  check: function (e) {
    var id = e.currentTarget.dataset.id;
    var data = this.data.addressList;
    for (let index in data) {
       if (data[index].id == id) {
        data[index].checked = !data[index].checked;
      }
    }
    this.setData({
      addressList: data
    });
  },
  goEdit: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../editor/editor?id=' + id + '&type=' + this.data.type + '&from=' + this.data.from,
    })
  },
  goEditNew: function () {
    wx.navigateTo({
      url: '../editor/editor?status=new&type=' + this.data.type + '&from=' + this.data.from,
    })
  },
  getAddList: function () {
    var self = this;
    address.getAddressList({schoolId: wx.getStorageSync('schoolId')}, function(res) {
      if (res.errno == 0 && res.data.length > 0) {
        for (let item of res.data) {
          if (item.isDefault == 1) {
            item.checked = true;
          }
          item.active = item.isDisable == 0 ? 'grey' : ''
        }
        self.setData({
          addressList: res.data
        })
      }
    })
  },
  getSenderAddress: function () {
    var self = this;
    address.gerSenderAddress({schoolId: wx.getStorageSync('schoolId')}, function(res) {
      if (res.errno == 0 && res.data.length > 0) {
        for (let item of res.data) {
          if (item.isDefault == 1) {
            item.checked = true;
          }
        }
        self.setData({
          addressList: res.data
        })
      }
    })
  },
  save: function (ev) {
    const base = this.data;
    let id = ev.currentTarget.dataset.id || '';
    if (!id) return;
    if (base.type == 'send') {
      this.saveSenderAddress(id);
      return;
    }
    let param = {}
    for (let item of base.addressList) {
      if (item.grey) {
        wx.showToast({
          title: '当前地址不支持服务',
          icon: 'none'
        })
        return;
      }
      if (item.id == id) {
        item.isDefault = 1;
        param = item;
        break;
      }
    }
    editor.save(param, function (res) {
      if (res.errno == 0) {
        wx.navigateBack({
            delta: 1
        })
      }
    })
  },
  saveSenderAddress: function (id) {
    const base = this.data;
    let param = {}
    for (let item of base.addressList) {
      if (item.id == id) {
        item.isDefault = 1;
        param = item;
        break;
      }
    }
    editor.saveSender(param, function (res) {
      if (res.errno == 0) {
        wx.navigateBack({
          delta: 1
        })
      }
    })
  },
})