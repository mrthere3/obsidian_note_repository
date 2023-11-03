---
categories: 
cover: 
title: gorm 使用记录
created: 2023-10-31 09:34
updated: 2023-10-31 09:35
number headings: auto, first-level 1, max 6, 1.1
---
# 1 *GORM 介绍*
GORM 是使用 Go 语言开发的友好的 ORM 库。

# 2 GORM 安装
```shell
go get -u github.com/jinzhu/gorm
```

# 3 连接池
```go
   // 获取通用数据库对象`*sql.DB`以使用其函数
    db.DB()

    // Ping
    db.DB().Ping()
    //连接池
    db.DB().SetMaxIdleConns(10)
    db.DB().SetMaxOpenConns(100)
```

# 4 *GORM 开启日志*
GORM 有一个默认的 logger 实现,默认情况下,它会打印慢 sql 和错误
下面是官方的例子:

```go
newLogger := logger.New(
  log.New(os.Stdout, "\r\n", log.LstdFlags), // io writer
  logger.Config{
    SlowThreshold: time.Second,   // 慢 SQL 阈值
    LogLevel:      logger.Silent, // Log level
    Colorful:      false,         // 禁用彩色打印
  },
)

// 全局模式
db, err := gorm.Open(sqlite.Open("test.db"), &gorm.Config{
  Logger: newLogger,
})

// 新建会话模式
tx := db.Session(&Session{Logger: newLogger})
tx.First(&user)
tx.Model(&user).Update("Age", 18)
```

日志等级
GORM 定义了这些日志级别：`Silent`、`Error`、`Warn`、`Info`
```go
	db, err := gorm.Open(sqlite.Open("test.db"), &gorm.Config{
  Logger: logger.Default.LogMode(logger.Silent),
})
```

下面是项目中的个性化的例子
这个实现了一个 logger 类
```go
package internal

import (
	"fmt"
	"gorm.io/gorm/logger"
	"main.go/global"
)

type writer struct {
	logger.Writer
}

// NewWriter writer 构造函数
// Author [SliverHorn](https://github.com/SliverHorn)
func NewWriter(w logger.Writer) *writer {
	return &writer{Writer: w}
}

// Printf 格式化打印日志
// Author [SliverHorn](https://github.com/SliverHorn)
func (w *writer) Printf(message string, data ...interface{}) {
	var logZap bool
	switch global.GVA_CONFIG.System.DbType {
	case "mysql":
		logZap = global.GVA_CONFIG.Mysql.LogZap
	}
	if logZap {
		global.GVA_LOG.Info(fmt.Sprintf(message+"\n", data...))
	} else {
		w.Writer.Printf(message, data...)
	}
}
```

```go
package internal

import (
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"log"
	"main.go/global"
	"os"
	"time"
)

var Gorm = new(_gorm)

type _gorm struct{}

// Config gorm 自定义配置
// Author [SliverHorn](https://github.com/SliverHorn)
func (g *_gorm) Config() *gorm.Config {
	config := &gorm.Config{DisableForeignKeyConstraintWhenMigrating: true}
	_default := logger.New(NewWriter(log.New(os.Stdout, "\r\n", log.LstdFlags)), logger.Config{
		SlowThreshold: 200 * time.Millisecond,
		LogLevel:      logger.Warn,
		Colorful:      true,
	})
	switch global.GVA_CONFIG.Mysql.LogMode {
	case "silent", "Silent":
		config.Logger = _default.LogMode(logger.Silent)
	case "error", "Error":
		config.Logger = _default.LogMode(logger.Error)
	case "warn", "Warn":
		config.Logger = _default.LogMode(logger.Warn)
	case "info", "Info":
		config.Logger = _default.LogMode(logger.Info)
	default:
		config.Logger = _default.LogMode(logger.Info)
	}
	return config
}
```

*初始化 GORM*
```go
package initialize

import (
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"main.go/global"
	"main.go/initialize/internal"
)

func GormMysql() *gorm.DB {
	m := global.GVA_CONFIG.Mysql
	if m.Dbname == "" {
		return nil
	}
	mysqlConfig := mysql.Config{
		DSN:                       m.Dsn(), // DSN data source name
		DefaultStringSize:         191,     // string 类型字段的默认长度
		SkipInitializeWithVersion: false,   // 根据版本自动配置
	}
	if db, err := gorm.Open(mysql.New(mysqlConfig), internal.Gorm.Config()); err != nil {
		return nil
	} else {
		sqlDB, _ := db.DB()
		sqlDB.SetMaxIdleConns(m.MaxIdleConns)
		sqlDB.SetMaxOpenConns(m.MaxOpenConns)
		return db
	}

}
```

# 5 GORM 查询
## 5.1 查询
```go
   // 获取第一条记录，按主键排序
    db.First(&user)
    //// SELECT * FROM users ORDER BY id LIMIT 1;

    // 获取最后一条记录，按主键排序
    db.Last(&user)
    //// SELECT * FROM users ORDER BY id DESC LIMIT 1;

    // 获取所有记录
    db.Find(&users)
    //// SELECT * FROM users;

    // 使用主键获取记录
    db.First(&user, 10)
    //// SELECT * FROM users WHERE id = 10;
```

## 5.2 where 查询
```go
    // 获取第一个匹配记录
    db.Where("name = ?", "jinzhu").First(&user)
    //// SELECT * FROM users WHERE name = 'jinzhu' limit 1;

    // 获取所有匹配记录
    db.Where("name = ?", "jinzhu").Find(&users)
    //// SELECT * FROM users WHERE name = 'jinzhu';

    db.Where("name <> ?", "jinzhu").Find(&users)

    // IN
    db.Where("name in (?)", []string{"jinzhu", "jinzhu 2"}).Find(&users)

    // LIKE
    db.Where("name LIKE ?", "%jin%").Find(&users)

    // AND
    db.Where("name = ? AND age >= ?", "jinzhu", "22").Find(&users)

    // Time
    db.Where("updated_at > ?", lastWeek).Find(&users)

    db.Where("created_at BETWEEN ? AND ?", lastWeek, today).Find(&users)
```

## 5.3 Where 查询条件 (Struct & Map)
```go
 // Struct
    db.Where(&User{Name: "jinzhu", Age: 20}).First(&user)
    //// SELECT * FROM users WHERE name = "jinzhu" AND age = 20 LIMIT 1;

    // Map
    db.Where(map[string]interface{}{"name": "jinzhu", "age": 20}).Find(&users)
    //// SELECT * FROM users WHERE name = "jinzhu" AND age = 20;

    // 主键的Slice
    db.Where([]int64{20, 21, 22}).Find(&users)
    //// SELECT * FROM users WHERE id IN (20, 21, 22);
```
## 5.4 NOT 条件查询
```go
    db.Not("name", "jinzhu").First(&user)
    //// SELECT * FROM users WHERE name <> "jinzhu" LIMIT 1;

    // Not In
    db.Not("name", []string{"jinzhu", "jinzhu 2"}).Find(&users)
    //// SELECT * FROM users WHERE name NOT IN ("jinzhu", "jinzhu 2");

    // Not In slice of primary keys
    db.Not([]int64{1,2,3}).First(&user)
    //// SELECT * FROM users WHERE id NOT IN (1,2,3);

    db.Not([]int64{}).First(&user)
    //// SELECT * FROM users;

    // Plain SQL
    db.Not("name = ?", "jinzhu").First(&user)
    //// SELECT * FROM users WHERE NOT(name = "jinzhu");

    // Struct
    db.Not(User{Name: "jinzhu"}).First(&user)
    //// SELECT * FROM users WHERE name <> "jinzhu";
```

## 5.5 带内联条件的查询
```go
    // 按主键获取
    db.First(&user, 23)
    //// SELECT * FROM users WHERE id = 23 LIMIT 1;

    // 简单SQL
    db.Find(&user, "name = ?", "jinzhu")
    //// SELECT * FROM users WHERE name = "jinzhu";

    db.Find(&users, "name <> ? AND age > ?", "jinzhu", 20)
    //// SELECT * FROM users WHERE name <> "jinzhu" AND age > 20;

    // Struct
    db.Find(&users, User{Age: 20})
    //// SELECT * FROM users WHERE age = 20;

    // Map
    db.Find(&users, map[string]interface{}{"age": 20})
    //// SELECT * FROM users WHERE age = 20;
```

## 5.6 OR 条件查询
```go
   db.Where("role = ?", "admin").Or("role = ?", "super_admin").Find(&users)
    //// SELECT * FROM users WHERE role = 'admin' OR role = 'super_admin';

    // Struct
    db.Where("name = 'jinzhu'").Or(User{Name: "jinzhu 2"}).Find(&users)
    //// SELECT * FROM users WHERE name = 'jinzhu' OR name = 'jinzhu 2';

    // Map
    db.Where("name = 'jinzhu'").Or(map[string]interface{}{"name": "jinzhu 2"}).Find(&users)
```

## 5.7 查询链(链式调用)
```go
	 db.Where("name <> ?","jinzhu").Where("age >= ? and role <> ?",20,"admin").Find(&users)
    //// SELECT * FROM users WHERE name <> 'jinzhu' AND age >= 20 AND role <> 'admin';

    db.Where("role = ?", "admin").Or("role = ?", "super_admin").Not("name = ?", "jinzhu").Find(&users)
```

## 5.8 FirstOrInit
获取第一个匹配的记录，或者使用给定的条件初始化一个新的记录（仅适用于struct，map条件）
```go
   // Unfound
    db.FirstOrInit(&user, User{Name: "non_existing"})
    //// user -> User{Name: "non_existing"}

    // Found
    db.Where(User{Name: "Jinzhu"}).FirstOrInit(&user)
    //// user -> User{Id: 111, Name: "Jinzhu", Age: 20}
    db.FirstOrInit(&user, map[string]interface{}{"name": "jinzhu"})
    //// user -> User{Id: 111, Name: "Jinzhu", Age: 20}
```
## 5.9 Attrs
如果未找到记录，则使用参数初始化结构

```go
  // Unfound
    db.Where(User{Name: "non_existing"}).Attrs(User{Age: 20}).FirstOrInit(&user)
    //// SELECT * FROM USERS WHERE name = 'non_existing';
    //// user -> User{Name: "non_existing", Age: 20}

    db.Where(User{Name: "non_existing"}).Attrs("age", 20).FirstOrInit(&user)
    //// SELECT * FROM USERS WHERE name = 'non_existing';
    //// user -> User{Name: "non_existing", Age: 20}

    // Found
    db.Where(User{Name: "Jinzhu"}).Attrs(User{Age: 30}).FirstOrInit(&user)
    //// SELECT * FROM USERS WHERE name = jinzhu';
    //// user -> User{Id: 111, Name: "Jinzhu", Age: 20}
```

## 5.10 Assign
将参数分配给结果，不管它是否被找到
```go
    db.Where(User{Name: "non_existing"}).Assign(User{Age: 20}).FirstOrInit(&user)
    //// user -> User{Name: "non_existing", Age: 20}

    // Found
    db.Where(User{Name: "Jinzhu"}).Assign(User{Age: 30}).FirstOrInit(&user)
    //// SELECT * FROM USERS WHERE name = jinzhu';
    //// user -> User{Id: 111, Name: "Jinzhu", Age: 30}
```

## 5.11 Select
指定要从数据库检索的字段，默认情况下，将选择所有字段;
```go

    db.Select("name, age").Find(&users)
    //// SELECT name, age FROM users;

    db.Select([]string{"name", "age"}).Find(&users)
    //// SELECT name, age FROM users;

    db.Table("users").Select("COALESCE(age,?)", 42).Rows()
    //// SELECT COALESCE(age,'42') FROM users;
```

## 5.12 Order
在从数据库检索记录时指定顺序，将重排序设置为true以覆盖定义的条件
```go
 db.Order("age desc, name").Find(&users)
    //// SELECT * FROM users ORDER BY age desc, name;

    // Multiple orders
    db.Order("age desc").Order("name").Find(&users)
    //// SELECT * FROM users ORDER BY age desc, name;

    // ReOrder
    db.Order("age desc").Find(&users1).Order("age", true).Find(&users2)
    //// SELECT * FROM users ORDER BY age desc; (users1)
    //// SELECT * FROM users ORDER BY age; (users2)
```

## 5.13 Limit
指定要检索的记录数

```go
    db.Limit(3).Find(&users)
    //// SELECT * FROM users LIMIT 3;

    // Cancel limit condition with -1
    db.Limit(10).Find(&users1).Limit(-1).Find(&users2)
    //// SELECT * FROM users LIMIT 10; (users1)
    //// SELECT * FROM users; (users2)
```

## 5.14 offset
指定在开始返回记录之前要跳过的记录数
```go
   db.Offset(3).Find(&users)
    //// SELECT * FROM users OFFSET 3;

    // Cancel offset condition with -1
    db.Offset(10).Find(&users1).Offset(-1).Find(&users2)
    //// SELECT * FROM users OFFSET 10; (users1)
    //// SELECT * FROM users; (users2)
```

## 5.15 Count
获取模型的记录数
```go
    db.Where("name = ?", "jinzhu").Or("name = ?", "jinzhu 2").Find(&users).Count(&count)
    //// SELECT * from USERS WHERE name = 'jinzhu' OR name = 'jinzhu 2'; (users)
    //// SELECT count(*) FROM users WHERE name = 'jinzhu' OR name = 'jinzhu 2'; (count)

    db.Model(&User{}).Where("name = ?", "jinzhu").Count(&count)
    //// SELECT count(*) FROM users WHERE name = 'jinzhu'; (count)

    db.Table("deleted_users").Count(&count)
    //// SELECT count(*) FROM deleted_users;
```

## 5.16 Group & Having
```go
rows, err := db.Table("orders").Select("date(created_at) as date, sum(amount) as total").Group("date(created_at)").Rows()
    for rows.Next() {
        ...
    }

    rows, err := db.Table("orders").Select("date(created_at) as date, sum(amount) as total").Group("date(created_at)").Having("sum(amount) > ?", 100).Rows()
    for rows.Next() {
        ...
    }

    type Result struct {
        Date  time.Time
        Total int64
    }
    db.Table("orders").Select("date(created_at) as date, sum(amount) as total").Group("date(created_at)").Having("sum(amount) > ?", 100).Scan(&results)
```

## 5.17 Join
指定连接条件

```go
rows, err := db.Table("users").Select("users.name, emails.email").Joins("left join emails on emails.user_id = users.id").Rows()
    for rows.Next() {
        ...
    }

    db.Table("users").Select("users.name, emails.email").Joins("left join emails on emails.user_id = users.id").Scan(&results)

    // 多个连接与参数
    db.Joins("JOIN emails ON emails.user_id = users.id AND emails.email = ?", "jinzhu@example.org").Joins("JOIN credit_cards ON credit_cards.user_id = users.id").Where("credit_cards.number = ?", "411111111111").Find(&user)
```

## 5.18 Pluck
将模型中的单个列作为地图查询，如果要查询多个列，可以使用 Scan
```go
    var ages []int64
    db.Find(&users).Pluck("age", &ages)

    var names []string
    db.Model(&User{}).Pluck("name", &names)

    db.Table("deleted_users").Pluck("name", &names)

    // 要返回多个列，做这样：
    db.Select("name, age").Find(&users)
```

## 5.19 Scan
将结果扫描到另一个结构中。
```go
 type Result struct {
        Name string
        Age  int
    }

    var result Result
    db.Table("users").Select("name, age").Where("name = ?", 3).Scan(&result)

    // Raw SQL
    db.Raw("SELECT name, age FROM users WHERE name = ?", 3).Scan(&result)
```

## 5.20 Scopes
将当前数据库连接传递到 `func(*DB) *DB`，可以用于动态添加条件
```go
   func AmountGreaterThan1000(db *gorm.DB) *gorm.DB {
        return db.Where("amount > ?", 1000)
    }

    func PaidWithCreditCard(db *gorm.DB) *gorm.DB {
        return db.Where("pay_mode_sign = ?", "C")
    }

    func PaidWithCod(db *gorm.DB) *gorm.DB {
        return db.Where("pay_mode_sign = ?", "C")
    }

    func OrderStatus(status []string) func (db *gorm.DB) *gorm.DB {
        return func (db *gorm.DB) *gorm.DB {
            return db.Scopes(AmountGreaterThan1000).Where("status in (?)", status)
        }
    }

    db.Scopes(AmountGreaterThan1000, PaidWithCreditCard).Find(&orders)
    // 查找所有信用卡订单和金额大于1000

    db.Scopes(AmountGreaterThan1000, PaidWithCod).Find(&orders)
    // 查找所有COD订单和金额大于1000

    db.Scopes(OrderStatus([]string{"paid", "shipped"})).Find(&orders)
    // 查找所有付费，发货订单
```
# 6 GORM 更新
## 6.1 更新全部字段
Save 将包括执行更新 SQL 时的所有字段，即使它没有更改
```go
  db.First(&user)

    user.Name = "jinzhu 2"
    user.Age = 100
    db.Save(&user)

    //// UPDATE users SET name='jinzhu 2', age=100, birthday='2016-01-01', updated_at = '2013-11-17 21:34:10' WHERE id=111;
```

## 6.2 更新更改字段
如果只想更新更改的字段，可以使用 Update,Updates
```go
 // 更新单个属性（如果更改）
    db.Model(&user).Update("name", "hello")
    //// UPDATE users SET name='hello', updated_at='2013-11-17 21:34:10' WHERE id=111;

    // 使用组合条件更新单个属性
    db.Model(&user).Where("active = ?", true).Update("name", "hello")
    //// UPDATE users SET name='hello', updated_at='2013-11-17 21:34:10' WHERE id=111 AND active=true;

    // 使用`map`更新多个属性，只会更新这些更改的字段
    db.Model(&user).Updates(map[string]interface{}{"name": "hello", "age": 18, "actived": false})
    //// UPDATE users SET name='hello', age=18, actived=false, updated_at='2013-11-17 21:34:10' WHERE id=111;

    // 使用`struct`更新多个属性，只会更新这些更改的和非空白字段
    db.Model(&user).Updates(User{Name: "hello", Age: 18})
    //// UPDATE users SET name='hello', age=18, updated_at = '2013-11-17 21:34:10' WHERE id = 111;

    // 警告:当使用struct更新时，FORM将仅更新具有非空值的字段
    // 对于下面的更新，什么都不会更新为""，0，false是其类型的空白值
    db.Model(&user).Updates(User{Name: "", Age: 0, Actived: false})
```

## 6.3 更新选择的字段
如果您只想在更新时更新或忽略某些字段，可以使用 Select,Omit
```go
db.Model(&user).Select("name").Updates(map[string]interface{}{"name": "hello", "age": 18, "actived": false})
    //// UPDATE users SET name='hello', updated_at='2013-11-17 21:34:10' WHERE id=111;

    db.Model(&user).Omit("name").Updates(map[string]interface{}{"name": "hello", "age": 18, "actived": false})
    //// UPDATE users SET age=18, actived=false, updated_at='2013-11-17 21:34:10' WHERE id=111;

```

## 6.4 更新更改字段但不进行 Callbacks
以上更新操作将执行模型的 BeforeUpdate,AfterUpdate 方法，更新其 UpdatedAt 时间戳，在更新时保存它的 Associations，如果不想调用它们，可以使用 UpdateColumn,UpdateColumns
```go
    // 更新单个属性，类似于`Update`
    db.Model(&user).UpdateColumn("name", "hello")
    //// UPDATE users SET name='hello' WHERE id = 111;

    // 更新多个属性，与“更新”类似
    db.Model(&user).UpdateColumns(User{Name: "hello", Age: 18})
    //// UPDATE users SET name='hello', age=18 WHERE id = 111;
```

## 6.5 Batch Updates 批量更新
Callbacks 在批量更新时不会运行
```go
    db.Table("users").Where("id IN (?)", []int{10, 11}).Updates(map[string]interface{}{"name": "hello", "age": 18})
    //// UPDATE users SET name='hello', age=18 WHERE id IN (10, 11);

    // 使用struct更新仅适用于非零值，或使用map[string]interface{}
    db.Model(User{}).Updates(User{Name: "hello", Age: 18})
    //// UPDATE users SET name='hello', age=18;

    // 使用`RowsAffected`获取更新记录计数
    db.Model(User{}).Updates(User{Name: "hello", Age: 18}).RowsAffected
```

## 6.6 使用 SQL 表达式更新
```go
DB.Model(&product).Update("price", gorm.Expr("price * ? + ?", 2, 100))
    //// UPDATE "products" SET "price" = price * '2' + '100', "updated_at" = '2013-11-17 21:34:10' WHERE "id" = '2';

    DB.Model(&product).Updates(map[string]interface{}{"price": gorm.Expr("price * ? + ?", 2, 100)})
    //// UPDATE "products" SET "price" = price * '2' + '100', "updated_at" = '2013-11-17 21:34:10' WHERE "id" = '2';

    DB.Model(&product).UpdateColumn("quantity", gorm.Expr("quantity - ?", 1))
    //// UPDATE "products" SET "quantity" = quantity - 1 WHERE "id" = '2';

    DB.Model(&product).Where("quantity > 1").UpdateColumn("quantity", gorm.Expr("quantity - ?", 1))
    //// UPDATE "products" SET "quantity" = quantity - 1 WHERE "id" = '2' AND quantity > 1;
```

# 7 GORM 删除
## 7.1 删除/软删除
警告删除记录时，需要确保其主要字段具有值，GORM 将使用主键删除记录，如果主要字段为空，GORM 将删除模型的所有记录
```go
   // 删除存在的记录
    db.Delete(&email)
    //// DELETE from emails where id=10;

    // 为Delete语句添加额外的SQL选项
    db.Set("gorm:delete_option", "OPTION (OPTIMIZE FOR UNKNOWN)").Delete(&email)
    //// DELETE from emails where id=10 OPTION (OPTIMIZE FOR UNKNOWN);
```

## 7.2 批量删除
删除所有匹配记录

```go
    db.Where("email LIKE ?", "%jinzhu%").Delete(Email{})
    //// DELETE from emails where email LIKE "%jinhu%";

    db.Delete(Email{}, "email LIKE ?", "%jinzhu%")
    //// DELETE from emails where email LIKE "%jinhu%";
```

# 8 错误处理
执行任何操作后，如果发生任何错误，GORM 将其设置为 `*DB` 的 Error 字段
```go
    if err := db.Where("name = ?", "jinzhu").First(&user).Error; err != nil {
        // 错误处理...
    }

    // 如果有多个错误发生，用`GetErrors`获取所有的错误，它返回`[]error`
    db.First(&user).Limit(10).Find(&users).GetErrors()

    // 检查是否返回RecordNotFound错误
    db.Where("name = ?", "hello world").First(&user).RecordNotFound()

    if db.Model(&user).Related(&credit_card).RecordNotFound() {
        // 没有信用卡被发现处理...
    }
```

# 9 *GORM 事务*
要在事务中执行一组操作，一般流程如下。
```go
    // 开始事务
    tx := db.Begin()

    // 在事务中做一些数据库操作（从这一点使用'tx'，而不是'db'）
    tx.Create(...)

    // ...

    // 发生错误时回滚事务
    tx.Rollback()

    // 或提交事务
    tx.Commit()
```

```go
    func CreateAnimals(db *gorm.DB) err {
      tx := db.Begin()
      // 注意，一旦你在一个事务中，使用tx作为数据库句柄

      if err := tx.Create(&Animal{Name: "Giraffe"}).Error; err != nil {
         tx.Rollback()
         return err
      }

      if err := tx.Create(&Animal{Name: "Lion"}).Error; err != nil {
         tx.Rollback()
         return err
      }

      tx.Commit()
      return nil
    }
```

参考资料 [GORM · Go语言中文文档 (topgoer.com)](https://www.topgoer.com/%E6%95%B0%E6%8D%AE%E5%BA%93%E6%93%8D%E4%BD%9C/gorm/)
