import React from 'react'
import EditClassName from '../components/editClassName'
import EditText from '../components/editText'
import AddComponent from '../components/addComponent'
import AddNewClass from '../components/addNewClass'
import NodeToTree from './nodeToTree'
import NodeToDom from '../components/nodeToDom'

// container 承载了最顶层的node的增减修改大权。所有node属性修改都在这里完成。其他组件来担负渲染而已。

export default class extends React.Component {
  constructor (props) {
    super(props)
    this.resetArr = []
    this.state = {
      currentDomIndex: this.props.node.index,
      currenEditeDom: this.props.node,
      currentClassJson: []
    }
    this.onSelectDom = this.onSelectDom.bind(this)
    this.updateNode = this.updateNode.bind(this)
    this.saveToCache = this.saveToCache.bind(this)
    this.updateClassName = this.updateClassName.bind(this)
    this.setCurrentClass = this.setCurrentClass.bind(this)
  }

  cachePush (node) {
    let cacheNode = JSON.parse(JSON.stringify(node))
    if (this.resetArr.length >= 30) {
      this.resetArr.shift()
    }
    this.resetArr.push(cacheNode)
  }

  cacheReset () {
    if (this.resetArr.length > 0) {
      this.props.updateNode(this.resetArr.pop())
    } else {
      console.warn('最多还原 x 步')
    }
  }

  saveToCache () {
    this.cachePush(this.props.node)
  }


  // renderClassArray (node) {
  //   let {name, attrs, children, classInfo} = node
  //   if (children) {
  //     let cArr = children.map((node, index) => {
  //       return this.renderClassArray(node)
  //     }) || []
  //     if (node.classInfo) {
  //       cArr.unshift(<EditClassName EditClassNameChange={(...e) => {this.EditClassNameChange(node, ...e)}} classNameArr={node.classInfo} updateNode={this.updateNode} node={node} />)
  //     }
  //       return cArr
  //   } else {
  //     if (node.classInfo) {
  //       return <EditClassName EditClassNameChange={(...e) => {this.EditClassNameChange(node, ...e)}} classNameArr={node.classInfo} updateNode={this.updateNode} node={node} />
  //     }
  //   }
  // }

  onSelectDom (findIndex) {
    let findNode
    if (findIndex) {
      findNode = this.getNode(this.props.node, findIndex)
      this.setState({
        currentDomIndex: findNode.index,
        currenEditeDom: findNode
      })
      this.props.changeCurrentDom(findNode)
    }
  }

  getNode (node, findIndex) {
    if (node.index === findIndex) {
      // 查找到
      if (node.index === this.props.node.index) {
        // 如果就是本人
        return node
      } else {
        return false
      }
    } else {
      let findElement = true
      if (node.children) {
        node.children.every((item, index) => {
          let result = this.getNode(item, findIndex)
          if (result === true ) {
            return true
          } else if (result === false) {
            // 如果查找到
            findElement = item
            return false
          } else {
            findElement = result
            return false
          }
        })
      }
      return findElement
    }
  }

  updateNode (nextNode) {
    this.saveToCache()
    this.props.updateNode(nextNode)
  }

  updateClassName () {
    this.props.updateNode(this.props.node)
  }

  setCurrentClass (classJson) {
    this.setState({
      currentClassJson: classJson
    })
  }

  // 从组建库中添加组建。
  // 实现外部内部的删减。

  render () {
    let {node} = this.props
    if (node) {
      // 循环
      return <div>
        <div className='menu-out-column'>
          <div style={{width: '375px'}} className='zao-flex-shrink zao-flex-column'>
            <NodeToDom getLibByType={this.props.getLibByType} currentDomIndex={this.state.currentDomIndex} onSelectDom={this.onSelectDom} node={node} />
            <div onClick={() => {this.cacheReset()}}>还原</div>
            {this.props.slot1}
          </div>
          <div style={{width: '220px'}}>
            {this.props.slot2}
            <AddComponent getLibByType={this.props.getLibByType} currentDomIndex={this.state.currentDomIndex} updateNode={this.updateNode} node={node}  />
            <AddNewClass node={this.state.currenEditeDom} saveToCache={this.saveToCache} updateClassName={this.updateClassName} />
          </div>
          <NodeToTree onSelectDom={this.onSelectDom} node={node} updateNode={this.updateNode} />
          {this.state.currenEditeDom.nodeType === 'node-text' ?
            <EditText node={this.state.currenEditeDom} saveToCache={this.saveToCache} updateClassName={this.updateClassName} /> : <EditClassName getLibByType={this.props.getLibByType} libContext={this.props.libContext} node={this.state.currenEditeDom} saveToCache={this.saveToCache} updateClassName={this.updateClassName} />
          }
        </div>
        <style jsx>{`
          .menu-out-column {
            display: flex;
            justify-content: flex-start;
          }
      `}</style>
      </div>
    } else {
      return null
    }

  }
}