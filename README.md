## SwitchToExpress

本项目将基于 Express 从零开始搭建一个功能完备的博客系统

在本节我们主要实现 post 的排序、搜索、分页功能

1. 理解后端对数据排序、搜索、分页的基本原理
1. 熟悉 mongoose 对模型的操作
1. 实现多级 comments

### 基本构造
1. 实现 post 分页
1. 实现 post 搜索
1. 实现 post 排序
1. 实现 comments 多级评论

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

#### comments 多级评论

在前面的章节里， 我们实现了单篇文章下创建多个同级评论即 1 级评论。 而在实际操作中， 评论区可以分有多级： 如用于回复评论 1 的评论 11， 或者是 12、13 等， 评论 11、12、13 我们称之为 2 级评论， 而二级评论下还会有 121、122、123、 111、112 等三级评论， 所以这里可能会出现无限级的评论， 从而形成一些内楼中楼的景象。 如何实现这种模型关系呢？ 当然你可以多创建几个 Comment 模型分别标记为 Comment1、 Comment2、 Comment3 。。。来为 comments 分级， 但这显然不能实现， 我们无法预测评论的层级。 在这里我借鉴了一种简单的思路来实现多级评论。 在我们原有的 Comment 模型内添加两个字段， pre_id 用来记录父级评论 id， next_id 用来记录自己评论信息。

```` javascript
//models/comment.js

var commentSchema = mongoose.Schema({
  body: {type: String},
  auther: {type: Schema.Types.ObjectId, ref: 'User'},
  post: {type: Schema.Types.ObjectId, ref: 'Post'},
  //pre_id 用来标记所属上层 comment 。 即评论1的pre_id 为空， 评论11的 pre_id 为1， 评论111的 pre_id 为11。 主要用来标示回复人
  pre_id: {type: Schema.Types.ObjectId, ref: 'Comment'},
  //next_id 用来标记下层 comment 。 即一条评论下又可有多条子评论
  next_id: [{type: Schema.Types.ObjectId, ref: 'Comment'}],
  updated_at: { type: Date, default: Date.now },
})

````

在路由方面我重设一条路由来添加多级评论， 主要为了获得 一级评论的 **_id** 进而填充 next_id， 当然你页可以修改以前的 **/:post_id/add** 路由来适配。 首先我们创建新的二级评论， 然后查到到一级评论并把新评论填充到 next_id 内，保存基本就可以了。 在 views 内渲染 comments.next_id 遍历就可以显示了。

在删除评论是会有问题， 我们原先的 comment 删除路由只能删除一级评论而不能删除 next_id 内引用的次级评论， 我们需要修改删除路由。 同样别忘了在 post 的删除路由下我们也需要修改， 即删除一篇 post 要删除 '所有' 的评论。

```` javascript
//routes/comment.js
router.post('/:post_id/:comment_id/add', (req, res) => {
  let body = req.body.sub
  let auther = req.session.user
  let post_id = req.params.post_id
  let comment_id = req.params.comment_id
  let comment = new Comment({body: body, auther: auther, pre_id: comment_id})

  comment.save((err,doc) => {
    if (err) {
      res.json(err)
      return
    }
    Comment.findById(comment_id, (err, comm) => {
      comm.next_id.push(doc)
      comm.save()
    })
  })
  res.redirect('/posts/' + post_id)
})

router.get('/:comment_id/delete', (req, res) => {
  var comment_id = req.params.comment_id
  var comm = Comment.findById(comment_id).populate('next_id').exec()
  comm.then(com => {
    com.remove().then(doc => {
      // 删除次级评论
      doc.next_id.forEach(id => {
        id.remove()
      })
      res.end('successful')
      // res.json(doc)
    })
  })

})
````

> 参考文章：

> [mongodb分页优化](https://cnodejs.org/topic/559a0bf493cb46f578f0a601#55c168c9ffd82de21c21dd56)

>[Mongoose 多条件模糊查询的实现](http://www.zhimengzhe.com/Javascriptjiaocheng/201209.html)

>[Mongodb和mongoose模糊查询](https://yuedun.duapp.com/blogdetail/581d736c43c18f1b7ae3e3ff)
