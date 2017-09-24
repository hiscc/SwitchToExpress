## SwitchToExpress

本项目将基于 Express 从零开始搭建一个功能完备的博客系统

在本节我们主要实现各个模型间的基本操作

1. 增加 Comment 模型记录每篇 post 下的评论
1. 增加 Tag 模型为 post 分类

### 基本构造


#### mongoose 模型关系
##### Comment 模型
> 一篇 post 对应多条 comment， 每一条 comment 实例都指向同一篇 post 实例

在 mongoose 内， 模型间的关系只通过 *id* 字段来索引。 例如， 我们需要为每篇 post 下添加 comment ， 在 comment 模型下只需要添加一个 post 字段来储存 comment 所制定的 post的 id 就可以了。


````js
//models/comments.js
var commentSchema = mongoose.Schema({
  body: {type: String},
  auther: {type: Schema.Types.ObjectId, ref: 'User'},
  post: {type: Schema.Types.ObjectId, ref: 'Post'},
  updated_at: { type: Date, default: Date.now },
})
````

在创建一个 comment 时，填写它所指定的 post 的 id， 就完成了关联。在 post 模型内无需任何 comment 字段。 所以在 mogoose 中的逻辑是反向的： 我们提取 post1 下 comment， 是从 comment 模型内找到所有 post id 为 post1 的 comment， 而在关系型数据库是直接返回 post.comment 这样的写法。

而在为每篇 post 添加 comment 时， comment 路由只需要找到对应的 post 即可。

```` javascript
//routes/comment.js
router.post('/:post_id/add', (req, res) => {
  let body = req.body.body
  let auther = req.session.user
  let post_id = req.params.post_id
  var comment = new Comment({body: body, post: post_id, auther: auther})
  comment.save(err => {
    if (err) {
      res.json(err)
    }
  })
````



##### Tag 模型

> 1. 一个 tag 对应多个 post ， 2. 一个 post 对应多个 tag

首先实现一个 tag 对应多个 post ，我们可以在创建一个 tag 的时候指定包含这个 tag 的 post 列表（实现1）。 但是这基本是不可能的， 没有人会为创建一个 tag 来写篇 post（进而得到 post._id）。 所以 tag、post间的真实顺序关系是：

1. 先创建一堆 tag
2. 创建 post 的时候， 给 post 打上 tag
3. 因为 tag 已经生成， 我们就可以直接把 post 的 tags 字段指向 tag._id

````js
// models/tag.js
var tagSchema = new Schema({
  name: {type: String, default: '标签名称'},//标签名称 eg: css html
  catalogue_name: {type: String, default: '分类名称'},//分类名称 eg: FrontEnd
  used_num: {type: Number, default: 0},//文章引用数
  create_time: {type: Date, default: (new Date())},//创建时间 时间戳
  posts: [{type: Schema.Types.ObjectId, ref: 'Post'}]
})

// models/post.js
var postSchema = mongoose.Schema({
  // _id: Schema.Types.ObjectId,
  title: String,
  body: String,
  auther: {type: Schema.Types.ObjectId, ref: 'User'},
  tags: [{type: Schema.Types.ObjectId, ref: 'Tag'}]
})

````


tagSchema 这里的 posts 字段就是用来保存多个拥有此 tag 的 post 的列表即用来实现一个 post 有多个 tag（实现1）， 而 postSchema 这里的 tags 即用来实现一个 tag 有多个 post（实现2）。

我们可以假想如何实现1， 我们有 tag1 这个 tag， 这个 tag 对应多篇 post ，即 posts 字段里存在多个 post。

而对于实现2， 也是一样的， post1 这个 post 对应多个 tag ，即 tags 字段里存在多个 tag。

所以按照前面讲的顺序， 我们现创建 tag 实例
````js
// routes/tag.js
router.post('/add', (req, res) => {
  let {name} = req.body
  Tag.create({name: name}, (err) => {
    if (err) {
      res.json(err)
    }
    res.redirect('/tags')
  })
})
````

很简单， 然后在生成 post 的时候引用 tag， 在前端表单处理的时候我们选择复选框来传送 tag 。 而 tag 模型上也需要为 posts 字段添加引用， 这样才能实现一篇 post 有多个 tag 的引用。


````js
// routes/post.js
router.post('/add', (req, res) => {
  let {body, title, tag} = req.body
  let auther = req.session.user
  let tags = []
  var post = new Post({title: title, body, auther: auther, tags: tag})

// 矫正 tag 为数组， 因为如果只有一个 tag 的话提交上来是 string 类型， 而后续的查询条件需要为 array
  if (typeof tag !== 'string') {
    tags = tag
  } else {
    tags[0] = tag
  }

  post.save((err, post) => {
    if (err) {
      res.json(err)
      return
    }
    // $in: Array 查询一组数据
    Tag.find({_id: {$in: tags}}).exec((err,tags) => {
      // 为此 post 引用的每个 tag 添加此 post 的引用即实现1
      tags.forEach(tag => {
        tag.posts.push(post)
        tag.save()
      })
    })
  })

  res.redirect('/posts')
})
````

##### 填充 populate

现在一条存有 posts 字段的 tag 类似于这样， posts 字段里面只保存了对各个 post._id 引用， 这些引用对应这每条 post 的， 我们不需要把这些 id 一一取出再在 post 模型内查找， mongoose 为我们提供了一个方法来填充这些引用的内容即 populate。

````js
// no populate
Tag.find().exec((err, tags) => {
  res.json(tags)
})

{"_id":"59c7868320b3980a1eb50a2c","__v":7,"posts":["59c7926aa0cf110cbb971c66","59c7928aa0cf110cbb971c67","59c79865de89da0d4965bf0d","59c79883de89da0d4965bf0e","59c79b9d3e4fe40e32ad08db","59c7a26d8c45300e7956f7f5","59c7a2f6967bff0ee8bd85b1"],"create_time":"2017-09-24T10:15:19.782Z","used_num":0,"catalogue_name":"分类名称","name":"a"}

// with populate
Tag.find().populate('posts').exec((err, tags) => {
  res.json(tags)
})

{"_id":"59c7868320b3980a1eb50a2c","__v":7,"posts":[{"_id":"59c7a2f6967bff0ee8bd85b1","title":"光荣感","body":"v 的 v 夫人","__v":0,"tags":["59c7868320b3980a1eb50a2c"]}],"create_time":"2017-09-24T10:15:19.782Z","used_num":0,"catalogue_name":"分类名称","name":"a"}
````  

你可能会发现未填充的 posts 里的 id 明显多余填充了的 posts 选项， 这是因为我虽然删除了 post 实例， 但 tag 模型下的 posts 字段依旧保存这些 post._id 。在 mongoose 内， 我们需要注意的点会更多， 因为模型的关联只通过 id 即便对应这此 id 的实例已经被删除， 但那些有关联的模型内依然可能保存着这些关联 id , 只是数据已经为空了。


> 参考文章：

> [mongodb/mongoose findMany - find all documents with IDs listed in array](https://stackoverflow.com/questions/8303900/mongodb-mongoose-findmany-find-all-documents-with-ids-listed-in-array?rq=1)

> [Model.populate(docs, options, [callback(err,doc)])](http://devdocs.io/mongoose/api#model_Model.populate)
