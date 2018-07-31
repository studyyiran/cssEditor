import React from 'react'
import Block from './block'
export default class extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      json: {},
      titleArr: [
        {
          title: '班主任： ',
          img: ' https://xiaozaoresource.xiaozao.org/learning/icon/%E7%8F%AD%E4%B8%BB%E4%BB%BB.png'
        },
        {
          title: '课程形式： ',
          img: ' https://xiaozaoresource.xiaozao.org/learning/icon/%E8%AF%BE%E7%A8%8B%E5%BD%A2%E5%BC%8F.png'
        },
        {
          title: '开课安排： ',
          img: ' https://xiaozaoresource.xiaozao.org/learning/icon/%E5%BC%80%E8%AF%BE%E5%AE%89%E6%8E%92.png'
        },
        {
          title: '上课地址： ',
          img: ' https://xiaozaoresource.xiaozao.org/learning/icon/%E4%B8%8A%E8%AF%BE%E5%9C%B0%E5%9D%80.png'
        },
        {
          title: '学习社群： ',
          img: 'https://xiaozaoresource.xiaozao.org/learning/icon/%E5%AD%A6%E4%B9%A0%E7%A4%BE%E7%BE%A4.png\n'
        },
        {
          title: '课程有效期： ',
          img: ' https://xiaozaoresource.xiaozao.org/learning/icon/%E8%AF%BE%E7%A8%8B%E6%9C%89%E6%95%88%E6%9C%9F.png'
        },
        {
          title: '课前预习： ',
          img: ' https://xiaozaoresource.xiaozao.org/learning/icon/%E8%AF%BE%E5%89%8D%E9%A2%84%E4%B9%A0.png'
        },
        {
          title: '课程福利： ',
          img: ' https://xiaozaoresource.xiaozao.org/learning/icon/%E8%AF%BE%E7%A8%8B%E7%A6%8F%E5%88%A9.png'
        },
        {
          title: '小灶寄语： ',
          img: 'https://xiaozaoresource.xiaozao.org/learning/icon/%E5%B0%8F%E7%81%B6%E5%AF%84%E8%AF%AD.png'
        },
      ],
      currentSelect: 0,
      strongStyle: 'color: red;',
      coursePath: '/pages/course/classroom/classroom',
      courseName: '默认课程',
      outputJson: ''
    }
    this.indexCount = 0

    this.change = this.change.bind(this)
  }



  componentWillMount () {
    this.makeJson()
  }

  do (json) {
    return json.nodes.map((item) => {
      return this.get(item)
    })
  }

  get (node) {
    let {name, attrs, children} = node
    let attrObj ={}
    if (attrs) {
      let {style, src} = attrs
      if (style) {
        console.log('have style')
        style = style.replace(/\s+/g,"")
        let arrStyle = style.split(/:|;/)
        attrObj.style = {}
        for (let i = 0; i < arrStyle.length; i = i+2) {
          if (arrStyle[i] && arrStyle[i+1]) {
            attrObj.style[arrStyle[i]] = arrStyle[i+1]
          }
        }
      }
      if (src) {
        attrObj.src = src
      }
      if (attrs['class']) {
        attrObj.className = attrs['class']
      }
    }
    let {type, text} = node
    if (type === 'text') {
      return text
    } else {
      if (children) {
        let cArr = children.map((node, index) => {
          return this.get(node)
        })
        return React.createElement(name, attrObj, cArr);
      } else {
        return React.createElement(name, attrObj);
      }
    }
  }

  do2 (json) {
    // get name and path

    // render node
    return json.nodes.map((item) => {
      return this.renderBlock(item)
    })
  }

  renderBlock (node) {
    // 根据json。设置出来最单纯的block。
    let {name, attrs, children} = node
    let attrObj ={}
    if (attrs) {
      let {style, src} = attrs
      if (style) {
        console.log('have style')
        style = style.replace(/\s+/g,"")
        let arrStyle = style.split(/:|;/)
        attrObj.style = {}
        for (let i = 0; i < arrStyle.length; i = i+2) {
          if (arrStyle[i] && arrStyle[i+1]) {
            attrObj.style[arrStyle[i]] = arrStyle[i+1]
          }
        }
      }
      if (src) {
        attrObj.src = src
      }
      if (attrs['class']) {
        attrObj.className = attrs['class']
      }
    }
    let {type, text} = node
    if (type === 'text') {
      return text
    } else {
      if (children) {
        let cArr = children.map((node, index) => {
          return this.renderBlock(node)
        })
          return <Block outStyle={attrObj.style} node={node} change={this.change}>{cArr}</Block>
      } else {
        return <Block outStyle={attrObj.style} node={node} change={this.change} />
      }
    }
  }

  // 如何新增一个顶部节点。如何删除一个顶部节点？

  // 图片和标题是一一对应的。可以点击更换

  makeJson () {
    // 保存最后一次数据
    localStorage.setItem('saveWorld', JSON.stringify(this.state.json))
    console.log('重置之前。上次的结果已经保存。')
    let obj = {}
    let arr = this.state.titleArr.map((item, index) => {
      return this.pushTopNode(item)
    })
    obj.myType = 'out-father'
    obj.nodes = arr
    obj.path = this.state.coursePath
    obj.name = this.state.courseName
    this.setState({
      json: obj
    })
  }

  loadFromData () {

  }

  pushTopNode (item) {
    let a = {}
    a.index = this.indexCount++
    a.myType = 'out-div'
    a.name = 'div'
    a.attrs = {
      class: 'rich-p'
    }
    a.children = []
    a.children.push(this.pushIcon(item))
    a.children.push(this.pushTitle(item))
    return a
  }

  pushImage (item) {
    console.log('pushImage')
    let imgNode = {}
    imgNode.index = this.indexCount++
    imgNode.myType = 'img-node-inner'
    imgNode.name = 'img'
    imgNode.attrs = {
      class: 'rich-img-inner',
      // src: item.img
      src: 'https://xiaozaoresource.xiaozao.org/%E8%BF%90%E8%90%A5%E7%94%A8%E5%9B%BE/%E4%BA%8C%E7%BB%B4%E7%A0%81/wx_qrcode.png'
    }
    return imgNode
  }

  pushIcon (item) {
    let imgNode = {}
    imgNode.index = this.indexCount++
    imgNode.myType = 'img-node'
    imgNode.name = 'img'
    imgNode.attrs = {
      class: 'rich-img',
      src: item.img
    }
    return imgNode
  }

  pushTitle (item) {
    let divNode = {}
    divNode.index = this.indexCount++
    divNode.myType = 'inner-div'
    divNode.name = 'div'
    divNode.attrs = {
      class: 'rich-span',
    }
    divNode.children = []
    divNode.children.push(this.pushContent(item))
    return divNode
  }

  pushContent (item) {
    let divNode = {}
    divNode.index = this.indexCount++
    if (item) {
      divNode.myType = 'content-arr'
      divNode.name = 'span'
      divNode.attrs = {
        class: '',
      }
      divNode.children = [{
        type: 'text',
        text: item.title
      }]
    } else {
      divNode.myType = 'br-arr'
      divNode.name = 'br'
      divNode.attrs = {
        class: 'br-block',
      }
    }

    return divNode
  }

  // 遍历树 查找到目标
  getNode (nodes, findIndex) {
    let fakeNodes
    if (nodes.nodes && nodes.nodes.length > 0) {
      fakeNodes = nodes.nodes
    } else {
      fakeNodes = nodes.children
    }
    let findIt = false
    fakeNodes.every((item, index) => {
      if (item.index === findIndex) {
        findIt = {
          findNode: nodes,
          findPos: index,
        }
        return false
      } else if (item.children) {
        let result = this.getNode(item, findIndex)
        if (result) {
          findIt = result
          return false
        } else {
          return true
        }
      } else {
        return true
      }
    })
    return findIt
  }

  formatJson () {
    localStorage.setItem('saveWorld', JSON.stringify(this.state.json))
    console.log('重置之前。上次的结果已经保存。')
    // 重新设置path和name
    // this.state.json.path = this.state.coursePath
    // this.state.json.name = this.state.courseName

    let json = JSON.parse(JSON.stringify(this.state.json))

    // delete json.index
    // delete json.myType
    json.nodes.forEach((node) => {
      this.formatDelete(node)
    })
    this.setState({
      outputJson: JSON.stringify(json)
    })
  }

  formatDelete (nodes) {
    // delete nodes.index
    // delete nodes.myType
    if (nodes.children) {
      nodes.children.forEach((node) => {
        // delete node.index
        // delete node.myType
        let {name, attrs, children} = node
        let attrObj ={}
        if (attrs) {

        }
        let {type, text} = node
        if (type === 'text') {
        } else {
          if (children) {
            children.forEach((node, index) => {
              return this.formatDelete(node)
            })
          } else {
          }
        }
      })
    }
  }

  renderTitleArr () {
    let {titleArr} = this.state
    let arr = titleArr.map((item, index) => {
      return <div className={'block'} onClick={() => {this.chooseTitle(index)}}>
        <span>{item.title}</span>
        <img src={item.img}/>
        <style jsx>
          {`
            .block {
              border: 1px solid black;
            }
          `}
        </style>
        </div>
    })
    return (<div className={'fix-top'}>
        {arr}
      <style jsx>{`
          .fix-top {
            position: fixed;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            z-index: 9999;
            background-color: blue;
          }
        `}</style>
      </div>)
  }

  chooseTitle (index) {
    this.setState({
      currentSelect: index,
    }, () => {
      this.change(4, this.state.currentNodeIndex)
    })
  }

  changeSetting (e, type) {
    if (type === 1) {
      let value = e.target.value
      let json = this.state.json
      json.path = value
      this.setState({
        coursePath: value,
        json: json
      })
    } else {
      let value = e.target.value
      let json = this.state.json
      json.name = value
      this.setState({
        courseName: value,
        json: json
      })
    }
  }

  resetLast (type) {
    // 导入
    if (type === 1) {
      let json = this.state.inputJson
      this.setState({
        json: JSON.parse(json),
        inputJson: json,
      })
    } else {
      // 还原
      let json = localStorage.getItem('saveWorld')
      this.setState({
        json: JSON.parse(json),
        inputJson: json,
      })
    }
    console.log('123123123')

  }

  change(type, index, content) {
    // 遍历json 获得节点 并且根据命令进行修改
    this.setState({
      currentNodeIndex: index
    })
    let result
    result = this.getNode(this.state.json, index)
    // 增加或者删除节点
    let {findNode, findPos} = result
    switch (type) {
      case -1:
        if (findNode.nodes) {
          findNode.nodes.splice(findPos, 1)
        } else {
          findNode.children.splice(findPos, 1)
        }
        break;
      case 1:
        // 判断节点类型。进行同级新增。
        let nodeType = findNode.myType
        switch (nodeType) {
          case 'out-father':
            findNode.nodes.splice(findPos+1, 0, this.pushTopNode(this.state.titleArr[this.state.currentSelect]))
            break
          case 'inner-div':
            findNode.children.splice(findPos+1, 0, this.pushContent({title: ''}))
            break
        }
        break;
      case 0:
        // 判断节点类型。进行同级新增。
        console.log('test')
        findNode.children.splice(findPos+1, 0, this.pushContent())
        findNode.children.splice(findPos+2, 0, this.pushContent({title: ''}))
        break;
      case 2:
        // 修改样式
        if (findNode.children[findPos].attrs.style) {
          findNode.children[findPos].attrs.style = ''
        } else {
          findNode.children[findPos].attrs.style = this.state.strongStyle
        }
        break
      case 3:
        // 修改内容
        findNode.children[findPos].children[0].text = content
        break
      case 4:
        if (this.state.showChoose) {
          let {currentSelect, titleArr} = this.state
          let {img, title} =  titleArr[currentSelect]
          // 更改标题 图片
          findNode.nodes[findPos].children[0].attrs.src = img
          findNode.nodes[findPos].children[1].children[0].children[0].text = title
        }
        this.setState({
          showChoose: !this.state.showChoose
        })
      case 5:
        // 判断节点类型。进行同级新增。
        findNode.children.splice(findPos+1, 0, this.pushImage())
        break;
      case 6:
        // 修改内容
        console.log('chagen img')
        findNode.children[findPos].attrs.src = content
        break
    }
    this.setState({
      json: this.state.json
    })
  }

  render () {
    let {json} = this.state
    return <div className={'out-out'} >
      {/*<h1>{this.state.titleArr[this.state.currentSelect].title}</h1>*/}
      {this.state.showChoose && this.renderTitleArr()}
      <h1>课程名称：<input style={{width: '400px'}} value={this.state.courseName} onChange={(e) => {this.changeSetting(e, 2)}} /></h1>
      <h1>课程路径：<input style={{width: '400px'}} value={this.state.coursePath} onChange={(e) => {this.changeSetting(e, 1)}} /></h1>
      <div>强调样式设置：<input value={this.state.strongStyle} onChange={(e) => {this.setState({strongStyle: e.target.value})}} /></div>
      {this.do2(json)}
      {this.do(json)}
      <div className={"flex"}>
        <div>
          <div style={{display: 'flex'}}><div onClick={() => {this.formatJson()}}>一键生成</div><input value={this.state.outputJson} /></div>
        </div>
        <div onClick={() => {this.makeJson()}}>一键重置</div>
        <div>
          <div style={{display: 'flex'}}>
            <div onClick={() => {this.resetLast(0)}}>还原</div>
            <input value={this.state.inputJson} onChange={(e) => {this.setState({inputJson: e.target.value})}}/>
            <div onClick={() => {this.resetLast(1)}}>导入</div>
          </div>
        </div>
      </div>

      <style>
        {`
        .flex {
          display: flex;
        }
        .flex > div {
          margin-right: 30px;
        }
        * {
          margin: 0
        }
        .rich-p {
        fontSize: 14px;
        color: #333333;
        line-height: 24px;
        margin: 20px auto;
        }
        .rich-img-inner {
          width: 50%;
          margin: auto;
          display: block;
          margin-top: 10px;
        }
        .rich-img {
          height: 20px;
          height: 20px;
          vertical-align: top;
          margin-right: 10px;
        }

          .rich-span {
          vertical-align: top;
          display: inline-block;
          width: 78%
        }
      `}
      </style>
    </div>
  }
}