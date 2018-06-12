import React from 'react'
import {Lib}from '../context/componentsLib'


export class AddNewClass extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      currentType: '',
      classList: [],
    }
  }

  renderList () {
    let arr = []
    for (let className in this.props.libContext.classShow) {
      arr.push(<div style={className === this.state.currentType ? {color: 'red'} : {}} key={className} onClick={() => {this.chooseClass(className)}}>{className}</div>)
    }
    return <div>
      {arr}
    </div>
  }

  chooseClass (currentType) {
    this.setState({
      currentType: currentType
    })
    // this.props.setCurrentClass(addClassJson)
  }

  plusClassTo () {
    if (this.state.currentType) {
      let addClassJson = this.props.libContext.getLib(this.state.currentType, 'class')
      // 去重
      let ifHave = this.props.node.classInfo.find((originClass) => {
        if (addClassJson.name === originClass.name) {
          return true
        }
      })
      if (!ifHave) {
        this.props.saveToCache()
        this.props.node.classInfo.push(addClassJson)
        this.props.updateClassName()
      }
    }
  }

  render () {
    // 循环
    return <div className='choose-class-out'>
        {this.renderList()}
        <div onClick={() => {this.plusClassTo()}}>导入样式</div>
        <style jsx>{`
        .choose-class-out {
          border: 1px solid black;
          display: flex;
          width: 100%;
          justify-content: space-between;
        }
      `}</style>
      </div>
  }
}

export default function (props) {
  return <Lib.Consumer>
    {libContext => (<AddNewClass libContext={libContext} {...props} />)}
  </Lib.Consumer>
}