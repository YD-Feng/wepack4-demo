//加载初始化样式
import './../less/element-variables.scss'
import '../less/common.less';
import './vue-bar';

//基础库
import Vue from 'vue';
import VueRouter from 'vue-router';
import Vuex from 'vuex';
import VueResource from 'vue-resource';
import ElementUI from 'element-ui';
import _ from 'underscore';

import routes from './routes';
import appView from '../views/app.vue';
import { loginUrl } from 'utils';

Vue.use(VueRouter);
Vue.use(Vuex);
Vue.use(VueResource);
Vue.use(ElementUI);
Vue.use(VueBar);

//Date方法拓展
Date.prototype.format = function (fmt) {
    var o = {
        'M+': this.getMonth() + 1, //月份
        'd+': this.getDate(), //日
        'h+': this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, //小时
        'H+': this.getHours(), //小时
        'm+': this.getMinutes(), //分
        's+': this.getSeconds(), //秒
        'q+': Math.floor((this.getMonth() + 3) / 3), //季度
        'S': this.getMilliseconds() //毫秒
    };

    var week = {
        '0': '/u65e5',
        '1': '/u4e00',
        '2': '/u4e8c',
        '3': '/u4e09',
        '4': '/u56db',
        '5': '/u4e94',
        '6': '/u516d'
    };

    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }

    if (/(E+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? '/u661f/u671f' : '/u5468') : '') + week[this.getDay() + '']);
    }

    for (var k in o) {
        if (new RegExp('('+ k +')').test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
        }
    }
    return fmt;
};

//实例化 vue-routes
window.router = new VueRouter({
    routes: routes
});

//实例化 store
var store = new Vuex.Store({
    modules: {
        user: require('./store-modules/user'),
        rights: require('./store-modules/rights'),
        //agent: require('./store-modules/agent'),
        flags: require('./store-modules/flags'),
        dict: require('./store-modules/dict')
    },
    strict: false
});

//定义请求池 和 loading对象缓存
var xhrPool = {
        count: 0
    },
    loadingSrv = null;

Vue.http.headers.common['System-Code'] = 'fms';

//设置请求全局处理
Vue.http.interceptors.push(function (request, next) {
    //一些表单提交场景，虽然全局loading效果出现了，此时只要鼠标不做点击行为，提交按钮依然为获得焦点状态，这个时候按回车键就会重复提交表单
    //所以这里在每次发出异步请求的时候，让隐藏input获得焦点，用来解决上面描述的问题
    document.getElementById('hiddenInput') && document.getElementById('hiddenInput').focus();
    if (!request.noLoading) {
        if (typeof xhrPool[request.url] == 'undefined') {
            xhrPool[request.url] = request;
            xhrPool['count'] = xhrPool['count'] + 1;
        } else {
            xhrPool[request.url] = request;
        }

        if (xhrPool['count'] > 0) {
            loadingSrv = this.$loading();
        }
    }

    //返回处理
    next(function (response) {

        var _this = this,
            data = response.body;

        if (!request.noLoading) {
            if (xhrPool[request.url]) {
                delete xhrPool[request.url];
                xhrPool['count'] = xhrPool['count'] - 1;
            }

            if (xhrPool['count'] == 0) {
                loadingSrv.close();
            }
        }

        if (!request.withoutGlobalCheck) {

            if (response.ok && data.code != 200) {
                if (data.code == 401) {
                    location.href = loginUrl + '?ReturnURL=' + location.href;
                } else {
                    _this && _this.$message({
                        type: 'error',
                        message: data.desc
                    });
                }

            } else if (!response.ok) {
                if (response.status == 401) {
                    location.href = loginUrl + '?ReturnURL=' + location.href;
                }

                if (response.status > 400 && response.status < 500) {
                    _this && _this.$message({
                        message: response.body.desc ? response.body.desc : '请求方式或参数出现异常',
                        type: 'error'
                    });
                } else if (response.status >= 500) {
                    _this && _this.$message({
                        message: response.body.desc ? response.body.desc : '服务器暂时在维护,请稍后重试',
                        type: 'error'
                    });
                }

            }

        }
    });
});

Vue.prototype.hasRight = function (resourceCode) {
    var _this = this,
        hasRight = _this.$store.state.rights.rightList.some(function (resource) {
            return resource.code == resourceCode;
        });

    if (_this.$store.state.user.isSuperAccount == 1) {
        return true;
    }

    return hasRight;
};

//添加转义输入
var encodeHTML = function (value) {
    if (typeof value === 'string') {
        return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
    }
    return value;
};

var wrapInputParam = function (param) {
    if (_.isEmpty(param) || _.isArray(param) || !_.isObject(param)) {
        return param;
    }

    var wrappedParam = {};
    Object.keys(param).forEach(function (key) {
        let value = param[key];
        if (typeof value === 'string') {
            value = value.trim();
        }
        wrappedParam[key] = value;
    });

    return wrappedParam;
};

Vue.prototype.$get = function (opts) {
    var config = {};

    config.method = 'get';
    config.url = opts.url;
    config.params = wrapInputParam(opts.data) || {};
    config.noLoading = opts.noLoading || false;
    config.withoutGlobalCheck = opts.withoutGlobalCheck || false;
    config.credentials = true;

    return this.$http(config).then(function (res) {
        res.body = JSON.parse(res.bodyText.replace(/:(\d{19})/g, ":\"$1\""));
        if (res.body.code == 200) {
            opts.success && opts.success(res.body);
        } else {
            opts.error && opts.error(res.body);
        }
    });
};

Vue.prototype.$post = function (opts, emulateJSON) {
    var config = {};

    config.method = 'post';
    config.url = opts.url;
    config.body = wrapInputParam(opts.data) || {};
    config.noLoading = opts.noLoading || false;
    config.withoutGlobalCheck = opts.withoutGlobalCheck || false;
    config.credentials = true;
    config.emulateJSON = emulateJSON ? true : false;

    return this.$http(config).then(function (res) {
        res.body = JSON.parse(res.bodyText.replace(/:(\d{19})/g, ":\"$1\""));
        if (res.body.code == 200) {
            opts.success && opts.success(res.body);
        } else {
            opts.error && opts.error(res.body);
        }
    });
};

/*
 * 参数说明：
 * name 【String】 Cookie名
 * value 【String】 Cookie值
 * time 【Int】 过期时长（单位：毫秒）
 * domain 【String】 Cookie域，可缺省，默认值为空字符串
 * path 【String】 Cookie路径，可缺省，默认值为 '/'
 * */
Vue.prototype.$setCookie = function (name, value, time, domain, path) {
    var cookieArr = [],
        _path = path || '/',
        _domain = domain || '',
        expire = new Date();

    expire.setTime(expire.getTime() + time);

    cookieArr.push(name + '=' + escape(value) + '; ');
    cookieArr.push(time ? ('expires=' + expire.toGMTString() + '; ') : '');
    cookieArr.push('path=' + _path + '; ');
    cookieArr.push('domain=' + _domain + ';');
    document.cookie = cookieArr.join('');
};

/*
 * 参数说明：
 * name 【String】 Cookie名
 * */
Vue.prototype.$getCookie = function (name) {
    var reg = new RegExp('(?:^|;+|\\s+)' + name + '=([^;]*)'),
        m = document.cookie.match(reg);

    return unescape(decodeURIComponent(!m ? '' : m[1]));
};

/*
 * 参数说明：
 * name 【String】 Cookie名
 * domain 【String】 Cookie域，可缺省，默认值为空字符串
 * path 【String】 Cookie路径，可缺省，默认值为 '/'
 * */
Vue.prototype.$removeCookie = function (name, domain, path) {
    var _this = this,
        cookieArr = [],
        _path = path || _this.options.path,
        _domain = domain || _this.options.domain;

    cookieArr.push(name + '=; ');
    cookieArr.push('expires=Mon, 26 Jul 1997 05:00:00 GMT; ');
    cookieArr.push('path=' + _path + '; ');
    cookieArr.push('domain=' + _domain + ';');
    document.cookie = cookieArr.join('');
};

//全局 【文件下载、导出】 专用 form 对象
window.fileDownForm = null;
//插入隐藏域，用于避免浏览器拦截弹窗
var hiddenFrame = document.createElement('iframe');
hiddenFrame.name = 'hiddenFrame';
hiddenFrame.style.display = 'none';
document.body.appendChild(hiddenFrame);

//下载、导出文件
Vue.prototype.$exportByForm = function (config) {
    var form = window.fileDownForm;

    if (form) {
        form.remove();
    }

    form = document.createElement('form');
    form.method = config.method || 'get';
    form.action = config.url;
    form.target = 'hiddenFrame';

    if (config.data && typeof config.data == 'object') {
        for (var key in config.data) {
            var curVal = config.data[key],
                createEl = function (val) {
                    var input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = val;
                    form.appendChild(input);
                };

            if (curVal instanceof Array) {
                curVal.forEach(function (val) {
                    createEl(val);
                })
            } else {
                createEl(config.data[key]);
            }
        }
    }

    document.body.appendChild(form);
    form.submit();
};

//自定义指令
var nodeList = [],
    ctx = '@clickOutside',
    mouseDownEvent;

document.addEventListener('mousedown', function (e) {
    mouseDownEvent = e;
}, false);

document.addEventListener('mouseup', function (e) {
    nodeList.forEach(function (node) {
        node[ctx].documentHandler(e, mouseDownEvent);
    });
}, false);

//点击元素以外区域时触发回调函数指令
Vue.directive('clickOutside', {
    bind (el, binding, vnode) {
        var id = nodeList.push(el) - 1;
        var documentHandler = function (mouseup = {}, mousedown = {}) {
            if (!vnode.context ||
                !mouseup.target ||
                !mousedown.target ||
                el.contains(mouseup.target) ||
                (vnode.context.popperElm &&
                (vnode.context.popperElm.contains(mouseup.target) ||
                vnode.context.popperElm.contains(mousedown.target)))) return;

            if (binding.expression &&
                el[ctx].methodName &&
                vnode.context[el[ctx].methodName]) {
                vnode.context[el[ctx].methodName]();
            } else {
                el[ctx].bindingFn && el[ctx].bindingFn();
            }
        };
        el[ctx] = {
            id,
            documentHandler,
            methodName: binding.expression,
            bindingFn: binding.value
        };
    },
    update (el, binding) {
        el[ctx].methodName = binding.expression;
        el[ctx].bindingFn = binding.value;
    },
    unbind (el) {
        let len = nodeList.length;

        for (let i = 0; i < len; i++) {
            if (nodeList[i][ctx].id === el[ctx].id) {
                nodeList.splice(i, 1);
                break;
            }
        }
    }
});

Vue.directive('autoHeight', {
    bind: function (el) {
        var delHeight = el.dataset.delHeight || 0;
        el.style['height'] = (window.innerHeight - delHeight) + 'px';
        el.style['max-height'] = (window.innerHeight - delHeight) + 'px';

        window.addEventListener('resize', function () {
            el.style['height'] = (window.innerHeight - delHeight) + 'px';
            el.style['max-height'] = (window.innerHeight - delHeight) + 'px';
        });
    }
});

new Vue({
    el: '#app',
    router,
    store,
    render (h) {
        return h(appView);
    }
});
