## SwitchToExpress

本项目将基于 Express 从零开始搭建一个功能完备的博客系统

在本节我们主要实现 post 的排序、搜索、分页功能

1. 理解后端对数据排序、搜索、分页的基本原理
1. 熟悉 mongoose 对模型的操作

### 基本构造
1. 实现 post 分页
1. 实现 post 搜索
1. 实现 post 排序


#### post 分页

> post 分页主要利用 mongoose 提供的 skip 和 limit 函数来进行数据查询

基本原理是通过给 skip 和 limit 动态传入参数来达到效果， 我选择了 req.query 来传入参数。 主要参数有两个， page 即页数， pageSize 即每页容量。 抽象出函数即 ``skip(pageSize*(page - 1)).limit(pageSize)`` ， 第一页即 skip(0).limit(3), 第二页即 skip(3*(2 - 1)).limit(3) ，以此类推。

````js
//models/posts.js
router.get('/', (req, res) => {
  // Post.find({}, (err, data) => {
  //   res.json(data)
  //   res.render('index', {posts: data, post: undefined})
  // })
  let page = req.query.page || 1
  var pageSize = 3
  Post.find().skip(pageSize*(page - 1)).limit(pageSize).populate('auther').exec((err, posts) => {
    Tag.find({}).exec((err, tags) => {
      if (err) {
        res.json(err)
      } else {
        res.render('index', {posts: posts, post: undefined, tags: tags})
      }
    })
    // res.render('index', {posts: posts, post: undefined})
    // res.json(posts)
  })

})
````

经过前面几节， 你应该越发感觉到路由其实就是对应着一组资源 （m）的控制操作， 即常说的控制器 c

#### post 搜索

在 mongoose 中，我们没有所谓的 like 查询语句。 mongoose 直接使用正则匹配来实现搜索功能， 需要注意的是对于正则匹配动态查询时 ``var a="Nodejs"  Post.find({ body: /a/i}, function (err, docs) {})`` ,  /a/ 会被认为 ／“a”／ 而非查询 "Nodejs"， 所以我们需要一种固定写法即 $regex 来标识动态查询， $options 来设置参数。 遇到多条动态查询时可选 $or 或 $and 来实现。

```` javascript
//routes/post.js
router.get('/search', (req, res) => {
  // let q = req.query.q || ''
  let {q = ""} = req.query
  // 前端表单使用 get 方法指定 name = q 便得到 query.q
  Post.find(
    // query
    {
      $or:[
        {title: {$regex: q, $options: 'ix'}},
        {body: {$regex: q, $options: 'ix'}}
      ]
    },
    // filter1 0 - filter, 1 - left
    {title: 1, body: 1},
    // filter2
    {sort: {create_time: -1}, limit: 10}
  ).exec((err, posts) => {
    if (err) {
      res.json(err)
      return
    }
    // res.json(posts)
    res.render('index', {posts: posts, post: undefined, tags: undefined})
  })
})

````



#### post 排序

post 排序即利用 sort 函数来指定我们按什么规则来排序。 一个 query 最多有四个参数： 第一个为查询条件、 第二个是过滤条件即对查询出的数据进行过滤， 筛出某些需要／不需要的字段、 第三为参数设置主要用于排序、 第四为回掉函数。 ``Post.find({},null,{sort: {name: name, create_time: create} })`` 第一个参数为空即查询出所有 post 数据， 若无第三个字段我们也不必填写第二个参数即不筛出任何字段返回完整的实例， 第三个字段即数据排序， -1 倒序， 1 正序。

```` javascript
//routes/post.js
router.get('/sort', (req, res) => {
  let {name = 1, create = -1} = req.query

  Post.find({},null,{sort: {name: name, create_time: create} }).exec((err, posts) => {
    if (err) {
      res.json(err)
      return
    }
    // res.json(posts)
    res.render('index', {posts: posts, post: undefined, tags: undefined})
  })
})
````

然后我们在前端模版处即可调用这条路由来对数据进行对应排序操作。


> 参考文章：

> [mongodb分页优化](https://cnodejs.org/topic/559a0bf493cb46f578f0a601#55c168c9ffd82de21c21dd56)

>[Mongoose 多条件模糊查询的实现](http://www.zhimengzhe.com/Javascriptjiaocheng/201209.html)

>[Mongodb和mongoose模糊查询](https://yuedun.duapp.com/blogdetail/581d736c43c18f1b7ae3e3ff)
