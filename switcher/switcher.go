package switcher

import (
	"database/sql"
	"encoding/json"
	_ "github.com/mattn/go-sqlite3"
	"net/http"
	"log"
	"strings"
)

func Dispatch(db *sql.DB) Xl {
	return Xl {
		// *************************************
		// select start
		// *************************************
		// 登陆
		"login": func(r *http.Request) (string, interface{}) {
			// 用户名
			user := GetParameter(r, "name")
			// 密码
			pwd := GetParameter(r, "password")
			var cnt int
			err := db.QueryRow("select count(*) from adminInfo where username = ? and password = ?", user, pwd).Scan(&cnt)
			perror(err, "登陆失败")
			if 1 != cnt {
				panic("用户名或者密码错误")
			}
			var a adminInfo
			err = db.QueryRow("select id, username, nickname from adminInfo where username = ? and password = ?", user, pwd).
				Scan(&a.Id, &a.Name, &a.NickName)
			perror(err, "登陆失败")
			return "登陆成功", a
		},
		
		// 获取遗失物品列表
		"getAllLostAndFound": func(r *http.Request) (string, interface{}) {
			// 检索sql
			selectSql := "select id, name, sex, phone, strftime('%Y-%m-%d %H:%M', losttime)," + 
						" dept, dest, num, lostlocation, description from lostandfound order by logtime desc"
			rows, err := db.Query(selectSql)
			defer rows.Close()
			perror(err, "获取遗失物品列表失败")
			var lList []lostAndFoundInfo
			for rows.Next() {
				var l lostAndFoundInfo
				rows.Scan(&l.Id, &l.Name, &l.Sex, &l.Phone, &l.LostTime, &l.Dept, &l.Dest, &l.Num, &l.Lostlocation, &l.Description)
				lList = append(lList, l)
			}
			return "获取遗失物品列表成功", lList
		},
		
		// 获取文明的士列表
		"getAllDrivers": func(r *http.Request) (string, interface{}) {
			// 检索sql
			selectSql := "select c.id, c.name, c.sex, c.phone, c.qcno, c.company, c.carno, sum(g.score) " + 
						"from civilizedTexi c left outer join goodRecord g on c.id = texiId where c.isDelete = 0 group by c.id order by c.id"
			rows, err := db.Query(selectSql)
			defer rows.Close()
			perror(err, "获取文明的士列表失败")
			var dList []driverInfo
			var ids []string
			for rows.Next() {
				var d driverInfo
				var score sql.NullInt64
				rows.Scan(&d.Id, &d.Name, &d.Sex, &d.Phone, &d.QcNo, &d.Company, &d.CarNo, &score)
				d.Score = getNullData(score, 0, SQL_NULL_INT64).Int()
				dList = append(dList, d)
				ids = append(ids, "'" + d.QcNo + "'")
			}
			// 取得已经兑换的积分
			sList := getExchangedScore("http://127.0.0.1:11004/relay", strings.Join(ids, ","))
			// 计算当前积分
			for i, d := range dList {
				for j, s := range sList {
					// 有兑换记录的情况
					if s.QcNo == d.QcNo {
						// 计算扣除兑换过的积分
						dList[i].Score = dList[i].Score - sList[j].Score
					}
				}
			}
			return "获取文明的士列表成功", dList
		},
		
		// 获取的士文明记录
		"getGoodRecords": func(r *http.Request) (string, interface{}) {
			// 检索sql
			selectSql := "select id, name, strftime('%Y-%m-%d %H:%M', happenedTime), score from goodRecord where texiId = ?"
			// 的士编号
			texiId := GetParameter(r, "texiId")
			rows, err := db.Query(selectSql, texiId)
			defer rows.Close()
			perror(err, "获取的士文明记录失败")
			var gList []goodRecord
			for rows.Next() {
				var g goodRecord
				rows.Scan(&g.Id, &g.Name, &g.HappenedTime, &g.Score)
				gList = append(gList, g)
			}
			return "获取的士文明记录成功", gList
		},
		// *************************************
		// select end
		// *************************************
		// *************************************
		// insert start
		// *************************************
		// 文明的士登记
		"newDriver": func(r *http.Request) (string, interface{}) {
			// 插入sql
			insertSql := "insert into civilizedTexi (openid, name, sex, phone, qcno, company, carno, remark) values (?, ?, ?, ?, ?, ?, ?, ?)"
			// openid
			openid := GetParameter(r, "openid")
			// 姓名
			name := GetParameter(r, "name")
			// 性别
			sex := GetParameter(r, "sex")
			// 电话
			phone := GetParameter(r, "phone")
			// 从业资格证号码
			qcno := GetParameter(r, "qcno")
			// 所在公司
			company := GetParameter(r, "company")
			// 车牌号
			carno := GetParameter(r, "carno")
			// 备注
			remark := GetParameter(r, "remark")
			// 开始事务
			tx, err := db.Begin()
			// 异常情况下回滚
			perrorWithRollBack(err, "文明的士登记失败", tx)
			stmt, err := tx.Prepare(insertSql)
			perrorWithRollBack(err, "文明的士登记失败", tx)
			result, err := stmt.Exec(openid, name, sex, phone, qcno, company, carno, remark)
			perrorWithRollBack(err, "文明的士登记失败", tx)
			rowid, err := result.LastInsertId()
			perrorWithRollBack(err, "文明的士登记失败", tx)
			// 提交事务
			tx.Commit()
			return "文明的士登记成功", rowid
		},
		
		// 添加文明记录
		"newGoodRecord": func(r *http.Request) (string, interface{}) {
			// 插入sql
			insertSql := "insert into goodRecord (name, rType, texiId, lafId, happenedTime, score) values (?, ?, ?, ?, datetime(?), ?)"
			// 文明内容
			name := GetParameter(r, "name")
			// 文明类型（暂时没用）
			rType := GetParameter(r, "rType")
			// 的士编号
			texiId := GetParameter(r, "texiId")
			// 失物编号（暂时没用）
			lafId := GetParameter(r, "lafId")
			// 发生时间
			hTime := GetParameter(r, "hTime")
			// 添加积分
			score := GetParameter(r, "score")
			
			// 开始事务
			tx, err := db.Begin()
			// 异常情况下回滚
			perrorWithRollBack(err, "添加文明记录失败", tx)
			stmt, err := tx.Prepare(insertSql)
			perrorWithRollBack(err, "添加文明记录失败", tx)
			if "0" == rType {
				_, err = stmt.Exec(name, rType, texiId, lafId, hTime, score)
			} else {
				_, err = stmt.Exec(name, rType, texiId, nil, hTime, score)
			}
			perrorWithRollBack(err, "添加文明记录失败", tx)
			// 提交事务
			tx.Commit()
			return "添加文明记录成功", nil
		},
		// *************************************
		// insert end
		// *************************************
		// *************************************
		// update start
		// *************************************
		// 修改密码
		"changepassword": func(r *http.Request) (string, interface{}) {
			// 用户名
			username := GetParameter(r, "username")
			// 密码
			password := GetParameter(r, "password")
			// 新密码
			newpwd := GetParameter(r, "newpwd")
			// 检测旧密码正确
			var cnt int
			err := db.QueryRow("select count(*) from adminInfo where username = ? and password = ?", username, password).Scan(&cnt)
			perror(err, "修改密码失败")
			if 0 == cnt {
				panic("旧密码错误，禁止修改!")
			} else {
				// 开始事务
				tx, err := db.Begin()
				// 异常情况下回滚
				perrorWithRollBack(err, "修改密码失败", tx)
				// 修改密码
				stmt, err := db.Prepare("update adminInfo set password = ? where username = ? and password = ?")
				defer stmt.Close()
				perrorWithRollBack(err, "修改密码失败", tx)
				_, err = stmt.Exec(newpwd, username, password)
				perrorWithRollBack(err, "修改密码失败", tx)
				// 提交事务
				tx.Commit()
			}
			return "修改密码成功", nil
		},
		
		// 逻辑删除文明的士信息
		"removeTexiDriver": func(r *http.Request) (string, interface{}) {
			// 更新sql
			updateSql := "update civilizedTexi set isDelete = 1 where id = ?"
			// 记录编号
			id := GetParameter(r, "id")
			log.Println(id)
			// 开始事务
			tx, err := db.Begin()
			// 异常情况下回滚
			perrorWithRollBack(err, "删除文明的士信息失败", tx)
			// 逻辑删除的士信息
			_, err = tx.Exec(updateSql, id)
			perrorWithRollBack(err, "删除文明的士信息失败", tx)
			// 提交事务
			tx.Commit()
			return "删除文明的士信息成功", nil
		},
		// *************************************
		// update end
		// *************************************
		// *************************************
		// delete start
		// *************************************
		// 删除失物信息
		"deleteLostAndFount": func(r *http.Request) (string, interface{}) {
			// 删除sql
			deleteSql := "delete from lostAndFound where id = ?"
			// 失物信息编号
			id := GetParameter(r, "id")
			// 开始事务
			tx, err := db.Begin()
			// 异常情况下回滚
			perrorWithRollBack(err, "删除失物信息失败", tx)
			stmt, err := tx.Prepare(deleteSql)
			defer stmt.Close()
			perrorWithRollBack(err, "删除失物信息失败", tx)
			_, err = stmt.Exec(id)
			perrorWithRollBack(err, "删除失物信息失败", tx)
			// 提交事务
			tx.Commit()
			return "删除失物信息成功", nil
		},
		
//		// 删除文明的士信息
//		"deleteTexiDriver": func(r *http.Request) (string, interface{}) {
//			// 删除sql
//			deleteSql := "delete from civilizedTexi where id = ?"
//			delete2Sql := "delete from goodRecord where texiId = ?"
//			// 记录编号
//			id := GetParameter(r, "id")
//			log.Println(id)
//			// 开始事务
//			tx, err := db.Begin()
//			// 异常情况下回滚
//			perrorWithRollBack(err, "删除文明的士信息失败", tx)
//			// 删除好人好事记录
//			_, err = tx.Exec(delete2Sql, id)
//			perrorWithRollBack(err, "删除文明的士信息失败", tx)
//			// 删除的士信息
//			_, err = tx.Exec(deleteSql, id)
//			perrorWithRollBack(err, "删除文明的士信息失败", tx)
//			// 提交事务
//			tx.Commit()
//			return "删除文明的士信息成功", nil
//		},
		// *************************************
		// delete end
		// *************************************
	}
}

// 获取司机已经兑换的积分
func getExchangedScore(addr, qcnos string) []exchangedScores {
	// 拼请求的参数
	p := make(UrlParam)
	p["cmd"] = "getScores"
	p["open_ids"] = qcnos
	// 发送请求
	str := sendHttpGetReq(addr, p)
	// 解析返回数据
	var rtn []exchangedScores
	err := json.Unmarshal(str, &rtn)
	perror(err, "获取兑换积分失败")
	return rtn
}