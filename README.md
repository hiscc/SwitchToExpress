## SwitchToExpress

本项目将基于 Express 从零开始搭建一个功能完备的博客系统

在本节我们主要实现图片的上传与删除， 并为每个用户创建一个图床

1. 利用 multer 包来上传文件（主要是图片）
1. 增加 Image 模型记录每个 Image 实例的文件名、原名称及作者

### 基本构造


#### Image 模型

> Image 模型主要字段有原名称、 文件名（自定义的）、 创建时间、 作者（用来控制只显示当前用户上传的图片）

套路还是一样， Image 模型主动去关联作者， 而 User 模型无任何变动， 当然你也可以在 User 模型下创建 images 字段来关联图片。 但我还是选择这种反向关联， 因为感觉更简单点 🐶。

````js
//models/images.js
let imageSchema = new Schema({
  name: String,
  url: String,
  auther: {type: Schema.Types.ObjectId, ref: 'User'},
  create_time: {type: Date, default: new Date()}
})
````

url 字段用来保存文件名， 后面的 img 标签和 fs 会用它来显示和删除图片。 name 是原文件名称。

#### multer 配置

首先引入 multer，我配置的是 disk 存储。 当然你也可以直接 `var upload = multer({ dest: 'uploads/' })` 这样, 但文件名会没有格式后缀， 在用 img 标签显示图片的时候会很麻烦。 所以我们配置一下上传路径和上传文件名， 需要注意的一点就是对于 destination 键， 记得加 `__dirname` 修正路径。 在 filename 键里我们可以自定义文件名。 fieldname 为我们前端表单域的 name 值， mimetype 为文件类型， jpeg 图片类型是 `image/jpeg ` 我们截取后半段即 jpeg 添加到文件名后形成完整后缀。

```` javascript
//routes/image.js
const multer  = require('multer')
const fs = require('fs')


let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + '/../uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.' +file.mimetype.split('/')[1])
  }
})

const upload = multer({ storage: storage })
````


#### 上传图片及 image 模型操作
在 add 路由处， 添加 `upload.single('image')`， 其中 image 为前端表单 name 值。 然后我们根据当前 session 来记录当前用户顺便传进 image 实例中。

```` javascript
//routes/image.js
.post('/add', upload.single('image'), (req, res) => {
  let { originalname, filename } = req.file
  let user = req.session.user
  // res.json(user)
  Image.create({name: originalname, url: filename, auther: user}, (err, image) => {
    if(err) res.json(err)
    res.json(image)
  })
})
````


#### 显示图片及 image 模型操作
我们在 `／` 总路由下设置登录用户只能查看自己上传的图片。 通过比较当前用户的 id 和 image.auther 的 id 来判断是不是当前用户， 其实就是起到一个过滤器的作用， 最后把合格的值添加到数组内传递给 ejs 模版即可。

```` javascript
//routes/image.js
.get('/', (req, res) => {
  Image.find().populate('auther').exec((err, images) => {
    if(err) res.json(err)
    // res.json(images)
    let user = req.session.user
    let imagesArray = []
    if (!!user) {
      images.forEach(image => {
        if (user._id == image.auther._id) {
          imagesArray.push(image)
        }else {
          console.log(image.auther, user);
        }
      })
    }

    res.render('image', {images: imagesArray})
  })

})
````


#### 删除图片及 image 模型操作

最后是删除操作， 首先我们需要删除 image 实例然后再通过 fs 模块来删除图片文件。
fs.unlink 方法即可删除指定路径下的文件。
```` javascript
//routes/image.js
.get('/:id/delete', (req, res) => {
  let {id} = req.params

  Image.findOneAndRemove({_id: id}, (err, image) => {
    if(err) res.json(err)
    // 获取文件名
    let url = image.url
    // unlink 用于删除文件
    fs.unlink(`./uploads/${url}`,function(err){
    if(err) return console.log(err);
    console.log('file deleted successfully');
    })
  })
    // 删除路由必须加后续处理（当然这个一般都有）， 否则程序会一直请求 image.url 直至进程挂掉
  res.redirect('/images')
})
````


> 参考文章：

> [node.js remove file](https://stackoverflow.com/questions/5315138/node-js-remove-file#comment67240915_36614925)
