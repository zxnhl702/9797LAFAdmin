package switcher

import ()

// 管理员信息
type adminInfo struct {
	Id       int    `json:"id"`   // 管理员编号
	Name     string `json:"name"` // 管理员用户名
	NickName string `json:"nick"` // 管理员昵称
}

// 遗失物品信息
type lostAndFoundInfo struct {
	Id           int    `json:"id"`          // 遗失物品编号
	Name         string `json:"name"`        // 失主姓名
	Sex          int    `json:"sex"`         // 失主性别
	Phone        string `json:"phone"`       // 失主电话
	LostTime     string `json:"losttime"`    // 丢失时间
	Dept         string `json:"dept"`        // 上车地点
	Dest         string `json:"dest"`        // 下车地点
	Num          int    `json:"num"`         // 乘车人数
	Lostlocation string `json:"pos"`         // 遗失位置
	Description  string `json:"description"` // 失物描述
}

// 文明的士信息
type driverInfo struct {
	Id      int    `json:"id"`      // 文明的士编号
	Name    string `json:"name"`    // 姓名
	Sex     int    `json:"sex"`     // 性别
	Phone   string `json:"phone"`   // 电话
	Company string `json:"company"` // 所在公司
	CarNo   string `json:"carno"`   // 车牌号
	QcNo    string `json:"qcno"`    // 从业资格证号
	Score   int64  `json:"score"`   // 积分
}

// 的士文明记录
type goodRecord struct {
	Id           int    `json:"id"`    // 记录编号
	Name         string `json:"name"`  // 名称
	HappenedTime string `json:"htime"` // 发生时间
	Score        int    `json:"score"` // 积分
}

// 兑换过的积分
type exchangedScores struct {
	QcNo  string `json:"qcno"`  // 从业资格证号
	Score int64  `json:"score"` // 积分
}

// 兑换过积分查询的返回数据结构
type RtnDataExchScores struct {
	Success bool              `json:"success"`
	ErrMsg  string            `json:"errMsg"`
	Data    []exchangedScores `json:"data"`
}
