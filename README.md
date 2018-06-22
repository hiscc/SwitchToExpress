## SwitchToExpress

本项目将基于 Express 从零开始搭建一个功能完备的博客系统
1\. [开始， Express 基础及模型基础操作](https://github.com/hiscc/SwitchToExpress/tree/authentication) `git checkout master`
1\. [注册登录， 用户注册及第三方登录](https://github.com/hiscc/SwitchToExpress/tree/authentication) `git checkout authentication`
1\. [mongoose 更进一步， 为文章添加标签和评论](https://github.com/hiscc/SwitchToExpress/tree/models)  `git checkout models`
1\. [文章系统， 文章分页、 排序、 搜索、 多级评论](https://github.com/hiscc/SwitchToExpress/tree/ui)  `git checkout ui`
1\. [文件上传， 为用户添加图库](https://github.com/hiscc/SwitchToExpress/tree/images)  `git checkout images`
1\. [初探 WebSockets， 实时聊天室 ](https://github.com/hiscc/SwitchToExpress/tree/websocket)  `git checkout websocket`

* * *

在本节我们主要是对 Sequelize 「ORM」的使用进行总结。

1.  sequelize 入门、配置
2.  mysql 模型关系及一般使用

### 基本概念

Sequelize 是一个 ORM 「类比与 rails 端的 Active Record」，主要用于对关系型数据库的操作。它在底层抽象了 sql 语句并转换成更易读的对象语法。它让我们可以忽略具体的数据库语法，只使用统一的操作语法「即所谓的无关数据库」。我们只需要关注业务逻辑即可。

要使用 sequelize 首先需要安装 sequelize 及相应的数据库包，我们以 mysql 为例：

```js
npm install --save sequelize
npm install --save mysql2
```

安装好之后，首先需要在本地启动你的数据库，然后即可在程序中配置链接并链接服务。

```js
const Sequelize = require('sequelize');
const sequelize = new Sequelize('database', 'username', 'password', {
  // 数据库名称、用户名、密码
  host: 'localhost',  // 数据库地址
  port: 3306,         // 数据库端口默认 3306 ，这条配置可省略
  timezone: '+08:00',
  dialectOptions: {dateStrings: true, typeCast: true}，

  // 时区配置，配置为东八区即中国时区
  dialect: 'mysql',
  // dialect: 'mysql'|'sqlite'|'postgres'|'mssql',
  // 数据库类别，目前支持这四种数据库, 这里配置为 mysql
  operatorsAliases: false,
  // 操作别名，在查询操作时会用到，目前不需要
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  // 链接池配置


  // storage: 'path/to/database.sqlite'
  // SQLite only， 本配置为 SQLite 数据库专有
});

// 你也可以直接连接一个远程的数据库，在我们这里不需要
// const sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname');

// 具体的链接配置在 http://docs.sequelizejs.com/class/lib/sequelize.js~Sequelize.html#instance-constructor-constructor
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// 用于测试数据库的连接是否正常
```

#### 模型

配置连接好数据库后，我们就可以操作模型了。

##### 模型关系

在关系型数据库内，主要有三种模型关系。 下面介绍 sequelize 中的相关实现：

###### 一对一

单一模型关系，典型的如一个人属于一个团队，一个团队只有一个老板

sequelize 有两种方法来建立一对一关系，区别于外键在主语还是宾语上

```js
Person.hasOne(Team)

// team 表里有 personId

Person.belongsTo(Team)

// person 表里有 teamId
```

###### 多对一、一对多

```js
Team.hasMany(Person)

// Person 表内有 teamId
Person.belongsTo(Team)


// 同时申明多和一部分的模型。就可以以多查一、以一查多了。

// sequelize 为我们提供了简便的方法来确定关系。以上面的两个模型为例子：

team.createPerson({name: 'abc'})
team.addPerson(personId: 1)

Person.create({name: 'abc', teamId: 1})
```

###### 多对多

典型的多对多关系比如标签与文章的关系，一个标签下可有有多篇文章，一篇文章下也可有有多个标签。一个文章实例对应着多个标签实例，而一个标签实例也对应着多个文章实例。这样就可以实现查询某一标签的所有文章或查询某一文章的所有标签了。

创建多对多关系需要一个第三方模型，这个第三方模型记录着多与多的关系。 例如一个命名为 postTag 的第三方模型，它有两个列，一个列记录着 postId，另一个列记录着 tagId。 在这个三方表内可能有如下几条记录：

1.  personId 1 tagId 1
2.  personId 1 tagId 2
3.  personId 2 tagId 1
4.  personId 2 tagId 2

```js
Post.belongsToMany(Tag, {through: postTag})
Tag.belongsToMany(Post, {through: postTag})

// 对于创建多对多的连接有这两种

Post.addTag(tagId)

Post.createTag({title: 'js'})

Post.removeTag(tagId)
Post.getTags()
```

实例上会有很多相关的方法用于操作相关联的模型， 具体可查询[文档](http://docs.sequelizejs.com/class/lib/associations/belongs-to-many.js~BelongsToMany.html)

##### 模型操作

模型的操作有定义、使用、查询。

当你在 node 中更新模型时，数据库内的表还未同步，会出现 can‘t find field xx 的错误提示，所以在路由内的第一步我们需要对模型和表同步。

```js
sequelize.sync().then(() => {
  // 同步模型和表后再进行模型操作
  return Models.User.create({name: 'abc'}) .....
  })
```

```js
const Task = sequelize.define('task', {
  flag: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true},
  myDate: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    get() {
      const title = this.getDataValue('flag');
      // 'this' allows you to access attributes of the instance
      return this.getDataValue('name') + ' (' + flag + ')';
    },
  },
})

Task.create({flag: true, name: 'do work'}).then((task) => {
  task.get('name') // do work (true)
})

Task.findAll().then(tasks => {
  console.log(tasks)
})

// 更加详细的内容请查阅 sequelize 文档 http://docs.sequelizejs.com/manual/tutorial/querying.html
```

##### 模型组织

一个项目必然有许多模型，首先我们需要定义模型，然后再关联模型，这样模型才算完整。在 sequelize 中，我个人以文件为单元建立模型。例如：models/user.js、 models/post.js， 然后把模型导出，汇总到 models/index.js 「index.js 内主要用于链接数据库、关联模型关系」内确定模型关系， 再次导出模型，然后在控制器内使用。

![配置 sequelize 链接](imgs/1.png)
![确立模型关系并导出](imgs/2.png)

##### 其它

暂时遇到的问题就这么多了，待补充  🙃
