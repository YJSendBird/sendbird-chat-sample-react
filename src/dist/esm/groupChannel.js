import{a2 as n,d as r,a3 as t,a4 as i,i as s,o,_ as l,a5 as u,a6 as h,a7 as d,j as C}from"./bundle/bundle.shared.js";export{a8 as CountPreference,a9 as GroupChannel,a5 as GroupChannelChangeLogsParams,a6 as GroupChannelCountParams,a7 as GroupChannelCreateParams,f as GroupChannelEventContext,e as GroupChannelEventSource,G as GroupChannelFilter,aa as GroupChannelHideParams,a as GroupChannelListOrder,a3 as GroupChannelListQuery,ab as GroupChannelSearchField,ac as GroupChannelUpdateParams,ad as HiddenChannelFilter,ae as HiddenState,af as Member,ag as MemberListOrder,ah as MemberListQuery,ai as MemberState,aj as MemberStateFilter,ak as MessageCollection,al as MessageCollectionInitHandler,am as MessageCollectionInitPolicy,an as MessageEventContext,ao as MessageEventSource,ap as MessageFilter,aq as MutedState,ar as OperatorFilter,as as PublicChannelFilter,P as PublicGroupChannelListOrder,at as QueryType,au as ReadStatus,S as SuperChannelFilter,av as UnreadChannelFilter,X as UnreadItemKey}from"./bundle/bundle.shared.js";import{G as m,P as c,a as g}from"./bundle/bundle.groupChannel.js";export{G as GroupChannelCollection,a as GroupChannelHandler,P as PublicGroupChannelListQuery}from"./bundle/bundle.groupChannel.js";import"./vendor/vendor.internal.js";class p extends n{constructor(){super(...arguments),this.name="groupChannel"}init(e,{sdkState:a,cacheContext:n,dispatcher:t,sessionManager:i,requestQueue:s}){super.init(e,{sdkState:a,cacheContext:n,dispatcher:t,sessionManager:i,requestQueue:s}),this._manager=new r(e,{sdkState:a,cacheContext:n,dispatcher:t,sessionManager:i,requestQueue:s})}createGroupChannelCollection(e={}){return new m(this._iid,e)}createMyGroupChannelListQuery(e={}){return new t(this._iid,e)}createPublicGroupChannelListQuery(e={}){return new c(this._iid,e)}addGroupChannelHandler(e,a){i(s("string",e)&&a instanceof g).throw(o.invalidParameters),this._manager.addHandler(e,a)}removeGroupChannelHandler(e){i(s("string",e)).throw(o.invalidParameters),this._manager.removeHandler(e)}removeAllGroupChannelHandlers(){this._manager.clearHandler()}buildGroupChannelFromSerializedData(e){return this._manager.buildGroupChannelFromSerializedData(e)}buildGroupChannelListQueryFromSerializedData(e){return this._manager.buildGroupChannelListQueryFromSerializedData(e)}buildMemberFromSerializedData(e){return this._manager.buildMemberFromSerializedData(e)}getChannel(e){return l(this,void 0,void 0,(function*(){return i(s("string",e)).throw(o.invalidParameters),this._manager.getChannel(e)}))}getChannelWithoutCache(e){return l(this,void 0,void 0,(function*(){return i(s("string",e)).throw(o.invalidParameters),this._manager.getChannelWithoutCache(e)}))}getMyGroupChannelChangeLogsByToken(e,a){return l(this,void 0,void 0,(function*(){return i(s("string",e)&&a instanceof u&&a.validate()).throw(o.invalidParameters),yield this._manager.getMyGroupChannelChangeLogs(e,a)}))}getMyGroupChannelChangeLogsByTimestamp(e,a){return l(this,void 0,void 0,(function*(){return i(s("number",e)&&a instanceof u&&a.validate()).throw(o.invalidParameters),yield this._manager.getMyGroupChannelChangeLogs(e,a)}))}getGroupChannelCount(e){return l(this,void 0,void 0,(function*(){return i(e instanceof h&&e.validate()).throw(o.invalidParameters),this._manager.getGroupChannelCount(e)}))}createChannel(e){return l(this,void 0,void 0,(function*(){return i(e instanceof d&&e.validate()).throw(o.invalidParameters),this._manager.createChannel(e)}))}createDistinctChannelIfNotExist(e){return l(this,void 0,void 0,(function*(){return i(e instanceof d&&e.validate()).throw(o.invalidParameters),e&&(e.isDistinct=!0),this.createChannel(e)}))}createChannelWithUserIds(e,a=!1,n=null,r=null,t="",i=""){return l(this,void 0,void 0,(function*(){const s=new d;return s.addUserIds(e),s.isDistinct=a,s.name=n,s.data=t,s.customType=i,"string"==typeof r?s.coverUrl=r:s.coverImage=r,this.createChannel(s)}))}markAsReadAll(){return l(this,void 0,void 0,(function*(){this._manager.markAsReadAll()}))}markAsReadWithChannelUrls(e){return l(this,void 0,void 0,(function*(){i(C("string",e)).throw(o.invalidParameters),this._manager.markAsReadWithChannelUrls(e)}))}markAsDelivered(e){return l(this,void 0,void 0,(function*(){i(s("string",e)).throw(o.invalidParameters);const a=yield this.getChannel(e);yield a.markAsDelivered()}))}}export{p as GroupChannelModule};