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
    this.getFileTransJson = this.getFileTransJson.bind(this)
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
    // 2 再保存根节点vnode(这部分较多鱼，屏蔽)
    // this.saveNodeToLib(this.state.json)
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
        <div className={"zao-flex-column out"}>
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
              <div>(  )</div>
              <div onClick={this.updateResetClass}>同步样式</div>
            </div>
          </div>
          {this.renderAttr()}
          <style jsx>{`
            .out {
              align-items: flex-start;
            }
            .out > div {
              margin-bottom: 30px;
            }
          `}</style>
        </div>
      )
    }
  }

  inputJsonToNode (json=this.state.inputJson) {
    // 导入
    let resultJson
    let resultString
    if (typeof json == "string") {
      resultJson = JSON.parse(json)
      resultString = json
    } else {
      resultJson = json
      resultString = JSON.stringify(json)
    }
    this.setState({
      json: resultJson,
      currentDom: resultJson,
      inputJson: resultString,
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

  getFileTransJson = async () => {
    let a = await this.props.libContext.getFileTransJson(this.state.currentDom['pathName'])
    console.log(JSON.stringify(a))
    this.inputJsonToNode(a)
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
        <div onClick={() => {this.getFileTransJson()}}>root显灵</div>
      </div>

  }

  render () {
    return <div className={'out-out'}>
        {this.state.json && <NodeContainer slot1={this.renderUserControl()} slot2={this.renderProjectInfo()} getLibByType={this.getLibByType} node={this.state.json} libContext={this.props.libContext} changeCurrentDom={this.changeCurrentDom} updateNode={(...e) => {this.updateNode(...e)}} />}
        <style>{`
        * {
          margin: 0
        }
        .out-out {
          background-color: #e5d6d6;
        }
      `}
        </style>
      <style jsx global>{`
        @font-face {
            font-family: 'zaofont';
            src: url(data:application/font-woff2;charset=utf-8;base64,d09GMgABAAAAAAW4AA0AAAAACyAAAAVkAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP0ZGVE0cGh4GVgCCShEIColUh2MLFAABNgIkAxwEIAWEfAdeGzQJIxFme9Ml+0dC5qaP5iOirJctarWoifbk4Jy3CRNBpoCQeXYvLnHxTTxga71vduaOCwiKIR4IJBEKX9t+I6EOgFyTHWxLk9YTSsXUYHOYGHdV5TpTfam8K/83p79AF5CtjZoMuRHBXcLXALoBCjW9Vz05ITdhyOH/v5+r/4aZvLZoUhfKzmoyk2gCHrVaCRziEmKSRNtChlIokRQ5LOiZVOI740YI0DQzqA7PwhaWlZcOqKMjMkFUFiRkCPF/2KVAdja7h8vw/eGLEaFMphApu87eOH4G0+x5PxipnLJcwliMBGxRsnVPwSxLYFAyGBUlc9Y2la/hYlwhP9+FygWhKLKSkCGj/c0A/ocIpEKey6AKW7dFd8I5skjIp/MVBGUFSaGTVVRllQklhAhCHQQNaSRB2OpDWYIgSaK6gxBzbGEJAMU0eog/gxAgaiGVWlo4NqNWTWNTEHOD54cgTH1YoBZZEc2nPmowv2vnfTc4DsuxIq1bj8a0NkJ6eHgeY/Y0AIUMT6tvKhPQIlZ1A0eprN/XzUrKXX/eR2ziWREzf1E/jl0wq2YyLEftQ4gR0ML08Ocz2Bsv+opPvwznCjrndLLR86Y1yQzE7KM4jFkhLUiDjWvZOR6KI4YfU98kHOhBCwiJUQt1nDguO8OlCA6LMGYXNedjiNIZpF7jHqf74ZmHyj4Uh4XqT5+5P29a8P5s/ueLhecv7dWFgR5CMyqN83OYXy8XWZfkq8Iwwy72fvlrz3pPNoW+vexH32cXQRoaPM9epC8w58praHqas/S9sXcFy1i4XOtGNHF0Zqo5DGaEMGY/SaPnRNd5StGn1LrG7AIZcuNdx3ob17xMbnZRqxvy2eLQSz+b/pPWh/1VFP5b9ZPzbQOEgpaCpjkg7P4sNSiwQ03f50vL2lb61piLvcm7bR9x+P+wakOvCwPfSJUkFDQ6UgqSw7ZoZBoDm3c3a+6paB0ATkBH8XabgohIqetS9D2UnN/95F3H/31n3joh+07lXWUC3VO5VzkdgffY/cC2r7r5AkUFF3qK+fQdrEjLCffUaizU7tV+Z2ytWq5mZvyx/NDRoiZRcv87MX9Wu0tK5qtr39J9tRy1+4k5mvSc5JxiiDWN/BBzyL4FEMRNPCu037T+1pZcJXe1kEytv4L08GEUiKyHj25J3OLuoyiwb5cWGmYsST4hDXaMWg7qJQ7//PlYHJTISocljrS0n4pJbm0yRFcD5Y0pxCOkQEgq6CiQYnTivIZGciLdsJCoTv7XhmTgdTAT2h3qwewB1sp2YHsKMwtZSXsWjzoSyE47MpuCnduQRMHbmYawhfkyFlEoOIJojKCdESCCh1U/6ysEBSkqBQUqjrUhnGIQ11Do6SF+q/+u9zBqZC0QmC+fNSjPK19+0r8yTjbklxueP4oN0QFlGQhsfPtOIDZsEmmF9M5hAfGT4UkYZ4XtljspoGKxMshQVUUOibae9xfrYHgoCErmQobbChF3DBLunqCg5omgqKRZUDUsjDm6pl04JwqpgqGAILjKG4EibgdKOB/KuAdBRdOToIr3KkA2fO/N6AongIzyYcdCW/KM4EQmazhFucgyIQTQPSb1vl79L4JmgNwxWicN+RqaeTTACkwTsR3zwWcEJ1V3kkL3BswXMNihAoVIBpcelqiIcjuYtLhtx11bSyCmUeWgENmK8FEOwUQPG2E2GyVo55dM2CnOE8FNq8og1tQwJFcq1M9nq08Y9F+yjgDo/ffX1kMiIT1HRKdj2uBE0kYaq4/ERu3scUgRQOPRCop2QzHEkEIhFEtbjWM3pFHNwqc6drVqoNMow5wbGu1spUX0onI5oWcY) format('woff2'),
                url(data:application/font-woff;charset=utf-8;base64,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) format('woff'),
                url('zaofont.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
        }

        .zf-jiantou:before { font-family: 'zaofont';content: "\\e695";}

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
