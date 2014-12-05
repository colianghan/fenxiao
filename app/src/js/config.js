/*
 * @author:korealiang 
 * @email: hanguoliang1992@gmail.com
 * @desciption: 用于配置相关的全局信息
 */

var config ={
		route:{
			index:{
				banner:['概况预览'],
				firstChild:[],
				child:[]
			},
			recruit:{
				banner:['招商'],
				firstChild:[
				   ['联系中','未联系']
				],
				child:[{
					href:1,
					name:'同类目卖家库',
					parent:'联系中'
				},{
					href:2,
					name:'相关类目卖家库',
					parent:'联系中'
				},{
					href:3,
					name:'类目分销商',
					parent:'未联系'
				},{
					href:4,
					name:'其他相关卖家',
					parent:'未联系'
				}]
			},
			manage:{
				banner:['分销商管理','分销商品管理'],
				firstChild:[
					['系统分层','自定义分层'],
					['已上架产品','下架中产品']
				],
				child:[{
					href:1,
					name:'运营模型分层',
					parent:'系统分层'
				},{
					href:2,
					name:'能力模型分层',
					parent:'系统分层'
				},{
					href:3,
					name:'潜力模型模式',
					parent:'系统分层'
				},{
					href:4,
					name:'出售中',
					parent:'已上架产品'
				},{
					href:5,
					name:'仓库',
					parent:'下架中产品'
				}]
			},
			improve:{
				banner:['分销提升'],
				firstChild:[
					['黄金关键词','优质渠道','最佳搭配','提升工具']
				],
				child:[{
					href:1,
					name:'高流量、高转化关键词TOP50',
					parent:'黄金关键词'
				},{
					href:2,
					name:'高展现、高点击关键词TOP50',
					parent:'黄金关键词'
				},{
					href:3,
					name:'免费流量',
					parent:'优质渠道'
				},{
					href:4,
					name:'付费流量',
					parent:'优质渠道'
				},{
					href:5,
					name:'最佳搭配宝贝',
					parent:'最佳搭配'
				},{
					href:6,
					name:'提升工具箱',
					parent:'提升工具'
				}]
			},
			behavior:{
				banner:['行为管理'],
				firstChild:[
					['行为管理']
				],
				child:[{
					href:1,
					name:'串货监控',
					parent:'行为管理'
				},{
					href:2,
					name:'乱价监控',
					parent:'行为管理'
				},{
					href:3,
					name:'差评监控',
					parent:'行为管理'
				}]
			},
			compete:{
				banner:['竞争对手分析'],
				firstChild:[],
				child:[]
			}
		}
	}