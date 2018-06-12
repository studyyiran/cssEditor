import React from 'react'
import {LibProvider, Lib} from '../context/componentsLib'
import NodeContainer from '../components/nodeContainer'

export class Index extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      json: undefined,
      currentDom: undefined,
      currentNodeJson: '',
      outputClassJson: '',
      showAllAttr: false,
      canEditClass: false
    }
    this.changeCurrentDom = this.changeCurrentDom.bind(this)
    this.updateResetClass = this.updateResetClass.bind(this)
    this.changeAttrsInput = this.changeAttrsInput.bind(this)
    this.changeAttrs = this.changeAttrs.bind(this)
    this.getLibByType = this.getLibByType.bind(this)
    this.saveToCss = this.saveToCss.bind(this)
  }

  componentWillMount = async () => {
    await this.props.libContext.updateLib('vnode')
    await this.props.libContext.updateLib('class')
    this.emptyViewFromLib()
    this.updateResetClass()
  }

  emptyViewFromLib () {
    let node = this.props.libContext.getLib('view', 'vnode')
    this.setState({
      json: node,
      currentDom: node,
    })
  }

  updateResetClass () {
    const loop = (node) => {
      let {children} = node
      if (node.classInfo) {
        node.classInfo.forEach((item, index) => {
          node.classInfo[index] = this.getLibByType(item)
        })
      }
      if (children && children.length) {
        children.forEach((node) => {
          loop(node)
        })
      }
    }
    loop(this.state.json)
    this.setState({
      json: this.state.json,
      currentDom: this.state.json
    },() => {
      // this.saveNodeToLib()
    })
  }

  saveNodeToLib (json = this.state.currentDom) {
    if (this.state.currentDom.pathName) {
      json = JSON.parse(JSON.stringify(json))
      json.classInfo.forEach((oneClass) => {
        let arr = []
        oneClass.styleArr.forEach((oneClass) => {
          if (oneClass.name && oneClass.value) {
            arr.push(oneClass)
          }
        })
      })
      this.setState({
        currentNodeJson: JSON.stringify(json)
      })
      this.props.libContext.postLib(json, 'vnode')
      this.afterSave()
    } else {
      console.log('no name')
    }
  }

  saveRootToFile () {
    // 1 先从根节点同步。
    this.updateResetClass()
    // 2 再保存根节点vnode
    this.saveNodeToLib(this.state.json)
    // 3 在根据根节点生成文件
    this.props.libContext.postPage(this.state.json)
    // this.outputClassFormat(this.state.json)
  }

  saveToCss () {
    this.props.libContext.postLib(this.props.libContext.copyClass, 'class')
    this.afterSave()
  }

  afterSave () {
    // 结束后自动关闭样式锁（避免忘记）
    this.setState({
      canEditClass: false
    })
  }

  renderUserControl () {
    if (this.state.currentDom) {
      return (
        <div className={"zao-flex-center out"}>
          {this.renderProjectInfo()}
          <div>
            <div style={{display: 'flex'}}>根节点名称：{this.state.json && this.state.json.pathName}</div>
            <div style={{display: 'flex'}}><div onClick={() => {this.saveRootToFile()}}>根节点输出小程序</div></div>
            <div style={{display: 'flex'}}><div onClick={() => {this.setState({showAllAttr: !this.state.showAllAttr})}}>暴露Attr</div></div>
            <div style={{display: 'flex'}}><div onClick={() => {this.setState({canEditClass: !this.state.canEditClass})}}>{this.state.canEditClass ? '样式锁已失效' : '样式锁已激活'}</div></div>
            <div style={{display: 'flex'}}>classInfo：<input value={JSON.stringify(this.props.libContext.copyClass)} />
              <div onClick={this.saveToCss}>保存class</div>
            </div>
          </div>
          <div onClick={() => {this.emptyViewFromLib()}}>一键重置</div>
          <div onClick={() => {this.props.libContext.exportCss()}}>导出静态css</div>
          <div>
            <div style={{display: 'flex'}}>
              <input value={this.state.inputJson} onChange={(e) => {this.setState({inputJson: e.target.value})}}/>
              <div onClick={() => {this.inputJsonToNode()}}>导入</div>
              <div onClick={this.updateResetClass}>同步样式</div>
            </div>
          </div>
          {this.renderAttr()}
          <style jsx>{`
            .out {
              position: relative;
              left: 375px;
            }
            .out > div {
              margin-left: 30px;
            }
          `}</style>
        </div>
      )
    }
  }

  inputJsonToNode () {
    // 导入
    let json = this.state.inputJson
    this.setState({
      json: JSON.parse(json),
      currentDom: JSON.parse(json),
      inputJson: json,
    }, this.updateResetClass)
  }

  renderAttr () {
    let currentDom = this.state.currentDom
    let forbid = ['attrs', 'index', 'classInfo', 'children', 'pathName']
    if (currentDom) {
      let {attrs} = currentDom
    }
    let arr1 = []
    if (this.state.showAllAttr) {
      Object.keys(currentDom).forEach((name) => {
        if (!forbid.includes(name)) {
          arr1.push(<div className='zao-flex-center local-space-between'>
            <div>{name}</div>
            <input value={currentDom[name]} onChange={(e) => {this.changeAttrsInput(name, e.target.value)}}/>
          </div>)
        }
      })
    }
    let arr2 = []
    if (currentDom.attrs && currentDom.attrs.length) {
      arr2 = currentDom.attrs.map((oneAttr, attrsIndex) => {
        return <div className='zao-flex-center local-space-between'>
          <input value={oneAttr.name} onChange={(e) => {this.changeAttrsInput('attrsName', e.target.value, attrsIndex)}}/>
          <input value={oneAttr.value} onChange={(e) => {this.changeAttrsInput('attrsValue', e.target.value, attrsIndex)}}/>
          <div style={{marginLeft: '30px'}} onClick={() => {this.changeAttrsInput('attrsDelete', '', attrsIndex)}}>delete</div>
        </div>
      })
    }
    return (
      <div>
        <div>{arr1}</div>
        <div>attrs：
          <div>{arr2}</div>
        </div>
        <div onClick={() => {this.changeAttrsInput('attrsAdd')}}>add</div>
      </div>
    )
  }

  changeAttrsInput (type, value, attrsIndex) {
    let {currentDom} = this.state
    let {json} = this.state
    let findNode
      let loop = (node, findIndex) => {
      if (node.index === findIndex) {
        findNode = node
      }
      if (node.children && node.children.length) {
        node.children.forEach((node) => {
          loop(node, findIndex)
        })
      }
    }
    loop(json, currentDom.index)
    if (findNode) {
      // 判定type
      if (type.includes('attrs')) {
        this.attrsEdit(findNode, type, value, attrsIndex)
      } else {
        this.changeAttrs(findNode, type, value)
      }
    }
    this.setState({
      currentDom: findNode
    })
  }

  changeAttrs (node, type, value) {
    switch (type) {
      case 'nodeType':
        node[type] = value
        break;
      case 'name':
        node[type] = value
        break;
      case 'pathName':
        node[type] = value
        break;
    }
  }

  attrsEdit (node, type, value, attrsIndex) {
    let attrArr = node.attrs
    switch (type) {
      case 'attrsName':
        attrArr[attrsIndex].name = value;
        break;
      case 'attrsValue':
        attrArr[attrsIndex].value = value;
        break;
      case 'attrsDelete':
        attrArr.splice(attrsIndex, 1);
        break;
      case 'attrsAdd':
        attrArr.push({name: '', value: ''})
        break;
    }
  }

  updateNode (node) {
    this.setState({
      json: node
    })
  }

  changeCurrentDom (currentDom) {
    this.setState({
      currentDom: currentDom
    })
  }

  getLibByType (item) {
    let findFromLib
    if (!this.state.canEditClass) {
      let arr = ['def', 'zao', 'com']

      let findType = arr.find((type) => {
        if (item.name.slice(0, 3) === type) {
          return true
        }
      })
      if (findType) {
        findFromLib = this.props.libContext.getLib(item.name, 'class')
      }
    }
    return findFromLib || item
  }

  renderProjectInfo () {
    return <div>
        <div>当前选中的ID：{this.state.currentDom && this.state.currentDom.index}</div>
        <div className='zao-flex-center'>
          <div>pathName</div>
          {this.state.currentDom && <input value={this.state.currentDom['pathName'] || ''} onChange={(e) => {this.changeAttrsInput('pathName', e.target.value)}}/>}
        </div>
        <div onClick={() => {this.saveNodeToLib()}}>当前节点保存vnode</div>
        <div style={{display: 'flex'}}>
          vnode：<input value={this.state.currentNodeJson} />
        </div>
      </div>

  }

  render () {
    return <div className={'out-out'}>
        {this.renderUserControl()}
        {this.state.json && <NodeContainer getLibByType={this.getLibByType} node={this.state.json} libContext={this.props.libContext} changeCurrentDom={this.changeCurrentDom} updateNode={(...e) => {this.updateNode(...e)}} />}
        <style>{`
        * {
          margin: 0
        }
        .flex {
          display: flex;
        }
        .out-out {
          background-color: #e5d6d6;
        }
      `}
        </style>
      <style jsx global>{`
        .local-space-between {
          justify-content: space-between;
        }
        .zao-font-normal {
          font-size: 14px;
          color: #333333;
          line-height: 24px;
        }
        .zao-flex-column {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .zao-center {
          text-align: center;
        }
        .zao-font-11 {
          font-size: 11px;
        }
        .zao-color-white {
          color: #ffffff;
        }
        .zao-font-bold {
          font-weight: bold;
        }
        .zao-font-16 {
          font-size: 16px;
        }
        .zao-radius-4 {
          border-radius: 4px;
        }
        .zao-view {
          box-sizing: border-box;
        }
        .zao-bold {
          font-weight: bold;
          font-size: 18px;
        }
        .zao-font-info {
          font-size: 11px;
          color: #333333;
          line-height: 16px;
        }
        .zao-flex-center {
          display: flex;
          align-items: center;
          align-items: center;
        }
        .zao-flex-shrink {
          flex-shrink: 0;
        }
      `}
      </style>
    </div>
  }
}

export default function (props) {
  return <LibProvider>
    <Lib.Consumer>
      {libContext => (<Index libContext={libContext} {...props} />)}
    </Lib.Consumer>
  </LibProvider>
}
